import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { Like, LikedGame, LikedList, LikedReview } from "@/types/likes";

// Get all user likes
export const useUserLikes = (userId: string) => {
  return useQuery<Like[]>({
    queryKey: ["user-likes", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/likes/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch likes");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Get user's liked games
export const useUserLikedGames = (userId: string) => {
  return useQuery<LikedGame[]>({
    queryKey: ["user-liked-games", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/likes/user/${userId}/games`);
      if (!res.ok) throw new Error("Failed to fetch liked games");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000,
  });
};

// Get user's liked lists
export const useUserLikedLists = (userId: string) => {
  return useQuery<LikedList[]>({
    queryKey: ["user-liked-lists", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/likes/user/${userId}/lists`);
      if (!res.ok) throw new Error("Failed to fetch liked lists");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000,
  });
};

// Get user's liked reviews
export const useUserLikedReviews = (userId: string) => {
  return useQuery<LikedReview[]>({
    queryKey: ["user-liked-reviews", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/likes/user/${userId}/reviews`);
      if (!res.ok) throw new Error("Failed to fetch liked reviews");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000,
  });
};

// Get like count for a specific target
export const useLikeCount = (
  targetType: "game" | "list" | "review",
  targetId: string | number
) => {
  return useQuery<{ count: number }>({
    queryKey: [`${targetType}-like-count`, targetId.toString()],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/likes/count/${targetType}/${targetId}`
      );
      if (!res.ok) throw new Error("Failed to fetch like count");
      return res.json();
    },
    enabled: !!targetId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useGameLikeCount = (gameId: string | number) => {
  const query = useLikeCount("game", gameId);
  return {
    ...query,
    data: query.data?.count ?? 0,
  };
};

export const useListLikeCount = (listId: string) => {
  const query = useLikeCount("list", listId);
  return {
    ...query,
    data: query.data?.count ?? 0,
  };
};

export const useReviewLikeCount = (reviewId: string) => {
  const query = useLikeCount("review", reviewId);
  return {
    ...query,
    data: query.data?.count ?? 0,
  };
};
