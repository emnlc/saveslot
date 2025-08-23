import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export interface LikedGame {
  id: string;
  name: string;
  cover_id: string | null;
  slug: string;
  liked_at: string; // from the likes table
  like_id: string; // the like record id
}

export const useUserLikedGames = (userId: string) => {
  return useQuery({
    queryKey: ["user-liked-games", userId],
    queryFn: async (): Promise<LikedGame[]> => {
      // First, get all game likes for this user
      const { data: likes, error: likesError } = await supabase
        .from("likes")
        .select("id, liked_at, target_id")
        .eq("user_id", userId)
        .eq("target_type", "game")
        .order("liked_at", { ascending: false });

      if (likesError) {
        throw likesError;
      }

      if (!likes || likes.length === 0) {
        return [];
      }

      // Get all the game IDs that were liked
      const gameIds = likes.map((like) => like.target_id);

      // Fetch the actual game data
      const { data: games, error: gamesError } = await supabase
        .from("games")
        .select("id, name, cover_id, slug")
        .in("id", gameIds);

      if (gamesError) {
        throw gamesError;
      }

      if (!games) {
        return [];
      }

      // Combine the likes data with game data
      const result = likes
        .map((like) => {
          const game = games.find(
            (g) => String(g.id) === String(like.target_id)
          );

          if (!game) return null;

          return {
            id: game.id,
            name: game.name,
            cover_id: game.cover_id,
            slug: game.slug,
            liked_at: like.liked_at,
            like_id: like.id,
          };
        })
        .filter(Boolean) as LikedGame[];

      return result;
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 5 minutes
  });
};
