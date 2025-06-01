import { createFileRoute } from "@tanstack/react-router";
import GamePage from "../../pages/GamePage/GamePage";

export const Route = createFileRoute("/games/$gamesSlug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <GamePage />;
}
