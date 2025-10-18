import { GameLogWithProfile } from "@/Interface";
import { supabase } from "@/services/supabase";
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
import {
  ProfileStats,
  RatingDistribution,
  GenreData,
  ActivityHeatmap,
} from "@/types/profileStats";

export const useProfileStats = (userId: string) => {
  return useQuery<ProfileStats>({
    queryKey: ["profile-stats", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/profiles/${userId}/stats`);
      if (!res.ok) throw new Error("Failed to fetch profile stats");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRatingDistribution = (userId: string) => {
  return useQuery<RatingDistribution>({
    queryKey: ["rating-distribution", userId],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/profiles/${userId}/rating-distribution`
      );
      if (!res.ok) throw new Error("Failed to fetch rating distribution");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopGenres = (userId: string) => {
  return useQuery<GenreData[]>({
    queryKey: ["top-genres", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/profiles/${userId}/top-genres`);
      if (!res.ok) throw new Error("Failed to fetch top genres");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopPlatforms = (userId: string) => {
  return useQuery<GenreData[]>({
    queryKey: ["top-platforms", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/profiles/${userId}/top-platforms`);
      if (!res.ok) throw new Error("Failed to fetch top platforms");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useActivityHeatmap = (userId: string) => {
  return useQuery<ActivityHeatmap>({
    queryKey: ["activity-heatmap", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/profiles/${userId}/activity-heatmap`);
      if (!res.ok) throw new Error("Failed to fetch activity heatmap");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRecentReviews = (userId: string, limit: number = 3) => {
  return useQuery<GameLogWithProfile[]>({
    queryKey: ["recent-reviews", userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("game_logs")
        .select(
          `
          *,
          game:games(
            id, 
            name, 
            slug, 
            cover_id
          ),
          profile:profiles(id, username, display_name, avatar_url)
        `
        )
        .eq("user_id", userId)
        .eq("is_draft", false)
        .not("rating", "is", null)
        .not("review_text", "is", null)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).filter(
        (review: { review_text: string }) =>
          review.review_text && review.review_text.trim().length > 0
      );
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
