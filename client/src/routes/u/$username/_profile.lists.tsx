import { createFileRoute } from "@tanstack/react-router";
import UserLists from "@/pages/UserPage/UserLists";

export const Route = createFileRoute("/u/$username/_profile/lists")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UserLists />;
}
