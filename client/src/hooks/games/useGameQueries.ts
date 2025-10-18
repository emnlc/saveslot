import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllNewlyReleased,
  fetchAllUpcoming,
  fetchGame,
  fetchGames,
  fetchHighlyRated,
  fetchNewlyReleasedGames,
  fetchUpcomingGames,
} from "@/services/api";
import type { Game } from "@/Interface";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
      release_date_human?: string;
    },
  ];
};

export interface GameStats {
  play_count: number;
  list_count: number;
  like_count: number;
}

export const useAllNewlyReleasedGames = (
  page: number,
  sort: string,
  order: string
) => {
  return useQuery<GamesData>({
    queryKey: ["all-newly-released", page, sort, order],
    queryFn: () => fetchAllNewlyReleased<GamesData>(page, sort, order),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
};

export const useAllUpcomingGames = (
  page: number,
  sort: string,
  order: string
) => {
  return useQuery<GamesData>({
    queryKey: ["all-upcoming", page, sort, order],
    queryFn: () => fetchAllUpcoming<GamesData>(page, sort, order),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
};

export const useGameInfo = (gameId: string) => {
  return useQuery<Game>({
    queryKey: [gameId],
    queryFn: () => fetchGame<Game>(gameId),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
};

export const useGames = (page: number) => {
  return useQuery<GamesData>({
    queryKey: ["games", page],
    queryFn: () => fetchGames<GamesData>(page),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
};

export const useGameStats = (gameId: number) => {
  return useQuery<GameStats>({
    queryKey: ["game-stats", gameId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/games/${gameId}/stats`);
      if (!res.ok) throw new Error("Failed to fetch game stats");
      return res.json();
    },
    enabled: !!gameId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useInvalidateGameStats = () => {
  const queryClient = useQueryClient();
  return (gameId: number) => {
    queryClient.invalidateQueries({ queryKey: ["game-stats", gameId] });
  };
};

export const useHighlyRated = () => {
  return useQuery<Game[]>({
    queryKey: ["highly-rated"],
    queryFn: () => fetchHighlyRated<Game[]>(),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
};

export const useNewlyReleasedGames = () => {
  return useQuery<Game[]>({
    queryKey: ["newly-released"],
    queryFn: () => fetchNewlyReleasedGames<Game[]>(),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
};

export const useUpcomingGames = () => {
  return useQuery<Game[]>({
    queryKey: ["upcoming-games"],
    queryFn: () => fetchUpcomingGames<Game[]>(),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });
};
