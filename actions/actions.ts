"use server";
import bcrypt from "bcrypt";
import { db, setStartDateRecursively } from "@/db";
import { materials, projects, tasks, users } from "@/db/schema";

// import { verifySession } from "@/utils/session";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createSession, verifySession } from "@/utils/session";
import * as z from "zod";

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
  };

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
    startDate: z.date(),
    duration: z.coerce.number(),
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
  };

  const validatedFields = Project.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errors = z.flattenError(validatedFields.error);
    return { errors: errors.fieldErrors };
  } else {
    const project = validatedFields.data;
    await db
      .update(projects)
      .set({
        name: project.name,
        budget: project.budget,
        createdBy: result[0].id,
        duration: project.duration,
        description: project.description,
        startDate: project.startDate,
      })
      .where(eq(projects.id, id));

    if (project.startDate) {
      const childTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.name, "None (Start of project)"));
      childTasks.forEach((task) =>
        setStartDateRecursively(task.id, project.startDate)
      );
    }
    redirect(`/project/${id}`);
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
  });

  const rawFormData = {
    name: formdata.get("task-name"),
    budget: formdata.get("task-budget"),
    description: formdata.get("task-description"),
    duration: formdata.get("task-duration"),
    parent: formdata.get("task-parent"),
    startDate: date,
  };

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
        newDate?.setDate(newDate.getDate() + parentTask[0].duration);
        startDate = newDate;
      }
    }

    await db.insert(tasks).values({
      projectId: result[0].id,
      name: task.name,
      budget: task.budget,
      duration: task.duration,
      description: task.description,
      parentTaskId: task.parent,
      startDate: startDate,
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
  });

  const rawFormData = {
    name: formdata.get("task-name"),
    budget: formdata.get("task-budget"),
    description: formdata.get("task-description"),
    duration: formdata.get("task-duration"),
    parent: formdata.get("task-parent"),
    startDate: date,
  };

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
        newDate?.setDate(newDate.getDate() + parentTask[0].duration);
        startDate = newDate;
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
