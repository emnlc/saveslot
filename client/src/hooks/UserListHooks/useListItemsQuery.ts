// hooks/useListItemsQuery.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

// Define the Game type
interface Game {
  id: string;
  name: string;
  cover_id: string | null;
  slug: string;
}

// Define the GameListItem type (the nested structure) - now includes rank
interface GameListItem {
  id: string; // The game_list_items id for updating rank
  rank: number;
  games: Game;
}

// Define the main return type for the query
export interface ListData {
  id: string;
  name: string;
  games: GameListItem[];
}

export const useListItems = (listSlug: string, profile: string) => {
  return useQuery<ListData>({
    queryKey: ["list-items", listSlug, profile],
    queryFn: async () => {
      // First get the list basic info
      const { data: listData, error: listError } = await supabase
        .from("game_lists")
        .select("id, name")
        .eq("slug", listSlug)
        .eq("user_id", profile)
        .single();

      if (listError) throw listError;

      // Then get the games with their list items (this can return empty array)
      const { data: gameListItems, error: itemsError } = await supabase
        .from("game_list_items")
        .select(
          `
          id,
          rank,
          games!inner(id, name, cover_id, slug)
        `
        )
        .eq("list_id", listData.id)
        .order("rank", { ascending: true });

      if (itemsError) throw itemsError;

      return {
        id: listData.id,
        name: listData.name,
        games: gameListItems || [],
      } as unknown as ListData;
    },
    enabled: !!listSlug && !!profile,
    staleTime: 5 * 60 * 1000,
  });
};
