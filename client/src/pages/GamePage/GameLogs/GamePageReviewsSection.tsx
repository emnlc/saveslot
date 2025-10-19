import { useState } from "react";
import { UserAuth } from "@/context/AuthContext";
import { Game, GameLog, GameLogWithProfile } from "@/Interface";
import { useReviewsData } from "@/hooks/reviews/useReviewsData";
import ReviewsHeader from "./ReviewsHeader";
import RatingStatsCard from "./RatingStatsCard";
import ReviewsList from "./ReviewsList";
import EmptyReviewsState from "./EmptyReviewsState";
import LoadingSkeleton from "./LoadingSkeleton";
import ErrorState from "./ErrorState";
import CreateLogModal from "../GameLogModal/CreateLogModal";

type Props = {
  gameId: number;
  game: Game;
};

const GamePageReviewsSection = ({ gameId, game }: Props) => {
  const { profile } = UserAuth();
  const [editingLog, setEditingLog] = useState<GameLogWithProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const {
    logs,
    stats,
    filters,
    isLoading,
    error,
    handleSortChange,
    handleLoadMore,
  } = useReviewsData({ gameId });

  const handleEditLog = (logId: string) => {
    const logToEdit = logs?.find((log: GameLog) => log.id === logId);
    if (logToEdit) {
      setEditingLog(logToEdit);
      setShowEditModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingLog(null);
  };

  const handleEditSuccess = () => {
    handleCloseEditModal();
  };

  // Loading state for initial load
  if (isLoading && filters.offset === 0) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error) {
    return <ErrorState />;
  }

  return (
    <>
      <div className="col-span-1 md:col-span-2">
        {/* Header with sort controls */}
        <ReviewsHeader
          sortBy={filters.sort_by}
          onSortChange={handleSortChange}
        />

        {/* Rating Statistics */}
        {stats && stats.total_logs > 0 && <RatingStatsCard stats={stats} />}

        {/* Reviews Content */}
        {logs && logs.length > 0 ? (
          <ReviewsList
            logs={logs}
            currentUserId={profile?.id}
            filters={filters}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
            onEditLog={handleEditLog}
          />
        ) : (
          <EmptyReviewsState />
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingLog && profile && (
        <CreateLogModal
          game={game}
          userId={profile.id}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
          editingLog={editingLog}
        />
      )}
    </>
  );
};

export default GamePageReviewsSection;
