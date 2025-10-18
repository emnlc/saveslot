import { createFileRoute } from "@tanstack/react-router";
import AllGames from "@/pages/Games/AllGames";
import { useEffect } from "react";
export const Route = createFileRoute("/all-games/")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    document.title = "All Games";
  });

  return <AllGames />;
}
