import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { LikeInput, UnlikeInput } from "@/types/likes";

export const useLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user_id, target_type, target_id }: LikeInput) => {
      const res = await fetch(`${API_URL}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          target_type,
          target_id: target_id.toString(),
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to like");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      const targetId = variables.target_id.toString();

      queryClient.invalidateQueries({
        queryKey: ["user-likes", variables.user_id],
      });

      queryClient.invalidateQueries({
        queryKey: [`${variables.target_type}-like-count`, targetId],
      });

      queryClient.invalidateQueries({
        queryKey: [`user-liked-${variables.target_type}s`, variables.user_id],
      });

      if (variables.target_type === "game") {
        queryClient.invalidateQueries({
          queryKey: ["game-stats", parseInt(targetId)],
        });
      }

      if (variables.target_type === "review") {
        queryClient.invalidateQueries({ queryKey: ["game-logs"] });
        queryClient.invalidateQueries({ queryKey: ["user-logs"] });
      }
    },
  });
};

export const useUnlikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user_id, target_type, target_id }: UnlikeInput) => {
      const res = await fetch(
        `${API_URL}/likes/${user_id}/${target_type}/${target_id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to unlike");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      const targetId = variables.target_id.toString();

      queryClient.invalidateQueries({
        queryKey: ["user-likes", variables.user_id],
      });

      queryClient.invalidateQueries({
        queryKey: [`${variables.target_type}-like-count`, targetId],
      });

      queryClient.invalidateQueries({
        queryKey: [`user-liked-${variables.target_type}s`, variables.user_id],
      });

      if (variables.target_type === "game") {
        queryClient.invalidateQueries({
          queryKey: ["game-stats", parseInt(targetId)],
        });
      }

      if (variables.target_type === "review") {
        queryClient.invalidateQueries({ queryKey: ["game-logs"] });
        queryClient.invalidateQueries({ queryKey: ["user-logs"] });
      }
    },
  });
};
