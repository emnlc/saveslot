import { createFileRoute } from "@tanstack/react-router";

import UserListLikes from "@/pages/UserPage/Sections/Subsections/Likes/UserListLikes";

export const Route = createFileRoute(
  "/u/$username/_profile/likes/_likes/lists"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <UserListLikes />;
}
