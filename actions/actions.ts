"use server";
import bcrypt from "bcrypt";
import { db, setStartDateRecursively } from "@/db";
import { materials, projects, tasks, users } from "@/db/schema";

// import { verifySession } from "@/utils/session";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { createSession, verifySession } from "@/utils/session";
import * as z from "zod";
import { revalidatePath } from "next/cache";

export async function createProject(
  date: Date | undefined,
  prevState: Record<string, Record<string, string[]>> | undefined,
  formdata: FormData
) {
  const Project = z.object({
    name: z.string().min(1),
    budget: z.coerce.number(),
    description: z.string().min(1),
    startDate: z.date().optional(),
    duration: z.coerce.number(),
    fixedBudget: z.boolean(),
    fixedDuration: z.boolean(),
  });
  const session = await verifySession();
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));

  const rawFormData = {
    name: formdata.get("project-name"),
    startDate: date,
    budget: formdata.get("project-budget"),
    description: formdata.get("project-description"),
    duration: formdata.get("project-duration"),
    fixedBudget: !formdata.get("budget-checkbox"),
    fixedDuration: !formdata.get("duration-checkbox"),
  };

  if (rawFormData.fixedBudget && !rawFormData.budget) {
    return {
      errors: {
        budget: [
          "Set a fixed budget or check the box below to set it equal to the total of task budgets",
        ],
      },
    };
  }

  if (!rawFormData.fixedBudget && rawFormData.budget) {
    return {
      errors: {
        budget: ["You cannot set a fixed budget if you checked the box below"],
      },
    };
  }

  if (rawFormData.fixedDuration && !rawFormData.duration) {
    return {
      errors: {
        duration: [
          "Set a fixed duration or check the box below to set it equal to the total of task durations",
        ],
      },
    };
  }

  if (!rawFormData.fixedDuration && rawFormData.duration) {
    return {
      errors: {
        duration: [
          "You cannot set a fixed duration if you checked the box below",
        ],
      },
    };
  }

  const validatedFields = Project.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errors = z.flattenError(validatedFields.error);
    return { errors: errors.fieldErrors };
  } else {
    const project = validatedFields.data;
    const insertedProject = await db
      .insert(projects)
      .values({
        name: project.name,
        budget: project.budget,
        createdBy: result[0].id,
        duration: project.duration,
        description: project.description,
        startDate: project.startDate,
        fixedBudget: project.fixedBudget,
        fixedDuration: project.fixedDuration,
      })
      .$returningId();

    await db.insert(tasks).values({
      projectId: insertedProject[0].id,
      name: "None (Start of project)",
      budget: 0,
      duration: 0,
      description:
        "Buffer task for setting date for taks that start at project start",
      parentTaskId: null,
      startDate: project.startDate,
    });
    redirect(`/`);
  }
}

export async function editProject(
  id: number,
  date: Date | undefined,
  prevState: Record<string, Record<string, string[]>> | undefined,
  formdata: FormData
) {
  const Project = z.object({
    name: z.string().min(1),
    budget: z.coerce.number(),
    description: z.string().min(1),
    startDate: z.date().optional(),
    duration: z.coerce.number(),
    fixedBudget: z.boolean(),
    fixedDuration: z.boolean(),
  });
  const session = await verifySession();
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));

  const rawFormData = {
    name: formdata.get("project-name"),
    startDate: date,
    budget: formdata.get("project-budget"),
    description: formdata.get("project-description"),
    duration: formdata.get("project-duration"),
    fixedBudget: !formdata.get("budget-checkbox"),
    fixedDuration: !formdata.get("duration-checkbox"),
  };

  if (rawFormData.fixedBudget && !rawFormData.budget) {
    return {
      errors: {
        budget: [
          "Set a fixed budget or check the box below to set it equal to the total of task budgets",
        ],
      },
    };
  }

  if (!rawFormData.fixedBudget && rawFormData.budget) {
    return {
      errors: {
        budget: ["You cannot set a fixed budget if you checked the box below"],
      },
    };
  }

  if (rawFormData.fixedDuration && !rawFormData.duration) {
    return {
      errors: {
        duration: [
          "Set a fixed duration or check the box below to set it equal to the total of task durations",
        ],
      },
    };
  }

  if (!rawFormData.fixedDuration && rawFormData.duration) {
    return {
      errors: {
        duration: [
          "You cannot set a fixed duration if you checked the box below",
        ],
      },
    };
  }

  const validatedFields = Project.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errors = z.flattenError(validatedFields.error);
    return { errors: errors.fieldErrors };
  } else {
    const project = validatedFields.data;
    let budget = project.budget;
    let duration = project.duration;

    if (!project.fixedBudget) {
      const budgets = await db
        .select({ budget: tasks.budget })
        .from(tasks)
        .where(eq(tasks.projectId, id));
      const budgetAmounts = budgets.map((budget) => {
        return budget.budget;
      });
      budget =
        budgetAmounts.reduce((total, current) => {
          return (total || 0) + (current || 0);
        }, 0) || 0;
    }

    if (project.budget > 0) {
      const budgets = await db
        .select({ budget: tasks.budget })
        .from(tasks)
        .where(eq(tasks.projectId, id));
      const budgetAmounts = budgets.map((budget) => {
        return budget.budget;
      });
      const totalBudgetAmount =
        budgetAmounts.reduce((total, current) => {
          return (total || 0) + (current || 0);
        }, 0) || 0;
      if (project.budget < totalBudgetAmount) {
        return {
          errors: {
            budget: [
              "Budget set is less than total budget of tasks. Please edit tasks or set a higher amount",
            ],
          },
        };
      }
    }

    if (!project.fixedDuration) {
      const durations = await db
        .select({ duration: tasks.duration })
        .from(tasks)
        .where(eq(tasks.projectId, id));
      const durationAmounts = durations.map((duration) => {
        return duration.duration;
      });
      duration =
        durationAmounts.reduce((total, current) => {
          return (total || 0) + (current || 0);
        }, 0) || 0;
    }

    if (project.duration > 0) {
      const durations = await db
        .select({ duration: tasks.duration })
        .from(tasks)
        .where(eq(tasks.projectId, id));
      const durationAmounts = durations.map((duration) => {
        return duration.duration;
      });
      const totalDurationAmount =
        durationAmounts.reduce((total, current) => {
          return (total || 0) + (current || 0);
        }, 0) || 0;
      if (project.duration < totalDurationAmount) {
        return {
          errors: {
            duration: [
              "Duration set is less than total duration of tasks. Please edit tasks or set a higher duration",
            ],
          },
        };
      }
    }

    await db
      .update(projects)
      .set({
        name: project.name,
        budget: budget,
        createdBy: result[0].id,
        duration: duration,
        description: project.description,
        startDate: project.startDate,
        fixedBudget: project.fixedBudget,
        fixedDuration: project.fixedDuration,
      })
      .where(eq(projects.id, id));

    if (project.startDate != undefined) {
      const bufferTasks = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.name, "None (Start of project)"),
            eq(tasks.projectId, id)
          )
        );

      await setStartDateRecursively(bufferTasks[0].id, project.startDate!);
    }
    redirect(`/project/${id}`);
  }
}

export async function deleteProject(
  prevState:
    | {
        message: string;
      }
    | undefined,
  formdata: FormData
) {
  const id = Number(formdata.get("projectId"));
  try {
    await db.delete(projects).where(eq(projects.id, id));
    revalidatePath("/");
  } catch {
    return { message: "Something went wrong" };
  }
}

export async function deleteTask(
  prevState:
    | {
        message: string;
      }
    | undefined,
  formdata: FormData
) {
  const taskId = Number(formdata.get("taskId"));
  const projectId = Number(formdata.get("projectId"));
  try {
    await db.delete(tasks).where(eq(tasks.id, taskId));
    revalidatePath(`/project/${projectId}`);
  } catch {
    return { message: "Something went wrong" };
  }
}

export async function deleteMaterial(
  prevState:
    | {
        message: string;
      }
    | undefined,
  formdata: FormData
) {
  const materialId = Number(formdata.get("materialId"));
  const taskId = Number(formdata.get("taskId"));
  try {
    await db.delete(materials).where(eq(materials.id, materialId));
    revalidatePath(`/task/${taskId}`);
  } catch {
    return { message: "Something went wrong" };
  }
}

export async function createTask(
  projectId: number,
  date: Date | undefined,
  prevState: Record<string, Record<string, string[]>> | undefined,
  formdata: FormData
) {
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  const Task = z.object({
    name: z.string().min(1),
    description: z.string(),
    duration: z.coerce.number(),
    budget: z.coerce.number(),
    parent: z.coerce.number(),
    startDate: z.date().optional(),
    fixedBudget: z.boolean(),
  });

  const rawFormData = {
    name: formdata.get("task-name"),
    budget: formdata.get("task-budget"),
    description: formdata.get("task-description"),
    duration: formdata.get("task-duration"),
    parent: formdata.get("task-parent"),
    startDate: date,
    fixedBudget: !formdata.get("budget-checkbox"),
  };

  if (rawFormData.fixedBudget && !rawFormData.budget) {
    return {
      errors: {
        budget: [
          "Set a fixed budget or check the box below to set it equal to the total of material budgets",
        ],
      },
    };
  }

  if (!rawFormData.fixedBudget && rawFormData.budget) {
    return {
      errors: {
        budget: ["You cannot set a fixed budget if you checked the box below"],
      },
    };
  }

  if (!date && !rawFormData.parent) {
    return {
      errors: {
        startDate: ["Please enter a start date or choose parent task"],
      },
    };
  }

  if (date && rawFormData.parent) {
    return {
      errors: {
        startDate: [
          "Please enter either a start date or choose parent task, not both",
        ],
      },
    };
  }

  const validatedFields = Task.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errors = z.flattenError(validatedFields.error);
    return { errors: errors.fieldErrors };
  } else {
    const task = validatedFields.data;
    let startDate = task.startDate;
    if (task.parent) {
      const parentTask = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, task.parent));
      if (parentTask[0].startDate) {
        const newDate = parentTask[0].startDate;
        newDate?.setDate(newDate.getDate() + parentTask[0].duration * 7 + 1);
        startDate = newDate;
      }
    }

    if (task.budget > 0) {
      const projectBudgetIsFixed = result[0].fixedBudget;
      const projectBudget = result[0].budget;

      const budgets = await db
        .select({ budget: tasks.budget })
        .from(tasks)
        .where(eq(tasks.projectId, result[0].id));

      const totalBudget =
        budgets
          .map((budget) => {
            return budget.budget;
          })
          .reduce((total, current) => {
            return (total || 0) + (current || 0);
          }, 0) || 0;

      if (projectBudgetIsFixed && task.budget + totalBudget > projectBudget!) {
        return {
          errors: {
            budget: [
              "Budget set makes entire budget higher than total budget of the project. Set a lower amount or edit project budget",
            ],
          },
        };
      }
      if (!projectBudgetIsFixed) {
        await db
          .update(projects)
          .set({
            budget: (projectBudget || 0) + task.budget,
          })
          .where(eq(projects.id, result[0].id));
      }
    }

    const projectDurationIsFixed = result[0].fixedDuration;
    const projectDuration = result[0].duration;
    const durations = await db
      .select({ duration: tasks.duration })
      .from(tasks)
      .where(eq(tasks.projectId, result[0].id));

    const totalDuration =
      durations
        .map((duration) => {
          return duration.duration;
        })
        .reduce((total, current) => {
          return (total || 0) + (current || 0);
        }, 0) || 0;

    if (
      projectDurationIsFixed &&
      task.duration + totalDuration > projectDuration!
    ) {
      return {
        errors: {
          duration: [
            "Duration set makes entire duration higher than total duration of the project. Set a lower duration or edit project duration",
          ],
        },
      };
    }
    if (!projectDurationIsFixed) {
      await db
        .update(projects)
        .set({
          duration: (projectDuration || 0) + task.duration,
        })
        .where(eq(projects.id, result[0].id));
    }

    await db.insert(tasks).values({
      projectId: result[0].id,
      name: task.name,
      budget: task.budget,
      duration: task.duration,
      description: task.description,
      parentTaskId: task.parent,
      startDate: startDate,
      fixedBudget: task.fixedBudget,
    });

    redirect(`/project/${projectId}`);
  }
}

export async function editTask(
  id: number,
  date: Date | undefined,
  prevState: Record<string, Record<string, string[]>> | undefined,
  formdata: FormData
) {
  const result = await db.select().from(tasks).where(eq(tasks.id, id));

  const Task = z.object({
    name: z.string().min(1),
    description: z.string(),
    duration: z.coerce.number(),
    budget: z.coerce.number(),
    parent: z.coerce.number(),
    startDate: z.date().optional(),
    fixedBudget: z.boolean(),
  });

  const rawFormData = {
    name: formdata.get("task-name"),
    budget: formdata.get("task-budget"),
    description: formdata.get("task-description"),
    duration: formdata.get("task-duration"),
    parent: formdata.get("task-parent"),
    startDate: date,
    fixedBudget: !formdata.get("budget-checkbox"),
  };

  if (rawFormData.fixedBudget && !rawFormData.budget) {
    return {
      errors: {
        budget: [
          "Set a fixed budget or check the box below to set it equal to the total of material budgets",
        ],
      },
    };
  }

  if (!rawFormData.fixedBudget && rawFormData.budget) {
    return {
      errors: {
        budget: ["You cannot set a fixed budget if you checked the box below"],
      },
    };
  }

  if (!date && !rawFormData.parent) {
    return {
      errors: {
        startDate: ["Please enter a start date or choose parent task"],
      },
    };
  }

  if (date && rawFormData.parent) {
    return {
      errors: {
        startDate: [
          "Please enter either a start date or choose parent task, not both",
        ],
      },
    };
  }

  const validatedFields = Task.safeParse(rawFormData);

  if (validatedFields.data?.parent == result[0].id) {
    return {
      errors: { parent: ["Parent cannot be self"] },
    };
  }

  if (!validatedFields.success) {
    const errors = z.flattenError(validatedFields.error);
    return { errors: errors.fieldErrors };
  } else {
    const task = validatedFields.data;
    let startDate = task.startDate;
    if (task.parent) {
      const parentTask = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, task.parent));
      if (parentTask[0].startDate) {
        const newDate = parentTask[0].startDate;
        newDate?.setDate(newDate.getDate() + parentTask[0].duration * 7 + 1);
        startDate = newDate;
      }

      if (task.budget > 0) {
        const project = await db
          .select()
          .from(projects)
          .where(eq(projects.id, result[0].projectId));
        const projectBudgetIsFixed = project[0].fixedBudget;
        const projectBudget = project[0].budget;

        const budgets = await db
          .select({ budget: tasks.budget })
          .from(tasks)
          .where(eq(tasks.projectId, result[0].projectId));

        const totalBudget =
          budgets
            .map((budget) => {
              return budget.budget;
            })
            .reduce((total, current) => {
              return (total || 0) + (current || 0);
            }, 0) || 0;

        const finalBudget =
          totalBudget == 0 ? 0 : totalBudget - (result[0].budget || 0);

        if (
          projectBudgetIsFixed &&
          task.budget + finalBudget > projectBudget!
        ) {
          return {
            errors: {
              budget: [
                "Budget set makes entire budget higher than total budget of the project. Set a lower amount or edit project budget",
              ],
            },
          };
        }
        if (!projectBudgetIsFixed) {
          await db
            .update(projects)
            .set({
              budget:
                (projectBudget || 0) - (result[0].budget || 0) + task.budget,
            })
            .where(eq(projects.id, result[0].projectId));
        }

        const materialBudgets = await db
          .select({ budget: materials.price })
          .from(materials)
          .where(eq(materials.taskId, id));
        const totalMaterialsBudget =
          materialBudgets
            .map((budget) => {
              return budget.budget;
            })
            .reduce((total, current) => {
              return (total || 0) + (current || 0);
            }, 0) || 0;
        if (task.budget < totalMaterialsBudget) {
          return {
            errors: {
              budget: [
                "Budget set is less than total budget of materials. Please edit materials or set a higher amount",
              ],
            },
          };
        }
      }

      if (task.duration > 0) {
        const project = await db
          .select()
          .from(projects)
          .where(eq(projects.id, result[0].projectId));

        const projectDurationIsFixed = project[0].fixedDuration;
        const projectDuration = project[0].duration;
        const durations = await db
          .select({ duration: tasks.duration })
          .from(tasks)
          .where(eq(tasks.projectId, result[0].projectId));

        const totalDuration =
          durations
            .map((duration) => {
              return duration.duration;
            })
            .reduce((total, current) => {
              return (total || 0) + (current || 0);
            }, 0) - result[0].duration || 0;

        if (
          projectDurationIsFixed &&
          task.duration + totalDuration > projectDuration!
        ) {
          return {
            errors: {
              duration: [
                "Duration set makes entire duration higher than total duration of the project. Set a lower duration or edit project duration",
              ],
            },
          };
        }
        if (!projectDurationIsFixed) {
          await db
            .update(projects)
            .set({
              duration:
                (projectDuration || 0) -
                (result[0].duration || 0) +
                task.duration,
            })
            .where(eq(projects.id, result[0].projectId));
        }
      }
    }

    await db
      .update(tasks)
      .set({
        name: task.name,
        budget: task.budget,
        duration: task.duration,
        description: task.description,
        parentTaskId: task.parent,
        startDate: startDate,
        fixedBudget: task.fixedBudget,
      })
      .where(eq(tasks.id, id));

    redirect(`/project/${result[0].projectId}`);
  }
}

export async function login(
  prevState: Record<string, Record<string, string[]>> | undefined,
  formdata: FormData
) {
  const User = z.object({
    email: z.email(),
    password: z.string(),
  });

  const UserRequired = User.required();

  const rawFormData = {
    email: formdata.get("email"),
    password: formdata.get("password"),
  };

  const validatedFields = UserRequired.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errors = z.flattenError(validatedFields.error);
    return { errors: errors.fieldErrors };
  } else {
    const user = validatedFields.data;
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email));

    if (result.length === 0) {
      return { errors: { email: ["User doesn't exist"] } };
    }

    if (!bcrypt.compare(user.password, result[0].password)) {
      return { errors: { password: ["Wrong password!"] } };
    }
    await createSession(result[0].email);
  }
}

export async function signUp(
  prevState: Record<string, Record<string, string[]>> | undefined,
  formdata: FormData
) {
  const User = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string(),
  });

  const UserRequired = User.required();

  const rawFormData = {
    name: formdata.get("name"),
    email: formdata.get("email"),
    password: formdata.get("password"),
  };

  const validatedFields = UserRequired.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errors = z.flattenError(validatedFields.error);
    return { errors: errors.fieldErrors };
  } else {
    const user = validatedFields.data;
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.name, user.name));

    if (userResult.length > 0) {
      return { errors: { email: ["User already exists"] } };
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    await db.insert(users).values({
      name: user.name,
      email: user.email,
      password: hashedPassword,
    });
    await createSession(user.email);
  }
}

export async function addMaterial(
  taskId: number,
  prevState: Record<string, Record<string, string[]>> | undefined,
  formdata: FormData
) {
  const result = await db.select().from(tasks).where(eq(tasks.id, taskId));

  const Material = z.object({
    name: z.string().min(1),
    description: z.string(),
    unit: z.string().min(1),
    price: z.coerce.number().min(1),
    quantity: z.coerce.number().min(1),
  });

  const rawFormData = {
    name: formdata.get("material"),
    price: formdata.get("price"),
    quantity: formdata.get("quantity"),
    description: formdata.get("description"),
    unit: formdata.get("unit"),
  };

  const validatedFields = Material.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errors = z.flattenError(validatedFields.error);
    return { errors: errors.fieldErrors };
  } else {
    const material = validatedFields.data;

    if (material.price > 0) {
      const taskBudgetIsFixed = result[0].fixedBudget;
      const taskBudget = result[0].budget;

      const budgets = await db
        .select({ budget: materials.price })
        .from(materials)
        .where(eq(materials.taskId, result[0].id));

      const totalBudget =
        budgets
          .map((budget) => {
            return budget.budget;
          })
          .reduce((total, current) => {
            return (total || 0) + (current || 0);
          }, 0) || 0;

      if (taskBudgetIsFixed && material.price + totalBudget > taskBudget!) {
        return {
          errors: {
            price: [
              "Budget set makes entire budget higher than total budget of the project. Set a lower amount or edit project budget",
            ],
          },
        };
      }
      if (!taskBudgetIsFixed) {
        await db
          .update(tasks)
          .set({
            budget: (taskBudget || 0) + material.price,
          })
          .where(eq(tasks.id, result[0].id));
      }
    }

    await db.insert(materials).values({
      name: material.name,
      price: material.price,
      description: material.description,
      quantity: material.quantity,
      unit: material.unit,
      taskId: taskId,
    });

    redirect(`/task/${taskId}`);
  }
}

export async function editMaterial(
  id: number,
  prevState: Record<string, Record<string, string[]>> | undefined,
  formdata: FormData
) {
  const result = await db.select().from(materials).where(eq(materials.id, id));
  const task = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, result[0].taskId));
  const Material = z.object({
    name: z.string().min(1),
    description: z.string(),
    unit: z.string().min(1),
    price: z.coerce.number().min(1),
    quantity: z.coerce.number().min(1),
  });

  const rawFormData = {
    name: formdata.get("material"),
    price: formdata.get("price"),
    quantity: formdata.get("quantity"),
    description: formdata.get("description"),
    unit: formdata.get("unit"),
  };

  const validatedFields = Material.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errors = z.flattenError(validatedFields.error);
    return { errors: errors.fieldErrors };
  } else {
    const material = validatedFields.data;
    if (material.price > 0) {
      const taskBudgetIsFixed = task[0].fixedBudget;
      const taskBudget = task[0].budget;

      const budgets = await db
        .select({ budget: materials.price })
        .from(materials)
        .where(eq(materials.taskId, task[0].id));

      const totalBudget =
        budgets
          .map((budget) => {
            return budget.budget;
          })
          .reduce((total, current) => {
            return (total || 0) + (current || 0);
          }, 0) - material.price || 0;

      if (taskBudgetIsFixed && material.price + totalBudget > taskBudget!) {
        return {
          errors: {
            price: [
              "Budget set makes entire budget higher than total budget of the project. Set a lower amount or edit project budget",
            ],
          },
        };
      }
      if (!taskBudgetIsFixed) {
        await db
          .update(tasks)
          .set({
            budget: (taskBudget || 0) + material.price,
          })
          .where(eq(tasks.id, task[0].id));
      }
    }
    await db
      .update(materials)
      .set({
        name: material.name,
        price: material.price,
        description: material.description,
        quantity: material.quantity,
        unit: material.unit,
      })
      .where(eq(materials.id, id));

    redirect(`/task/${task[0].id}`);
  }
}
