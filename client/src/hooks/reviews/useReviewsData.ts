import { useState } from "react";
import { useGameLogs, useGameRatingStats } from "@/hooks/gameLogs";
import { LogFilters } from "@/Interface";

interface UseReviewsDataProps {
  gameId: number;
}

export const useReviewsData = ({ gameId }: UseReviewsDataProps) => {
  const [filters, setFilters] = useState<LogFilters>({
    sort_by: "newest",
    limit: 10,
    offset: 0,
  });

  const { data: logs, isLoading, error } = useGameLogs(gameId, filters);
  const { data: stats } = useGameRatingStats(gameId);

  const handleSortChange = (sortBy: LogFilters["sort_by"]) => {
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

  return {
    logs,
    stats,
    filters,
    isLoading,
    error,
    handleSortChange,
    handleLoadMore,
  };
};
