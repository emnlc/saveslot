import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export interface Like {
  id: string;
  user_id: string;
  target_type: "game" | "list" | "review";
  target_id: string;
  created_at: string;
}

export const useUserLikes = (userId: string) => {
  return useQuery({
    queryKey: ["user-likes", userId],
    queryFn: async (): Promise<Like[]> => {
      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", userId)
        .order("liked_at", { ascending: false });
      if (!data) return [];

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000,
  });
};
