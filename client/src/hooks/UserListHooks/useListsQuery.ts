import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export interface Game {
  id: string;
  name: string;
  cover_id: string | null;
  slug: string;
}

export interface GameList {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  is_public: boolean;
  game_count: number;
  slug: string;
  preview_games: Game[];
}

export const useUserLists = (userId: string) => {
  return useQuery({
    queryKey: ["user-lists-fresh", userId],
    queryFn: async (): Promise<GameList[]> => {
      // Get all lists for this user
      const { data: lists, error: listsError } = await supabase
        .from("game_lists")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (listsError) {
        throw listsError;
      }

      if (!lists || lists.length === 0) {
        return [];
      }

      // get game count and preview games
      const enrichedLists: GameList[] = [];

      for (const list of lists) {
        // Get total count
        const { count } = await supabase
          .from("game_list_items")
          .select("*", { count: "exact", head: true })
          .eq("list_id", list.id);

        // Get first 5 games
        const { data: items } = await supabase
          .from("game_list_items")
          .select(
            `
            games (
              id,
              name,
              cover_id,
              slug
            )
          `
          )
          .eq("list_id", list.id)
          .order("rank", { ascending: true })
          .limit(5);

        const previewGames =
          items?.map((item) => item.games).filter(Boolean) || [];

        enrichedLists.push({
          ...list,
          game_count: count || 0,
          preview_games: previewGames,
        });
      }

      return enrichedLists;
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000,
  });
};
