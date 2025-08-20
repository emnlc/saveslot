import { createFileRoute } from "@tanstack/react-router";
import UserGames from "@/pages/UserPage/UserGames";
import { z } from "zod";

const gamesSearchSchema = z.object({
  filter: z.string().optional(),
});

export const Route = createFileRoute("/u/$username/_profile/games")({
  validateSearch: gamesSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return <UserGames search={search} navigate={navigate} />;
}
