import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GameLogWithProfile } from "@/Interface";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
      const params = new URLSearchParams({
        sort_by,
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(
        `${API_URL}/reviews/user/${userId}?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user reviews");
      }

      return response.json();
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
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
