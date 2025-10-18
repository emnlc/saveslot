import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import {
  UpdateGameStatusParams,
  RemoveGameStatusParams,
} from "@/types/userGames";

// Update or create game status
export const useUpdateGameStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, gameId, status }: UpdateGameStatusParams) => {
      const res = await fetch(`${API_URL}/user-games`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          game_id: gameId,
          status,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update game status");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ["game-status", variables.userId, variables.gameId],
      });
      queryClient.invalidateQueries({
        queryKey: ["games-by-status", variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-games", variables.userId],
      });

      // Invalidate game stats
      queryClient.invalidateQueries({
        queryKey: ["game-stats", variables.gameId],
      });
    },
  });
};

// Remove game from library
export const useRemoveGameStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, gameId }: RemoveGameStatusParams) => {
      const res = await fetch(
        `${API_URL}/user-games/user/${userId}/game/${gameId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to remove game");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ["game-status", variables.userId, variables.gameId],
      });
      queryClient.invalidateQueries({
        queryKey: ["games-by-status", variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-games", variables.userId],
      });

      // Invalidate game stats (play count decreased)
      queryClient.invalidateQueries({
        queryKey: ["game-stats", variables.gameId],
      });
    },
  });
};
