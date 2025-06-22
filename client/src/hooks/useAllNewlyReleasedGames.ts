import { fetchAllNewlyReleased } from "@/services/api";
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
    },
  ];
};

export function useAllNewlyReleasedGames(
  page: number,
  sort: string,
  order: string
) {
  return useQuery<GamesData>({
    queryKey: ["all-newly-released", page, sort, order],
    queryFn: () => fetchAllNewlyReleased<GamesData>(page, sort, order),
    staleTime: 1000 * 60,
    retry: 1,
  });
}
