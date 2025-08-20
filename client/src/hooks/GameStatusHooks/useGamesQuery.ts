import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export interface Game {
  id: string;
  name: string;
  cover_id: string | null;
  slug: string;
}

export interface UserGame {
  id: string;
  user_id: string;
  game_id: string;
  status: string | null;
  created_at: string;
  game: Game;
}

export const useUserGames = (userId: string) => {
  return useQuery({
    queryKey: ["user-games", userId],
    queryFn: async (): Promise<UserGame[]> => {
      const { data, error } = await supabase
        .from("user_games")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const gameIds = data.map((ug) => ug.game_id);
      if (gameIds.length === 0) return [];

      const { data: games } = await supabase
        .from("games")
        .select("id, name, cover_id, slug")
        .in("id", gameIds);

      const gamesById = Object.fromEntries(games?.map((g) => [g.id, g]) || []);

      return data.map((ug) => ({
        ...ug,
        game: gamesById[ug.game_id],
      }));
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000,
  });
};
