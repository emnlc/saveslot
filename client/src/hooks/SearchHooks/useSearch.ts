// hooks/useSearch.ts
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Quick search for dropdown
export const useQuickSearch = (query: string, userId?: string) => {
  return useQuery({
    queryKey: ["quick-search", query, userId],
    queryFn: async () => {
      if (!query || query.length < 2) {
        return { games: [], users: [], lists: [], reviews: [] };
      }

      const params = new URLSearchParams({ q: query });
      if (userId) params.append("user_id", userId);

      const response = await fetch(`${API_URL}/search/quick?${params}`);
      if (!response.ok) throw new Error("Failed to search");
      return response.json();
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Full search for search page
export const useFullSearch = (query: string, userId?: string) => {
  return useQuery({
    queryKey: ["full-search", query, userId],
    queryFn: async () => {
      if (!query || query.length < 2) {
        return {
          local_games: [],
          igdb_games: [],
          users: [],
          lists: [],
          reviews: [],
        };
      }

      const response = await fetch(`${API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, user_id: userId }),
      });

      if (!response.ok) throw new Error("Failed to search");
      return response.json();
    },
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
