"use client";

import { createTask, deleteTask, editProject } from "@/actions/actions";
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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { AlertDialogHeader, AlertDialogFooter } from "./ui/alert-dialog";
import { useActionState } from "react";

const initialState = {
  message: "",
};

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
  const [state, formAction, pending] = useActionState(deleteTask, initialState);
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
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger className="cursor-pointer">
                          <Trash2 color="red" size={20} />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this task.
                              Deleting this task deletes all dependent tasks.
                              Try changing the parent all dependent tasks before
                              deleting this task. This action is irreversible
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <form action={formAction}>
                              <input
                                type="hidden"
                                name="taskId"
                                value={task.id}
                              />
                              <input
                                type="hidden"
                                name="projectId"
                                value={project.id}
                              />
                              <Button
                                variant="destructive"
                                pending={pending}
                                type="submit"
                                className="w-full"
                              >
                                Delete
                              </Button>
                            </form>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
