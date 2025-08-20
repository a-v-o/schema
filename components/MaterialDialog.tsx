import { useActionState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { PlusIcon, Edit3 } from "lucide-react";
import { materials } from "@/db/schema";

const initialState = {
  errors: {
    name: [""],
  },
};

export default function MaterialDialog({
  id,
  material,
  createAction,
  editAction,
}: {
  id: number;
  material?: typeof materials.$inferSelect;
  createAction?: (
    taskId: number,
    prevState: Record<string, Record<string, string[]>> | undefined,
    formdata: FormData
  ) => Promise<{
    errors: {
      name?: string[] | undefined;
      description?: string[] | undefined;
      price?: string[] | undefined;
      quantity?: string[] | undefined;
      unit?: string[] | undefined;
    };
  }>;
  editAction?: (
    id: number,
    prevState: Record<string, Record<string, string[]>> | undefined,
    formdata: FormData
  ) => Promise<{
    errors: {
      name?: string[] | undefined;
      description?: string[] | undefined;
      price?: string[] | undefined;
      quantity?: string[] | undefined;
      unit?: string[] | undefined;
    };
  }>;
}) {
  let action;
  if (createAction) {
    action = createAction.bind(null, id);
  } else {
    action = editAction!.bind(null, id);
  }
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={createAction ? "outline" : "ghost"} className="w-fit">
          <span className="hidden md:block">
            {createAction ? "Add material" : ""}
          </span>
          <span>
            {createAction ? <PlusIcon /> : <Edit3 className="ml-1" />}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {createAction ? "New material" : "Edit material"}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="material">Material name:</Label>
            <Input
              name="material"
              id="material"
              required
              defaultValue={material?.name}
            />
            <p className="text-sm text-red-600">{state?.errors?.name}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description:</Label>
            <Input
              name="description"
              id="description"
              defaultValue={material?.description || ""}
            />
            <p className="text-sm text-red-600">{state?.errors?.description}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="unit">Unit:</Label>
            <Input
              name="unit"
              id="unit"
              required
              defaultValue={material?.unit || ""}
            />
            <p className="text-sm text-red-600">{state?.errors?.unit}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="price">Unit price:</Label>
            <Input
              name="price"
              id="price"
              type="number"
              required
              defaultValue={material?.price || ""}
            />
            <p className="text-sm text-red-600">{state?.errors?.price}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="quantity">Quantity:</Label>
            <Input
              name="quantity"
              id="quantity"
              type="number"
              required
              defaultValue={material?.quantity || ""}
            />
            <p className="text-sm text-red-600">{state?.errors?.quantity}</p>
          </div>
          <Button className="self-end" pending={pending}>
            Confirm
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
