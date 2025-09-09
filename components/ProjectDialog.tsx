"use client";

import { useActionState, useState } from "react";
import { Edit3, InfoIcon, PlusIcon, RefreshCcw } from "lucide-react";
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

import { Checkbox } from "./ui/checkbox";
import { projects } from "@/db/schema";

const initialState = {
  errors: {
    name: [""],
    budget: [""],
    description: [""],
    startDate: [""],
    duration: [""],
  },
};

export default function ProjectDialog({
  id,
  project,
  createAction,
  editAction,
}: {
  id?: number;
  project?: typeof projects.$inferSelect;
  createAction?: (
    date: Date | undefined,
    prevState: Record<string, Record<string, string[]>> | undefined,
    formdata: FormData
  ) => Promise<{
    errors: {
      name?: string[] | undefined;
      budget?: string[] | undefined;
      description?: string[] | undefined;
      duration?: string[] | undefined;
      fixedBudget?: string[] | undefined;
      fixedDuration?: string[] | undefined;
      startDate?: string[] | undefined;
    };
  }>;

  editAction?: (
    id: number,
    date: Date | undefined,
    prevState: Record<string, Record<string, string[]>> | undefined,
    formdata: FormData
  ) => Promise<{
    errors: {
      name?: string[] | undefined;
      budget?: string[] | undefined;
      description?: string[] | undefined;
      duration?: string[] | undefined;
      fixedBudget?: string[] | undefined;
      fixedDuration?: string[] | undefined;
      startDate?: string[] | undefined;
    };
  }>;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    project ? project.startDate || undefined : undefined
  );
  const [budgetChecked, setBudgetChecked] = useState(!project?.fixedBudget);
  const [durationChecked, setDurationChecked] = useState(
    !project?.fixedDuration
  );
  let action;
  if (createAction) {
    action = createAction.bind(null, date);
  } else {
    action = editAction!.bind(null, id!, date);
  }
  const [state, formAction, pending] = useActionState(action, initialState);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-fit">
          {createAction ? "Create new" : "Edit Project"}
          {createAction ? (
            <PlusIcon className="ml-1" />
          ) : (
            <Edit3 className="ml-1" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="z-10">
        <DialogHeader>
          <DialogTitle>
            {createAction ? "New Project" : "Edit Project"}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Project name:</Label>
            <Input
              name="project-name"
              id="project-name"
              required
              defaultValue={project?.name}
            />
            <p className="text-sm text-red-600">{state?.errors?.name}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-description">Project description:</Label>
            <Input
              name="project-description"
              id="project-description"
              required
              defaultValue={project?.description || ""}
            />
            <p className="text-sm text-red-600">{state?.errors?.description}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-budget">Project budget:</Label>
            <Input
              name="project-budget"
              id="project-budget"
              disabled={budgetChecked}
              defaultValue={project?.budget || ""}
            />
            <p className="text-sm text-red-600">{state?.errors?.budget}</p>
          </div>
          <div>
            <Checkbox
              name="budget-checkbox"
              id="budget-checkbox"
              checked={budgetChecked}
              onCheckedChange={() => {
                setBudgetChecked(!budgetChecked);
              }}
            />
            <Label htmlFor="budget-checkbox" className="inline ml-2">
              Set budget to total of individual tasks budgets.
            </Label>
            <p className="flex text-xs gap-2 items-center">
              <span>
                <InfoIcon size={20} />
              </span>
              Select if the project budget is not known and it will be set to
              the total of all task budgets
            </p>
            <p className="text-sm text-red-600">{state?.errors?.fixedBudget}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-duration">
              Project duration (in weeks):
            </Label>
            <Input
              name="project-duration"
              id="project-duration"
              disabled={durationChecked}
              defaultValue={project?.duration || ""}
            />
            <p className="text-sm text-red-600">{state?.errors?.duration}</p>
          </div>
          <div>
            <Checkbox
              name="duration-checkbox"
              id="duration-checkbox"
              checked={durationChecked}
              onCheckedChange={() => {
                setDurationChecked(!durationChecked);
              }}
            />
            <Label htmlFor="duration-checkbox" className="inline ml-2">
              Set duration to total of individual tasks durations.
            </Label>
            <p className="flex text-xs gap-2 items-center">
              <span>
                <InfoIcon size={20} />
              </span>
              Select if the project duration is not known and it will be set to
              the total of all task durations
            </p>
            <p className="text-sm text-red-600">
              {state?.errors?.fixedDuration}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Start date:</Label>
            <div className="flex gap-2">
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
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  setDate(undefined);
                }}
              >
                <RefreshCcw />
              </Button>
            </div>
            <p className="text-sm text-red-600">{state?.errors?.startDate}</p>
          </div>
          <Button className="self-end" pending={pending}>
            Confirm
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
