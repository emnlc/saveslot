// useGameLikeCount.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export const useGameLikeCount = (gameId: string) => {
  return useQuery({
    queryKey: ["game-like-count", gameId],
    queryFn: async () => {
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("target_type", "game")
        .eq("target_id", gameId);
      return count || 0;
    },
    staleTime: 5 * 60 * 1000,
  });
};
