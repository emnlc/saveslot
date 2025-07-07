import { createFileRoute } from "@tanstack/react-router";
import UserPage from "@/pages/UserPage/UserPage";

export const Route = createFileRoute("/u/$username/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UserPage />;
}
