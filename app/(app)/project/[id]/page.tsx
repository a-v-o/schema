import ProjectPage from "@/components/ProjectPage";
import {
  getGanttChartData,
  getProject,
  getTasks,
  setProjectOngoing,
} from "@/db";

export default async function Project({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  let ganttData = null;
  if (!project.isOngoing) {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    today?.setMinutes(today.getMinutes() - offset);
    if (project.startDate && project.duration) {
      const projectEnd = new Date(project.startDate!);
      projectEnd!.setDate(projectEnd.getDate() + (project.duration || 0) * 7);
      if (today > project.startDate && today < projectEnd) {
        setProjectOngoing(id, true);
      }
    }
  }

  if (project.isOngoing) {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    today?.setMinutes(today.getMinutes() - offset);
    const projectEnd = new Date(project.startDate!);
    projectEnd!.setDate(projectEnd.getDate() + (project.duration || 0) * 7);
    if (today > projectEnd!) {
      setProjectOngoing(id, false);
    }
  }

  if (project.startDate) {
    ganttData = await getGanttChartData(id);
  }

  const tasks = await getTasks(id);
  return (
    <div className="w-full flex flex-col gap-16">
      <ProjectPage
        name={project.name}
        id={project.id}
        project={project}
        tasksArray={tasks}
        ganttData={ganttData}
      />
    </div>
  );
}
