import { useQuery } from "@tanstack/react-query";
import { fetchUpcomingGames } from "../../services/api";
import { Game } from "@/Interface";

export function useUpcomingGames() {
  return useQuery<Game[]>({
    queryKey: ["upcoming-games"],
    queryFn: () => fetchUpcomingGames<Game[]>(),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
}
