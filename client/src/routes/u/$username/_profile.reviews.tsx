import { createFileRoute } from "@tanstack/react-router";
import UserReviews from "@/pages/UserPage/UserReviews";

export const Route = createFileRoute("/u/$username/_profile/reviews")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UserReviews />;
}
