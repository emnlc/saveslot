import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export interface Like {
  id: string;
  user_id: string;
  target_type: "game" | "list" | "review";
  liked_at: string;
  game_id?: number;
  list_id?: string;
  review_id?: string;
}

interface LikeInput {
  user_id: string;
  target_type: "game" | "list" | "review";
  target_id: string;
}

interface LikeInsertData {
  user_id: string;
  target_type: "game" | "list" | "review";
  review_id?: string;
  game_id?: number;
  list_id?: string;
}

export const useLikeMutation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (like: LikeInput) => {
      if (like.target_type === "review") {
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", like.user_id)
          .eq("review_id", like.target_id);
      } else if (like.target_type === "game") {
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", like.user_id)
          .eq("game_id", parseInt(like.target_id));
      } else if (like.target_type === "list") {
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", like.user_id)
          .eq("list_id", like.target_id);
      }

      const insertData: LikeInsertData = {
        user_id: like.user_id,
        target_type: like.target_type,
      };

      if (like.target_type === "review") {
        insertData.review_id = like.target_id;
      } else if (like.target_type === "game") {
        insertData.game_id = parseInt(like.target_id);
      } else if (like.target_type === "list") {
        insertData.list_id = like.target_id;
      }

      const { data, error } = await supabase
        .from("likes")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data as Like;
    },
    onSuccess: async (newLike) => {
      queryClient.setQueryData<Like[]>(["user-likes", userId], (old = []) => [
        newLike,
        ...old,
      ]);

      const targetId =
        newLike.game_id?.toString() || newLike.list_id || newLike.review_id;

      if (!targetId) return;

      if (newLike.target_type === "game") {
        queryClient.invalidateQueries({
          queryKey: ["game-like-count", targetId],
        });
        queryClient.invalidateQueries({
          queryKey: ["user-liked-games", userId],
        });
      }

      if (newLike.target_type === "list") {
        queryClient.invalidateQueries({
          queryKey: ["list-like-count", targetId],
        });
        queryClient.invalidateQueries({
          queryKey: ["user-liked-lists", userId],
        });

        const { data: listData } = await supabase
          .from("game_lists")
          .select("user_id")
          .eq("id", targetId)
          .single();

        if (listData?.user_id) {
          queryClient.invalidateQueries({
            queryKey: ["user-lists-fresh", listData.user_id],
          });
        }
      }

      if (newLike.target_type === "review") {
        queryClient.invalidateQueries({
          queryKey: ["review-like-count", targetId],
        });
        queryClient.invalidateQueries({
          queryKey: ["user-liked-reviews", userId],
        });

        queryClient.invalidateQueries({
          queryKey: ["game-logs"],
        });
        queryClient.invalidateQueries({
          queryKey: ["user-logs"],
        });
      }
    },
  });
};
