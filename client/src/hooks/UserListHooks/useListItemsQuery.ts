import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";
interface Game {
  id: string;
  name: string;
  cover_id: string | null;
  slug: string;
}

interface GameListItem {
  id: string;
  rank: number;
  games: Game;
}

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
