import { useQuery } from "@tanstack/react-query";
import { fetchGame } from "../services/api";

import type { Game } from "../Interface";

export function useGameInfo(gameId: string) {
  return useQuery<Game>({
    queryKey: [gameId],
    queryFn: () => fetchGame<Game>(gameId),
    staleTime: 1000 * 60,
    retry: 1,
  });
}
