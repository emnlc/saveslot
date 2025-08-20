import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export const useDeleteList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      // delete all list items
      const { error: itemsError } = await supabase
        .from("game_list_items")
        .delete()
        .eq("list_id", listId);

      if (itemsError) {
        throw new Error(`Failed to delete list items: ${itemsError.message}`);
      }

      // delete the list itself
      const { error: listError } = await supabase
        .from("game_lists")
        .delete()
        .eq("id", listId);

      if (listError) {
        throw new Error(`Failed to delete list: ${listError.message}`);
      }

      return { success: true };
    },
    onSuccess: () => {
      // invalidate and refetch user lists to update the cache
      queryClient.invalidateQueries({
        queryKey: ["user-lists-fresh"],
      });

      // invalidate the specific list query if it exists
      queryClient.invalidateQueries({
        queryKey: ["list-items"],
      });
    },
  });
};
