import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase";
import { GameLogWithProfile } from "@/Interface";

interface UseUserReviewsProps {
  userId: string;
  enabled?: boolean;
}

export interface UserReviewsFilters {
  sort_by?: "newest" | "oldest" | "highest_rated" | "lowest_rated";
  limit?: number;
  offset?: number;
}

export const useUserReviews = ({
  userId,
  enabled = true,
}: UseUserReviewsProps) => {
  const [filters, setFilters] = useState<UserReviewsFilters>({
    sort_by: "newest",
    limit: 12,
    offset: 0,
  });

  const { sort_by = "newest", limit = 12, offset = 0 } = filters;

  const query = useQuery({
    queryKey: ["user-reviews", userId, sort_by, limit, offset],
    queryFn: async (): Promise<GameLogWithProfile[]> => {
      if (sort_by === "highest_rated" || sort_by === "lowest_rated") {
        // get all reviews for this user
        const { data: reviews, error: reviewsError } = await supabase
          .from("game_logs")
          .select(
            `
            *,
            game:games(
              id, 
              name, 
              slug, 
              cover_id
            ),
            profile:profiles(id, username, display_name, avatar_url)
          `
          )
          .eq("user_id", userId)
          .eq("is_draft", false);

        if (reviewsError) throw reviewsError;
        if (!reviews || reviews.length === 0) return [];

        // Get like counts for all reviews
        const reviewIds = reviews.map((review) => review.id);
        const { data: likeCounts, error: likesError } = await supabase
          .from("likes")
          .select("review_id")
          .not("review_id", "is", null)
          .in("review_id", reviewIds);

        if (likesError) throw likesError;

        // Count likes per review
        const likeCountMap: { [key: string]: number } = {};
        likeCounts?.forEach((like) => {
          likeCountMap[like.review_id] =
            (likeCountMap[like.review_id] || 0) + 1;
        });

        // Sort reviews by like count
        const sortedReviews = reviews
          .map((review) => ({
            ...review,
            like_count: likeCountMap[review.id] || 0,
          }))
          .sort((a, b) => {
            if (sort_by === "highest_rated") {
              return b.like_count - a.like_count;
            } else {
              return a.like_count - b.like_count;
            }
          })
          .slice(offset, offset + limit - 1);

        return sortedReviews;
      }

      let orderClause: { column: string; ascending: boolean };
      switch (sort_by) {
        case "oldest":
          orderClause = { column: "created_at", ascending: true };
          break;
        default:
          orderClause = { column: "created_at", ascending: false };
      }

      const { data, error } = await supabase
        .from("game_logs")
        .select(
          `
          *,
          game:games(
            id, 
            name, 
            slug, 
            cover_id
          ),
          profile:profiles(id, username, display_name, avatar_url)
        `
        )
        .eq("user_id", userId)
        .eq("is_draft", false)
        .order(orderClause.column, { ascending: orderClause.ascending })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSortChange = (sortBy: UserReviewsFilters["sort_by"]) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: sortBy,
      offset: 0,
    }));
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      offset: prev.offset! + prev.limit!,
    }));
  };

  const resetFilters = () => {
    setFilters({
      sort_by: "newest",
      limit: 12,
      offset: 0,
    });
  };

  return {
    ...query,
    filters,
    handleSortChange,
    handleLoadMore,
    resetFilters,
  };
};
