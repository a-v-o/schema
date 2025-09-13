"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepBack } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  return (
    <Button
      className="flex absolute top-8 right-6 md:right-14"
      variant="outline"
      onClick={() => {
        router.back();
      }}
    >
      <StepBack className="mr-1" />
      Back
    </Button>
  );
}
