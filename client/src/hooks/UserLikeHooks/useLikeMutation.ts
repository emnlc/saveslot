import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export interface Like {
  id: string;
  user_id: string;
  target_type: "game" | "list" | "review";
  target_id: string;
  liked_at: string;
}

export const useLikeMutation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (like: Omit<Like, "id" | "liked_at">) => {
      const { data, error } = await supabase
        .from("likes")
        .insert(like)
        .select()
        .single();

      if (error) throw error;
      return data as Like;
    },
    onSuccess: async (newLike) => {
      // Update user-likes cache
      queryClient.setQueryData<Like[]>(["user-likes", userId], (old = []) => [
        newLike,
        ...old,
      ]);

      // If it's a list being liked, we need to invalidate the list owner's cache
      if (newLike.target_type === "list") {
        // Get the list to find its owner
        const { data: listData } = await supabase
          .from("game_lists")
          .select("user_id")
          .eq("id", newLike.target_id)
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

      // Invalidate game like count if it's a game
      if (newLike.target_type === "game") {
        queryClient.invalidateQueries({
          queryKey: ["game-like-count", newLike.target_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["user-liked-games", userId],
        });
      }
    },
  });
};
