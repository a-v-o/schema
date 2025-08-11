"use client";

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
import { useActionState } from "react";
import { login } from "@/actions/actions";
import Link from "next/link";

const initialState = {
  errors: {
    email: [""],
    password: [""],
  },
};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  return (
    <div className="w-full p-8 flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Login or sign up to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="flex flex-col gap-6 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="text"
                  name="email"
                  id="email"
                  placeholder="m@example.com"
                  required
                />
                <p className="text-sm text-red-600">{state?.errors?.email}</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
                <p className="text-sm text-red-600">
                  {state?.errors?.password}
                </p>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signUp" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full" pending={pending}>
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
