import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { materials, projects, tasks, users } from "./schema";
import { eq, sql } from "drizzle-orm";
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

export async function getRecentProjects() {
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
    .where(eq(projects.createdBy, userResult[0].id))
    .limit(10);
  return projectResult;
}

export async function getProject(id: number) {
  const projectResult = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));
  return projectResult[0];
}

export async function setProjectOngoing(id: number, ongoing: boolean) {
  await db
    .update(projects)
    .set({
      isOngoing: ongoing,
    })
    .where(eq(projects.id, id));
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
  const recursiveCte = sql`
    WITH RECURSIVE tasksCte AS (
      SELECT
        id,
        parentTaskId,
        startDate,
        duration,
        ${date} AS newStartDate
      FROM tasks
      WHERE id = ${id}

      UNION ALL

      SELECT
        t.id,
        t.parentTaskId,
        t.startDate,
        t.duration,
        DATE_ADD(tc.newStartDate, INTERVAL tc.duration WEEK) AS newStartDate
      FROM tasks t
      JOIN tasksCte tc ON t.parentTaskId = tc.id
    )
    UPDATE tasks
    JOIN tasksCte ON tasks.id = tasksCte.id
    SET tasks.startDate = tasksCte.newStartDate
  `;
  await db.execute(recursiveCte);
}

export async function getGanttChartData(projectId: number) {
  const tasksResult = await db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  const promise = tasksResult.map(async (task) => {
    const endDate = new Date(task.startDate!);
    endDate.setDate(endDate.getDate() + task.duration * 7);

    return {
      id: task.id.toString(),
      name: task.name,
      start: task.startDate!.toISOString().slice(0, 10),
      end: endDate.toISOString().slice(0, 10),
      dependencies: task.parentTaskId ? task.parentTaskId.toString() : "",
      progress: task.status == "completed" ? 100 : 0,
    };
  });

  const result = await Promise.all(promise);

  const ganttData = result.filter((task) => {
    return task.name != "None (Start of project)";
  });

  return ganttData;
}
