// hooks/useListMutations.ts - Create this new file
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

// Helper function to create slug from name
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

export const useUpdateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId, name }: { listId: string; name: string }) => {
      const slug = createSlug(name);

      // Check if slug already exists for this user
      const { data: existingList } = await supabase
        .from("game_lists")
        .select("id")
        .eq("slug", slug)
        .neq("id", listId)
        .single();

      if (existingList) {
        throw new Error("A list with this name already exists");
      }

      const { data, error } = await supabase
        .from("game_lists")
        .update({ name, slug, last_updated: new Date() })
        .eq("id", listId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update list: ${error.message}`);
      }

      return { ...data, newSlug: slug };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-lists-fresh"] });
      queryClient.invalidateQueries({ queryKey: ["list-items"] });
    },
  });
};

export const useDeleteList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      // Delete all list items first
      const { error: itemsError } = await supabase
        .from("game_list_items")
        .delete()
        .eq("list_id", listId);

      if (itemsError) {
        throw new Error(`Failed to delete list items: ${itemsError.message}`);
      }

      // Then delete the list
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
      queryClient.invalidateQueries({ queryKey: ["user-lists-fresh"] });
      queryClient.invalidateQueries({ queryKey: ["list-items"] });
    },
  });
};

export const useRemoveGameFromList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      gameId,
    }: {
      listId: string;
      gameId: string;
    }) => {
      const { error } = await supabase
        .from("game_list_items")
        .delete()
        .eq("list_id", listId)
        .eq("game_id", gameId);

      if (error) {
        throw new Error(`Failed to remove game: ${error.message}`);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-lists-fresh"] });
    },
  });
};
