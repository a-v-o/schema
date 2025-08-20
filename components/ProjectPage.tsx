"use client";

import { createTask, editProject } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import { projects, tasks } from "@/db/schema";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import ProjectDialog from "./ProjectDialog";
import TaskDialog from "./TaskDialog";
import GanttChart from "./Gantt";

export type GanttTask = {
  id: string;
  name: string;
  start: string;
  end: string;
  dependencies?: string;
  progress: number;
};

export default function ProjectPage({
  name,
  id,
  project,
  tasksArray,
  ganttData,
}: {
  name: string;
  id: number;
  project: typeof projects.$inferSelect;
  tasksArray: (typeof tasks.$inferSelect)[];
  ganttData?: GanttTask[] | null;
}) {
  return (
    <section className="w-full min-h-screen pt-8 md:p-8 flex flex-col gap-16">
      <div>
        <h1 className="text-4xl font-semibold">{name.toUpperCase()}</h1>
      </div>
      <div className="flex flex-col gap-16 relative">
        <div className="flex justify-between items-center">
          <h2 className="text-xl">Tasks</h2>
          <div className="flex gap-4">
            <TaskDialog
              id={id}
              createAction={createTask}
              tasksArray={tasksArray}
            />
            <ProjectDialog editAction={editProject} project={project} id={id} />
          </div>
        </div>
        <div>{ganttData ? <GanttChart ganttData={ganttData} /> : null}</div>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Start date</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasksArray?.map((task) => {
                return task.name === "None (Start of project)" ? null : (
                  <TableRow key={task.id}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      {task.startDate ? task.startDate?.toDateString() : "N/A"}
                    </TableCell>
                    <TableCell>{task.duration}</TableCell>

                    <TableCell>
                      <Link
                        href={`/task/${task.id}`}
                        className="text-blue-500 underline"
                      >
                        View more
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <Link href={`/quotation/${id}`} className="self-end">
          <Button className="w-fit">Get quotation</Button>
        </Link>
      </div>
    </section>
  );
}
