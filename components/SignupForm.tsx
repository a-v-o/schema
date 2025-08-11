"use client";

import { signUp } from "@/actions/actions";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import Link from "next/link";

const initialState = {
  errors: {
    name: [""],
    email: [""],
    password: [""],
    role: [""],
  },
};

export default function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  return (
    <div className={"flex flex-col gap-6"}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>
            Enter your details below to sign up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                />
                <p className="text-sm text-red-600">{state?.errors?.name}</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                <p className="text-sm text-red-600">{state?.errors?.email}</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input name="password" id="password" type="password" required />
                <p className="text-sm text-red-600">
                  {state?.errors?.password}
                </p>
              </div>
              <Label>Role</Label>
              <RadioGroup name="role" className="flex">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Admin</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="worker" id="worker" />
                  <Label htmlFor="worker">Worker</Label>
                </div>
              </RadioGroup>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Log in
                </Link>
              </div>
              <p className="text-sm text-red-600">{state?.errors?.role}</p>
            </div>
            <Button type="submit" className="w-full mt-4" pending={pending}>
              Proceed
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
