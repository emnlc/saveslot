import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { FavoriteGame } from "@/types/favorites";

export const useFavoriteGames = (userId: string) => {
  return useQuery<FavoriteGame[]>({
    queryKey: ["favorite-games", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/favorites/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch favorite games");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
