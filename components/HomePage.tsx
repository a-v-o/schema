"use client";

import { createProject } from "@/actions/actions";
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

export default function HomePage({
  projectsArray,
}: {
  projectsArray: (typeof projects.$inferSelect)[];
}) {
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
