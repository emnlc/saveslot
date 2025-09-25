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
      let deleteQuery = supabase.from("likes").delete().eq("user_id", userId);

      if (target_type === "review") {
        deleteQuery = deleteQuery.eq("review_id", target_id);
      } else if (target_type === "game") {
        deleteQuery = deleteQuery.eq("game_id", parseInt(target_id));
      } else if (target_type === "list") {
        deleteQuery = deleteQuery.eq("list_id", target_id);
      }

      const { error } = await deleteQuery;
      if (error) throw error;
      return { target_type, target_id };
    },
    onSuccess: async ({ target_type, target_id }) => {
      queryClient.setQueryData<Like[]>(["user-likes", userId], (old = []) =>
        old.filter((l) => {
          if (target_type === "game") {
            return !(
              l.target_type === "game" && l.game_id === parseInt(target_id)
            );
          } else if (target_type === "list") {
            return !(l.target_type === "list" && l.list_id === target_id);
          } else if (target_type === "review") {
            return !(l.target_type === "review" && l.review_id === target_id);
          }
          return true;
        })
      );

      if (target_type === "game") {
        queryClient.invalidateQueries({
          queryKey: ["game-like-count", target_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["user-liked-games", userId],
        });
      }

      if (target_type === "list") {
        queryClient.invalidateQueries({
          queryKey: ["list-like-count", target_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["user-liked-lists", userId],
        });

        const { data: listData } = await supabase
          .from("game_lists")
          .select("user_id")
          .eq("id", target_id)
          .single();

        if (listData?.user_id) {
          queryClient.invalidateQueries({
            queryKey: ["user-lists-fresh", listData.user_id],
          });
        }
      }

      if (target_type === "review") {
        queryClient.invalidateQueries({
          queryKey: ["review-like-count", target_id],
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
