import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type { Game, GameListItem, ListData, PopularList } from "@/types/lists";

import type { GameList, ListData, PopularList } from "@/types/lists";

// Get user's lists with game previews
export const useUserLists = (userId: string) => {
  return useQuery<GameList[]>({
    queryKey: ["user-lists", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/lists/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user lists");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get specific list with all games
export const useListItems = (username: string, listSlug: string) => {
  return useQuery<ListData>({
    queryKey: ["list-items", username, listSlug],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/lists/${username}/${listSlug}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("List not found");
        }
        throw new Error("Failed to fetch list items");
      }
      return res.json();
    },
    enabled: !!username && !!listSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePopularUserLists = (userId: string, limit: number = 3) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  return useQuery<PopularList[]>({
    queryKey: ["popular-user-lists", userId, limit],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/lists/user/${userId}/popular?limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch popular lists");
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
