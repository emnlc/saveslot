import { createFileRoute } from "@tanstack/react-router";

import ActivityFeed from "@/pages/UserPage/UserActivity";

export const Route = createFileRoute("/u/$username/_profile/activity")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ActivityFeed />;
}
