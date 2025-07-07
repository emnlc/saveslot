import { createFileRoute } from "@tanstack/react-router";
import SignUp from "@/pages/Auth/SignUp";
export const Route = createFileRoute("/sign-up/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignUp />;
}
