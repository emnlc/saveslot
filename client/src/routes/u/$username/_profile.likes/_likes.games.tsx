import { createFileRoute } from "@tanstack/react-router";
import UserGameLikes from "@/pages/UserPage/Sections/Subsections/Likes/UserGameLikes";

export const Route = createFileRoute(
  "/u/$username/_profile/likes/_likes/games"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <UserGameLikes />
    </>
  );
}
