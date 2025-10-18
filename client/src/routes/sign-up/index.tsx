import { createFileRoute } from "@tanstack/react-router";
import SignUp from "@/pages/Auth/SignUp";
import { useEffect } from "react";
export const Route = createFileRoute("/sign-up/")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    document.title = "Sign Up | SaveSlot";
  });

  return <SignUp />;
}
