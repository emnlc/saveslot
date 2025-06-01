import { useQuery } from "@tanstack/react-query";
import { fetchHighlyRated } from "../services/api";

interface Games {
  id: string;
  name: string;
  cover: {
    id: string;
    url: string;
  };
  first_release_date: number;
  slug: string;
}

export function useHighlyRated() {
  return useQuery<Games[]>({
    queryKey: ["highly-rated"],
    queryFn: () => fetchHighlyRated<Games[]>(),
    staleTime: 1000 * 60,
    retry: 1,
  });
}
