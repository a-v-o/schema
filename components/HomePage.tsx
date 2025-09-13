"use client";

import { createProject, deleteProject } from "@/actions/actions";
import { projects } from "@/db/schema";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "./ui/table";
import ProjectDialog from "./ProjectDialog";
import { Trash, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { useActionState } from "react";

const initialState = {
  message: "",
};

export default function HomePage({
  projectsArray,
}: {
  projectsArray: (typeof projects.$inferSelect)[];
}) {
  const [state, formAction, pending] = useActionState(
    deleteProject,
    initialState
  );

  return (
    <section className="w-full min-h-screen pt-8 md:p-8 flex flex-col gap-16">
      <h1 className="text-4xl font-bold">Recents</h1>
      <ProjectDialog createAction={createProject} />
      <div className="w-full">
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
            {projectsArray?.map((project) => {
              return (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>
                    {project.startDate
                      ? project.startDate?.toDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>{project.duration}</TableCell>

                  <TableCell>
                    <Link
                      href={`/project/${project.id}`}
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
                          <AlertDialogTitle>Delete Project</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this project. This
                            is irreversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <form action={formAction}>
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
                    {/* <p>{state?.message}</p> */}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {/* <Draw /> */}
    </section>
  );
}
