import { fetchAllUpcoming } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

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
      release_date_human: string;
    },
  ];
};

export function useAllUpcomingGames(page: number, sort: string, order: string) {
  return useQuery<GamesData>({
    queryKey: ["all-upcoming", page, sort, order],
    queryFn: () => fetchAllUpcoming<GamesData>(page, sort, order),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
}
