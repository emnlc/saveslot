import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { GameStatus, UserGame } from "@/types/userGames";

// Get all user games
export const useUserGames = (userId: string) => {
  return useQuery<UserGame[]>({
    queryKey: ["user-games", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/user-games/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user games");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Get status for a specific game
export const useGameStatus = (userId: string, gameId: number) => {
  return useQuery<UserGame | null>({
    queryKey: ["game-status", userId, gameId],
    queryFn: async () => {
      if (!userId || !gameId) return null;

      const res = await fetch(
        `${API_URL}/user-games/user/${userId}/game/${gameId}`
      );
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch game status");
      }
      return res.json();
    },
    enabled: !!userId && !!gameId,
    staleTime: 15 * 60 * 1000,
  });
};

export const useGamesByStatus = (
  userId: string,
  status: GameStatus,
  limit?: number
) => {
  return useQuery<UserGame[]>({
    queryKey: ["user-games-by-status", userId, status, limit],
    queryFn: async () => {
      const url = new URL(
        `${API_URL}/user-games/user/${userId}/by-status/${status}`
      );
      if (limit) {
        url.searchParams.append("limit", limit.toString());
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch games");
      return response.json();
    },
    enabled: !!userId && !!status,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
