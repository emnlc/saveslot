// hooks/useAddGameMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export const useAddGameToList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      gameId,
    }: {
      listId: string;
      gameId: number;
    }) => {
      // Check if game is already in the list
      const { data: existingItem } = await supabase
        .from("game_list_items")
        .select("id")
        .eq("list_id", listId)
        .eq("game_id", gameId)
        .single();

      if (existingItem) {
        throw new Error("Game is already in this list");
      }

      // Get the current highest rank in the list
      const { data: maxRankData } = await supabase
        .from("game_list_items")
        .select("rank")
        .eq("list_id", listId)
        .order("rank", { ascending: false })
        .limit(1)
        .single();

      const nextRank = maxRankData ? maxRankData.rank + 1 : 1;

      // Add the game to the list
      const { data, error } = await supabase
        .from("game_list_items")
        .insert({
          list_id: listId,
          game_id: gameId,
          rank: nextRank,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add game to list: ${error.message}`);
      }

      // Update the list's last_updated timestamp
      await supabase
        .from("game_lists")
        .update({ last_updated: new Date() })
        .eq("id", listId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-lists-fresh"] });
    },
  });
};
