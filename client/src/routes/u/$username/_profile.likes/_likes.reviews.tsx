import { createFileRoute } from "@tanstack/react-router";
import UserLikedReviews from "@/pages/UserPage/Sections/Subsections/Likes/UserLikedReviews";

export const Route = createFileRoute(
  "/u/$username/_profile/likes/_likes/reviews"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <UserLikedReviews />;
}
