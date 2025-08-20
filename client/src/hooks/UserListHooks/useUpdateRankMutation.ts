import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

interface UpdateRankItem {
  gameListItemId: string;
  rank: number;
}

export const useUpdateRanks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: UpdateRankItem[]) => {
      const promises = updates.map(({ gameListItemId, rank }) =>
        supabase
          .from("game_list_items")
          .update({ rank })
          .eq("id", gameListItemId)
      );

      const results = await Promise.all(promises);

      // errors
      for (const result of results) {
        if (result.error) throw result.error;
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-lists-fresh"] });
      queryClient.invalidateQueries({ queryKey: ["user-lists"] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });
};
