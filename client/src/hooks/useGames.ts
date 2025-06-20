import { useQuery } from "@tanstack/react-query";
import { fetchGames } from "../services/api";

type GamesData = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  sort: [string];
  games: [
    {
      cover_id: string;
      first_release_date: string;
      id: number;
      igdb_total_rating: number;
      igdb_total_count: number;
      name: string;
      slug: string;
    },
  ];
};

export function useGames(page: number) {
  return useQuery<GamesData>({
    queryKey: ["games", page],
    queryFn: () => fetchGames<GamesData>(page),
    staleTime: 1000 * 60,
    retry: 1,
  });
}
