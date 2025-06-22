import { createFileRoute } from "@tanstack/react-router";
import AllGames from "@/pages/Games/AllGames";
export const Route = createFileRoute("/all-games/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AllGames />;
}
