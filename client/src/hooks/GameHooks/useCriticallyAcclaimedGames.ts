import { useQuery } from "@tanstack/react-query";
import { fetchCriticallyAcclaimedGames } from "../../services/api";
import { Game } from "@/Interface";

export function useCriticallyAcclaimedGames() {
  return useQuery<Game[]>({
    queryKey: ["critically-acclaimed"],
    queryFn: () => fetchCriticallyAcclaimedGames<Game[]>(),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
}
