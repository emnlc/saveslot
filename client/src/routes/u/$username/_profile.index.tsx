import { createFileRoute } from "@tanstack/react-router";
import UserPage from "@/pages/UserPage/UserProfile";

export const Route = createFileRoute("/u/$username/_profile/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UserPage />;
}
