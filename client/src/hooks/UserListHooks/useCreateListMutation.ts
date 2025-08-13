// hooks/useCreateListMutation.ts
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

export const useCreateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      isPublic,
    }: {
      name: string;
      isPublic: boolean;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const slug = createSlug(name);

      // Check if slug already exists for this user
      const { data: existingList } = await supabase
        .from("game_lists")
        .select("id")
        .eq("slug", slug)
        .eq("user_id", user.user.id)
        .single();

      if (existingList) {
        throw new Error("A list with this name already exists");
      }

      const { data, error } = await supabase
        .from("game_lists")
        .insert({
          name,
          slug,
          is_public: isPublic,
          user_id: user.user.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create list: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-lists-fresh"] });
    },
  });
};
