import ProjectPage from "@/components/ProjectPage";
import { getProject, getTasks } from "@/db";

export default async function Project({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  const tasks = await getTasks(id);
  return (
    <div className="w-full flex flex-col gap-16">
      <ProjectPage
        name={project.name}
        id={project.id}
        project={project}
        tasksArray={tasks}
      />
    </div>
  );
}
