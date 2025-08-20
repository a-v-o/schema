import { useActionState, useState } from "react";
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
import { Edit3, InfoIcon, PlusIcon, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { tasks } from "@/db/schema";

const initialState = {
  errors: {
    name: [""],
  },
};

export default function TaskDialog({
  id,
  task,
  tasksArray,
  createAction,
  editAction,
}: {
  id: number;
  task?: typeof tasks.$inferSelect;
  tasksArray: (typeof tasks.$inferSelect)[];
  createAction?: (
    projectId: number,
    date: Date | undefined,
    prevState: Record<string, Record<string, string[]>> | undefined,
    formdata: FormData
  ) => Promise<{
    errors: {
      name?: string[] | undefined;
      description?: string[] | undefined;
      duration?: string[] | undefined;
      budget?: string[] | undefined;
      parent?: string[] | undefined;
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
      description?: string[] | undefined;
      duration?: string[] | undefined;
      budget?: string[] | undefined;
      parent?: string[] | undefined;
      fixedBudget?: string[] | undefined;
      fixedDuration?: string[] | undefined;
      startDate?: string[] | undefined;
    };
  }>;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    task ? task.startDate || undefined : undefined
  );
  const [budgetChecked, setBudgetChecked] = useState(!task?.fixedBudget);
  let action;
  if (createAction) {
    action = createAction.bind(null, id, date);
  } else {
    action = editAction!.bind(null, id, date);
  }
  const [state, formAction, pending] = useActionState(action, initialState);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-fit">
          <span className="hidden md:block">
            {createAction ? "Create new task" : "Edit task"}
          </span>
          <span>
            {createAction ? <PlusIcon /> : <Edit3 className="ml-1" />}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{createAction ? "New task" : "Edit task"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-name">Task title:</Label>
            <Input
              name="task-name"
              id="task-name"
              required
              defaultValue={task?.name}
            />
            <p className="text-sm text-red-600">{state?.errors?.name}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-description">Task description:</Label>
            <Input
              name="task-description"
              id="task-description"
              defaultValue={task?.description || ""}
            />
            <p className="text-sm text-red-600">{state?.errors?.description}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-budget">Estimated budget:</Label>
            <Input
              name="task-budget"
              id="task-budget"
              disabled={budgetChecked}
              defaultValue={task?.budget || ""}
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
              Set budget to total of individual materials budgets.
            </Label>
            <p className="flex text-xs gap-2 items-center">
              <span>
                <InfoIcon size={20} />
              </span>
              Select if the task budget is not known and it will be set to the
              total of all material budgets
            </p>
            <p className="text-sm text-red-600">{state?.errors?.fixedBudget}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-duration">
              Estimated duration (in weeks):
            </Label>
            <Input
              name="task-duration"
              id="task-duration"
              required
              defaultValue={task?.duration || ""}
            />
            <p className="text-sm text-red-600">{state?.errors?.duration}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Parent task:</Label>
            <Select
              name="task-parent"
              defaultValue={task?.parentTaskId?.toString()}
            >
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
              Select the task which this task starts after or ignore if this
              task is an independent task. Select none if this task starts at
              the beginning of the project
            </p>
            <p className="text-sm text-red-600">{state?.errors?.parent}</p>
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
          </div>

          <Button className="self-end" pending={pending}>
            Confirm
          </Button>
        </form>
        <p className="text-sm text-red-600">{state?.errors?.startDate}</p>
      </DialogContent>
    </Dialog>
  );
}
