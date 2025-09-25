import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export const useListLikeCount = (listId: string) => {
  return useQuery({
    queryKey: ["list-like-count", listId],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("list_id", listId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!listId,
    staleTime: 30 * 1000,
  });
};
