import TaskPage from "@/components/TaskPage";
import { getTask, getMaterials, getTasks } from "@/db";

export default async function Task({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const task = await getTask(id);
  const tasksArray = await getTasks(task.projectId);
  const materials = await getMaterials(id);
  return (
    <div className="w-full flex flex-col gap-16">
      <TaskPage
        name={task.name}
        task={task}
        materialsArray={materials}
        tasksArray={tasksArray}
      />
    </div>
  );
}
