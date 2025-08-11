"use client";

import { materials, tasks } from "@/db/schema";
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
import { Edit3, InfoIcon, PlusIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { addMaterial, editTask } from "@/actions/actions";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "./ui/table";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "./ui/calendar";

const initialState = {
  errors: {
    name: [""],
  },
};

export default function TaskPage({
  name,
  task,
  tasksArray,
  materialsArray,
}: {
  name: string;
  task: typeof tasks.$inferSelect;
  tasksArray: (typeof tasks.$inferSelect)[];
  materialsArray: (typeof materials.$inferSelect)[];
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const addMaterialWithId = addMaterial.bind(null, task.id);
  const editTaskWithIdAndDate = editTask.bind(null, task.id, date);

  const [state, formAction, pending] = useActionState(
    addMaterialWithId,
    initialState
  );

  const [editState, editFormAction, editPending] = useActionState(
    editTaskWithIdAndDate,
    initialState
  );
  return (
    <section className="w-full min-h-screen pt-8 md:p-8 flex flex-col gap-16">
      <div>
        <h1 className="text-4xl font-semibold">{name.toUpperCase()}</h1>
      </div>
      <div className="flex flex-col gap-16">
        <div className="flex justify-between items-center">
          <h2 className="text-xl">Materials</h2>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-fit">
                  <span className="hidden md:block">Add material</span>
                  <span>
                    <PlusIcon />
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add material</DialogTitle>
                </DialogHeader>
                <form action={formAction} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="material">Material:</Label>
                    <Input name="material" id="material" required />
                    <p className="text-sm text-red-600">
                      {state?.errors?.name}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="description">Description:</Label>
                    <Input name="description" id="description" />
                    <p className="text-sm text-red-600">
                      {state?.errors?.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="price">Price:</Label>
                    <Input name="price" id="price" />
                    <p className="text-sm text-red-600">
                      {state?.errors?.price}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="quantity">Quantity:</Label>
                    <Input name="quantity" id="quantity" />
                    <p className="text-sm text-red-600">
                      {state?.errors?.quantity}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="unit">Unit:</Label>
                    <Input name="unit" id="unit" />
                    <p className="text-sm text-red-600">
                      {state?.errors?.quantity}
                    </p>
                  </div>

                  <Button className="self-end" pending={pending}>
                    Confirm
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-fit">
                  Edit task
                  <span className="ml-1">
                    <Edit3 />
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <form action={editFormAction} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="task-name">Task title:</Label>
                    <Input
                      name="task-name"
                      id="task-name"
                      required
                      defaultValue={task.name}
                    />
                    <p className="text-sm text-red-600">
                      {editState?.errors?.name}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="task-description">Task description:</Label>
                    <Input
                      name="task-description"
                      id="task-description"
                      defaultValue={task.description || ""}
                    />
                    <p className="text-sm text-red-600">
                      {editState?.errors?.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="task-budget">Estimated cost:</Label>
                    <Input
                      name="task-budget"
                      id="task-budget"
                      defaultValue={task.budget || ""}
                    />
                    <p className="flex text-xs gap-2 items-center">
                      <span>
                        <InfoIcon size={20} />
                      </span>
                      Enter if task cost is known or leave empty and it will be
                      set to the total cost of required materials
                    </p>
                    <p className="text-sm text-red-600">
                      {editState?.errors?.budget}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="task-duration">
                      Estimated duration (in weeks):
                    </Label>
                    <Input
                      name="task-duration"
                      id="task-duration"
                      required
                      defaultValue={task.duration || ""}
                    />
                    <p className="text-sm text-red-600">
                      {editState?.errors?.duration}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Parent task:</Label>
                    <Select
                      name="task-parent"
                      defaultValue={task.parentTaskId?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent task" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">
                          None (Start of project)
                        </SelectItem>
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
                      this task is an independent task. Select none if this
                      tasks start at the beginning of the project.
                    </p>
                    <p className="text-sm text-red-600">
                      {editState?.errors?.parent}
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
                          selected={task.startDate || undefined}
                          onSelect={(date) => {
                            const offset = new Date().getTimezoneOffset();
                            date?.setMinutes(date.getMinutes() - offset);
                            setDate(date);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button className="self-end" pending={editPending}>
                    Confirm
                  </Button>
                </form>
                <p className="text-sm text-red-600">
                  {editState?.errors?.startDate}
                </p>
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
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialsArray?.map((material) => {
                return (
                  <TableRow key={material.id}>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.description}</TableCell>
                    <TableCell>{material.price}</TableCell>
                    <TableCell>{material.quantity}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
