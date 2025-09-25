import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";

export interface LikedReview {
  id: string;
  game_id: number;
  user_id: string;
  rating: number | null;
  review_text: string | null;
  game_status: string | null;
  platform: string | null;
  contains_spoilers: boolean;
  created_at: string;
  updated_at: string;
  liked_at: string;
  like_id: string;
  game?: {
    id: number;
    name: string;
    cover_id: string | null;
    slug: string;
  };
  profile?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useUserLikedReviews = (userId: string) => {
  return useQuery({
    queryKey: ["user-liked-reviews", userId],
    queryFn: async (): Promise<LikedReview[]> => {
      const { data: likes, error: likesError } = await supabase
        .from("likes")
        .select("id, liked_at, review_id")
        .eq("user_id", userId)
        .not("review_id", "is", null)
        .order("liked_at", { ascending: false });

      if (likesError) {
        throw likesError;
      }

      if (!likes || likes.length === 0) {
        return [];
      }

      // Get all the review IDs that were liked
      const reviewIds = likes.map((like) => like.review_id);

      const { data: reviews, error: reviewsError } = await supabase
        .from("game_logs")
        .select(
          `
          *,
          game:games(id, name, cover_id, slug),
          profile:profiles(id, username, display_name, avatar_url)
        `
        )
        .in("id", reviewIds)
        .eq("is_draft", false);

      if (reviewsError) {
        throw reviewsError;
      }

      if (!reviews) {
        return [];
      }

      // Combine the likes data with review data
      const result = likes
        .map((like) => {
          const review = reviews.find(
            (r) => String(r.id) === String(like.review_id)
          );
          if (!review) return null;

          return {
            ...review,
            liked_at: like.liked_at,
            like_id: like.id,
          };
        })
        .filter(Boolean) as LikedReview[];

      return result;
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};
