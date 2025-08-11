"use client";

import { createProject } from "@/actions/actions";
// import Draw from "@/components/Draw";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { projects } from "@/db/schema";
import { InfoIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "./ui/table";

const initialState = {
  errors: {
    name: [""],
    budget: [""],
    description: [""],
    startDate: [""],
    duration: [""],
  },
};

export default function HomePage({
  projectsArray,
}: {
  projectsArray: (typeof projects.$inferSelect)[];
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const createProjectWithDate = createProject.bind(null, date);
  const [state, formAction, pending] = useActionState(
    createProjectWithDate,
    initialState
  );

  return (
    <section className="w-full min-h-screen pt-8 md:p-8 flex flex-col gap-16">
      <h1 className="text-4xl font-bold">Recents</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-fit">
            Create new
            <PlusIcon className="ml-1" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-name">Project name:</Label>
              <Input name="project-name" id="project-name" required />
              <p className="text-sm text-red-600">{state?.errors?.name}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-description">Project description:</Label>
              <Input
                name="project-description"
                id="project-description"
                required
              />
              <p className="text-sm text-red-600">
                {state?.errors?.description}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-budget">Project budget:</Label>
              <Input name="project-budget" id="project-budget" />
              <p className="flex text-xs gap-2 items-center">
                <span>
                  <InfoIcon size={20} />
                </span>
                Enter if project budget is known or leave empty and it will be
                set to the total cost of individual tasks
              </p>
              <p className="text-sm text-red-600">{state?.errors?.budget}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-duration">
                Project duration (in weeks):
              </Label>
              <Input name="project-duration" id="project-duration" />
              <p className="flex text-xs gap-2 items-center">
                <span>
                  <InfoIcon size={20} />
                </span>
                Enter if project duration is known or leave empty and it will be
                set to the total duration of individual tasks
              </p>
              <p className="text-sm text-red-600">{state?.errors?.duration}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Start date:</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" id="date">
                    {date ? date.toLocaleDateString() : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={date}
                    onSelect={(date) => {
                      const offset = new Date().getTimezoneOffset();
                      date?.setMinutes(date.getMinutes() - offset);
                      setDate(date);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-red-600">{state?.errors?.startDate}</p>
            </div>
            <Button className="self-end" pending={pending}>
              Confirm
            </Button>
          </form>
        </DialogContent>
      </Dialog>
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
                      ? project.startDate?.toUTCString()
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
