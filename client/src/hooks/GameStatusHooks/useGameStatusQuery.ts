import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export type GameStatus =
  | "dropped"
  | "playing"
  | "backlog"
  | "played"
  | "wishlist";

export interface UserGame {
  id: string;
  user_id: string;
  game_id: number;
  status: GameStatus;
  last_updated: string;
  created_at: string;
}

// Get user's status for a specific game
export const useGameStatus = (userId: string, gameId: number) => {
  return useQuery({
    queryKey: ["game-status", userId, gameId],
    queryFn: async (): Promise<UserGame | null> => {
      if (!userId || !gameId) return null;

      const { data, error } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", userId)
        .eq("game_id", gameId)
        .maybeSingle();

      if (error) {
        if (error.code !== "PGRST116") {
          console.error("Error fetching game status:", error);
          throw new Error(`Failed to fetch game status: ${error.message}`);
        }
        return null;
      }

      return data;
    },
    enabled: !!userId && !!gameId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes("PGRST116")) return false;
      return failureCount < 3;
    },
  });
};

// Get all games with a specific status for a user
export const useGamesByStatus = (userId: string, status?: GameStatus) => {
  return useQuery({
    queryKey: ["games-by-status", userId, status],
    queryFn: async (): Promise<UserGame[]> => {
      if (!userId) return [];

      let query = supabase
        .from("user_games")
        .select("*")
        .eq("user_id", userId)
        .order("last_updated", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching games by status:", error);
        throw new Error(`Failed to fetch games: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!userId,
  });
};
