import { useQuery } from "@tanstack/react-query";
import { fetchNewlyReleasedGames } from "../services/api";
import { Game } from "@/Interface";

export function useNewlyReleasedGames() {
  return useQuery<Game[]>({
    queryKey: ["newly-released"],
    queryFn: () => fetchNewlyReleasedGames<Game[]>(),
    staleTime: 1000 * 60,
    retry: 1,
  });
}
