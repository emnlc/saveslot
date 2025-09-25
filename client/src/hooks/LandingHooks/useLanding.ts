import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.0.77:3000";

export const useTopReviews = (limit = 6) => {
  return useQuery({
    queryKey: ["top-reviews", limit],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/landing/top-reviews?limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch top reviews");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRecentlyReleased = (limit = 6) => {
  return useQuery({
    queryKey: ["recently-released", limit],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/landing/recently-released?limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch recently released");
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpcomingGames = (limit = 6) => {
  return useQuery({
    queryKey: ["upcoming-games", limit],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/landing/upcoming?limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch upcoming games");
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useMostRatedGames = (limit = 6) => {
  return useQuery({
    queryKey: ["most-rated-games", limit],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/landing/most-rated?limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch most rated games");
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFeaturedGame = () => {
  return useQuery({
    queryKey: ["featured-game"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/landing/featured-game`);
      if (!response.ok) throw new Error("Failed to fetch featured game");
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePopularLists = (limit = 4) => {
  return useQuery({
    queryKey: ["popular-lists", limit],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/landing/popular-lists?limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch popular lists");
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
