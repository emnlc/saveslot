import { useQuery } from "@tanstack/react-query";
import { fetchHighlyRated } from "../services/api";
import type { Game } from "../Interface";

export function useHighlyRated() {
  return useQuery<Game[]>({
    queryKey: ["highly-rated"],
    queryFn: () => fetchHighlyRated<Game[]>(),
    staleTime: 1000 * 60,
    retry: 1,
  });
}
