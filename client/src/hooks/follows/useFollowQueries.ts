import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { FollowStats, FollowProfile } from "@/types/follows";

// Get follow stats
export const useFollowStats = (userId: string) => {
  return useQuery<FollowStats>({
    queryKey: ["follow-stats", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/follows/stats/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch follow stats");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get followers list
export const useFollowers = (userId: string) => {
  return useQuery<FollowProfile[]>({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/follows/followers/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch followers");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get following list
export const useFollowing = (userId: string) => {
  return useQuery<FollowProfile[]>({
    queryKey: ["following", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/follows/following/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch following");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// Check if following
export const useIsFollowing = (followerId: string, followingId: string) => {
  return useQuery<{ is_following: boolean }>({
    queryKey: ["is-following", followerId, followingId],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/follows/check/${followerId}/${followingId}`
      );
      if (!res.ok) throw new Error("Failed to check follow status");
      return res.json();
    },
    enabled: !!followerId && !!followingId && followerId !== followingId,
    staleTime: 5 * 60 * 1000, // 5 minute
  });
};
