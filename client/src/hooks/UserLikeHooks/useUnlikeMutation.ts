import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export interface Like {
  id: string;
  user_id: string;
  target_type: "game" | "list" | "review";
  target_id: string;
  liked_at: string;
}

export const useUnlikeMutation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      target_type,
      target_id,
    }: {
      target_type: Like["target_type"];
      target_id: string;
    }) => {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("target_type", target_type)
        .eq("target_id", target_id);

      if (error) throw error;
      return { target_type, target_id };
    },
    onSuccess: async ({ target_type, target_id }) => {
      // Update user-likes cache
      queryClient.setQueryData<Like[]>(["user-likes", userId], (old = []) =>
        old.filter(
          (l) => !(l.target_type === target_type && l.target_id === target_id)
        )
      );

      // If it's a list being unliked, we need to invalidate the list owner's cache
      if (target_type === "list") {
        // Get the list to find its owner
        const { data: listData } = await supabase
          .from("game_lists")
          .select("user_id")
          .eq("id", target_id)
          .single();

        if (listData?.user_id) {
          // Invalidate the list owner's cache
          queryClient.invalidateQueries({
            queryKey: ["user-lists-fresh", listData.user_id],
          });

          queryClient.invalidateQueries({
            queryKey: ["user-liked-lists", userId],
          });
        }
      }

      // Also invalidate your own lists in case you're viewing your own profile
      queryClient.invalidateQueries({
        queryKey: ["user-lists-fresh", userId],
      });

      // Invalidate the game like count if it's a game being unliked
      if (target_type === "game") {
        queryClient.invalidateQueries({
          queryKey: ["game-like-count", target_id],
        });

        queryClient.invalidateQueries({
          queryKey: ["user-liked-games", userId],
        });
      }
    },
  });
};
