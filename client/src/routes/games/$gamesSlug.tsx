import { createFileRoute, useParams } from "@tanstack/react-router";
import GamePage from "../../pages/GamePage/GamePage";

export const Route = createFileRoute("/games/$gamesSlug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { gamesSlug } = useParams({ from: "/games/$gamesSlug" });

  return <GamePage gamesSlug={gamesSlug} />;
}
