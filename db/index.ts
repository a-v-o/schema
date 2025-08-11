import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { materials, projects, tasks, users } from "./schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/utils/session";
import { redirect } from "next/navigation";

export const db = drizzle(process.env.DATABASE_URL!);

export async function getProjects() {
  const session = await verifySession();
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, session.email));

  if (userResult.length == 0) {
    redirect("/signUp");
  }

  const projectResult = await db
    .select()
    .from(projects)
    .where(eq(projects.createdBy, userResult[0].id));
  return projectResult;
}

export async function getProject(id: number) {
  const projectResult = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));
  return projectResult[0];
}

export async function getTasks(id: number) {
  const tasksResult = await db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, id));
  return tasksResult;
}

export async function getTask(id: number) {
  const tasksResult = await db.select().from(tasks).where(eq(tasks.id, id));
  return tasksResult[0];
}

export async function getMaterials(id: number) {
  const materialsResult = await db
    .select()
    .from(materials)
    .where(eq(materials.taskId, id));
  return materialsResult;
}

export async function setStartDateRecursively(id: number, date: Date) {
  const parentTask = await db.select().from(tasks).where(eq(tasks.id, id));
  await db
    .update(tasks)
    .set({
      startDate: date,
    })
    .where(eq(tasks.id, id));
  const childTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.parentTaskId, id));
  if (childTasks.length > 0) {
    childTasks.forEach((task) => {
      const date = parentTask[0].startDate;
      date?.setDate(date.getDate() + parentTask[0].duration);
      setStartDateRecursively(task.id, date!);
    });
  }
}
