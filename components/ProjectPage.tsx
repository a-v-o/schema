"use client";

import { createTask, editTask } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { projects, tasks } from "@/db/schema";
import { Edit3, InfoIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "./ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const initialState = {
  errors: {
    name: [""],
  },
};

export default function ProjectPage({
  name,
  id,
  project,
  tasksArray,
}: {
  name: string;
  id: number;
  project: typeof projects.$inferSelect;
  tasksArray: (typeof tasks.$inferSelect)[];
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const createTaskWithIdAndDate = createTask.bind(null, id, date);
  const editProjectWithIdAndDate = editTask.bind(null, id, date);
  const [state, formAction, pending] = useActionState(
    createTaskWithIdAndDate,
    initialState
  );

  const [editState, editFormAction, editPending] = useActionState(
    editProjectWithIdAndDate,
    initialState
  );

  return (
    <section className="w-full min-h-screen pt-8 md:p-8 flex flex-col gap-16">
      <div>
        <h1 className="text-4xl font-semibold">{name.toUpperCase()}</h1>
      </div>
      <div className="flex flex-col gap-16">
        <div className="flex justify-between items-center">
          <h2 className="text-xl">Tasks</h2>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-fit">
                  <span className="hidden md:block">Create new task</span>
                  <span>
                    <PlusIcon />
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Task</DialogTitle>
                </DialogHeader>
                <form action={formAction} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="task-name">Task title:</Label>
                    <Input name="task-name" id="task-name" required />
                    <p className="text-sm text-red-600">
                      {state?.errors?.name}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="task-description">Task description:</Label>
                    <Input name="task-description" id="task-description" />
                    <p className="text-sm text-red-600">
                      {state?.errors?.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="task-budget">Estimated cost:</Label>
                    <Input name="task-budget" id="task-budget" />
                    <p className="flex text-xs gap-2 items-center">
                      <span>
                        <InfoIcon size={20} />
                      </span>
                      Enter if task cost is known or leave empty and it will be
                      set to the total cost of required materials
                    </p>
                    <p className="text-sm text-red-600">
                      {state?.errors?.budget}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="task-duration">
                      Estimated duration (in weeks):
                    </Label>
                    <Input name="task-duration" id="task-duration" required />
                    <p className="text-sm text-red-600">
                      {state?.errors?.duration}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Parent task:</Label>
                    <Select name="task-parent">
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent task" />
                      </SelectTrigger>
                      <SelectContent>
                        {tasksArray.map((task) => {
                          return (
                            <SelectItem
                              key={task.id}
                              value={task.id.toString()}
                              className="capitalize"
                            >
                              {task.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="flex text-xs gap-2 items-center">
                      <span>
                        <InfoIcon size={20} />
                      </span>
                      Select the task which this task starts after or ignore if
                      this task is an independent task. Select none if this task
                      starts at the beginning of the project
                    </p>
                    <p className="text-sm text-red-600">
                      {state?.errors?.parent}
                    </p>
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
                  </div>

                  <Button className="self-end" pending={pending}>
                    Confirm
                  </Button>
                </form>
                <p className="text-sm text-red-600">
                  {state?.errors?.startDate}
                </p>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-fit">
                  Edit project
                  <span className="ml-1">
                    <Edit3 />
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Project</DialogTitle>
                </DialogHeader>
                <form action={editFormAction} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="project-name">Project name:</Label>
                    <Input
                      name="project-name"
                      id="project-name"
                      required
                      defaultValue={project.name}
                    />
                    <p className="text-sm text-red-600">
                      {editState?.errors?.name}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="project-description">
                      Project description:
                    </Label>
                    <Input
                      name="project-description"
                      id="project-description"
                      required
                      defaultValue={project.description || ""}
                    />
                    <p className="text-sm text-red-600">
                      {editState?.errors?.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="project-budget">Project budget:</Label>
                    <Input
                      name="project-budget"
                      id="project-budget"
                      defaultValue={project.budget || ""}
                    />
                    <p className="flex text-xs gap-2 items-center">
                      <span>
                        <InfoIcon size={20} />
                      </span>
                      Enter if project budget is known or leave empty and it
                      will be set to the total cost of individual tasks
                    </p>
                    <p className="text-sm text-red-600">
                      {editState?.errors?.budget}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="project-duration">
                      Project duration (in weeks):
                    </Label>
                    <Input
                      name="project-duration"
                      id="project-duration"
                      defaultValue={project.duration || ""}
                    />
                    <p className="flex text-xs gap-2 items-center">
                      <span>
                        <InfoIcon size={20} />
                      </span>
                      Enter if project duration is known or leave empty and it
                      will be set to the total duration of individual tasks
                    </p>
                    <p className="text-sm text-red-600">
                      {editState?.errors?.duration}
                    </p>
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
                          selected={project.startDate || undefined}
                          onSelect={(date) => {
                            const offset = new Date().getTimezoneOffset();
                            date?.setMinutes(date.getMinutes() - offset);
                            setDate(date);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-sm text-red-600">
                      {editState?.errors?.startDate}
                    </p>
                  </div>
                  <Button className="self-end" pending={editPending}>
                    Confirm
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
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
                return task.id === 1 ? null : (
                  <TableRow key={task.id}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      {task.startDate ? task.startDate?.toUTCString() : "N/A"}
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
