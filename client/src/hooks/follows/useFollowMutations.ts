import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { FollowParams } from "@/types/follows";

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ follower_id, following_id }: FollowParams) => {
      const res = await fetch(`${API_URL}/follows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follower_id, following_id }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to follow user");
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["follow-stats", variables.following_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["follow-stats", variables.follower_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["followers", variables.following_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["following", variables.follower_id],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "is-following",
          variables.follower_id,
          variables.following_id,
        ],
      });
      // Invalidate profile queries to update is_following
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ follower_id, following_id }: FollowParams) => {
      const res = await fetch(
        `${API_URL}/follows/${follower_id}/${following_id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to unfollow user");
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["follow-stats", variables.following_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["follow-stats", variables.follower_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["followers", variables.following_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["following", variables.follower_id],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "is-following",
          variables.follower_id,
          variables.following_id,
        ],
      });
      // Invalidate profile queries to update is_following
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });
};
