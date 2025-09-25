import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export const useReviewLikeCount = (reviewId: string) => {
  return useQuery({
    queryKey: ["review-like-count", reviewId],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("review_id", reviewId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!reviewId,
    staleTime: 30 * 1000, // 30 seconds
  });
};
