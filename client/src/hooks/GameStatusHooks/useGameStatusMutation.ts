import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";
import { GameStatus } from "./useGameStatusQuery";

interface UpdateGameStatusParams {
  userId: string;
  gameId: number;
  status: GameStatus;
}

interface RemoveGameStatusParams {
  userId: string;
  gameId: number;
}

// Update or create game status
export const useUpdateGameStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, gameId, status }: UpdateGameStatusParams) => {
      const { data, error } = await supabase
        .from("user_games")
        .upsert(
          {
            user_id: userId,
            game_id: gameId,
            status,
            last_updated: new Date().toISOString(),
          },
          {
            onConflict: "user_id,game_id",
          }
        )
        .select()
        .single();

      if (error) {
        console.error("Error updating game status:", error);
        throw new Error(`Failed to update game status: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["game-status", variables.userId, variables.gameId],
      });
      queryClient.invalidateQueries({
        queryKey: ["games-by-status", variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-games", variables.userId],
      });
    },
  });
};

// Remove game from library (delete status)
export const useRemoveGameStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, gameId }: RemoveGameStatusParams) => {
      const { error } = await supabase
        .from("user_games")
        .delete()
        .eq("user_id", userId)
        .eq("game_id", gameId);

      if (error) {
        console.error("Error removing game status:", error);
        throw new Error(`Failed to remove game: ${error.message}`);
      }

      return { userId, gameId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["game-status", data.userId, data.gameId],
      });
      queryClient.invalidateQueries({
        queryKey: ["games-by-status", data.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-games", data.userId],
      });
    },
  });
};
