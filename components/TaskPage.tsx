"use client";

import { materials, tasks } from "@/db/schema";
import {
  addMaterial,
  deleteMaterial,
  editMaterial,
  editTask,
} from "@/actions/actions";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "./ui/table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import TaskDialog from "./TaskDialog";
import MaterialDialog from "./MaterialDialog";
import { useActionState } from "react";
import { Button } from "./ui/button";

const initialState = {
  message: "",
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
  const [state, formAction, pending] = useActionState(
    deleteMaterial,
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
            <MaterialDialog id={task.id} createAction={addMaterial} />

            <TaskDialog
              id={task.id}
              tasksArray={tasksArray}
              editAction={editTask}
              task={task}
            />
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
                <TableHead>Unit</TableHead>
                <TableHead>Total</TableHead>
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
                    <TableCell>{material.unit}</TableCell>
                    <TableCell>{material.price * material.quantity}</TableCell>
                    <TableCell>
                      <MaterialDialog
                        id={material.id}
                        editAction={editMaterial}
                        material={material}
                      />
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
                              Are you sure you want to delete this material.
                              This action is irreversible
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <form action={formAction}>
                              <input
                                type="hidden"
                                name="materialId"
                                value={material.id}
                              />
                              <input
                                type="hidden"
                                name="taskId"
                                value={task.id}
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
      </div>
    </section>
  );
}
