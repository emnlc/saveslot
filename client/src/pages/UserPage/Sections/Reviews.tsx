import { useState } from "react";
import { GameLogWithProfile } from "@/Interface";
import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";
import { useUserReviews } from "@/hooks/UserReviewHooks/useUserReviews";
import { useDeleteGameLog } from "@/hooks/gameLogs";
import { useParams } from "@tanstack/react-router";
import ProfileReviewItem from "./Subsections/Reviews/ProfileReviewItem";
import CreateLogModal from "../../GamePage/GameLogModal/CreateLogModal";
import Dropdown from "@/components/controls/Dropdown";

const Reviews = () => {
  const { username } = useParams({ strict: false });
  const { profile: currentUserProfile } = UserAuth();
  const { data: viewedProfile } = useProfile(
    username || "",
    currentUserProfile?.id
  );
  const isOwnProfile = currentUserProfile?.id === viewedProfile?.id;

  const [editingLog, setEditingLog] = useState<GameLogWithProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const deleteLogMutation = useDeleteGameLog();

  const {
    data: reviews,
    isLoading,
    error,
    filters,
    handleSortChange,
    handleLoadMore,
  } = useUserReviews({
    userId: viewedProfile?.id || "",
    enabled: !!viewedProfile?.id,
  });

  const handleDeleteReview = async (logId: string) => {
    if (!currentUserProfile) return;
    try {
      await deleteLogMutation.mutateAsync({
        logId,
        userId: currentUserProfile.id,
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  const handleReportReview = (logId: string) => {
    console.log("Report review:", logId);
    alert("Thank you for your report. We will review it shortly.");
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingLog(null);
  };

  const handleEditSuccess = () => {
    handleCloseEditModal();
  };

  const sortOptions = [
    {
      label: "Newest First",
      onClick: () => handleSortChange("newest"),
      isSelected: filters.sort_by === "newest",
    },
    {
      label: "Oldest First",
      onClick: () => handleSortChange("oldest"),
      isSelected: filters.sort_by === "oldest",
    },
    {
      label: "Most Liked",
      onClick: () => handleSortChange("highest_rated"),
      isSelected: filters.sort_by === "highest_rated",
    },
    {
      label: "Least Liked",
      onClick: () => handleSortChange("lowest_rated"),
      isSelected: filters.sort_by === "lowest_rated",
    },
  ];

  const selectedOption = sortOptions.find((option) => option.isSelected);
  const buttonText = selectedOption?.label || "Sort by";

  if (!viewedProfile) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-base-300 mx-auto mb-4"></div>
          <p className="text-base-content/60">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          {isOwnProfile
            ? "Your Reviews"
            : `${viewedProfile.display_name || viewedProfile.username}'s Reviews`}
        </h2>
        <div className="alert alert-error">
          <span>Failed to load reviews. Please try again.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {isOwnProfile
              ? "Your Reviews"
              : `${viewedProfile.display_name || viewedProfile.username}'s Reviews`}
          </h2>
          {reviews && reviews.length > 0 && (
            <div className="flex items-center space-x-3">
              <Dropdown buttonText={buttonText} items={sortOptions} />
            </div>
          )}
        </div>

        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-4">
              {reviews.map((log) => (
                <ProfileReviewItem
                  key={log.id}
                  log={log}
                  isOwnProfile={isOwnProfile}
                  onDelete={isOwnProfile ? handleDeleteReview : undefined}
                  onReport={!isOwnProfile ? handleReportReview : undefined}
                />
              ))}
            </div>
            {reviews.length >= filters.limit! && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="btn btn-outline"
                >
                  {isLoading ? "Loading..." : "Load More Reviews"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-base-100 rounded-lg border border-base-300">
            <h3 className="text-lg font-medium text-base-content mb-2">
              {isOwnProfile ? "No reviews yet" : "No reviews to show"}
            </h3>
            <p className="text-base-content/60">
              {isOwnProfile
                ? "Start reviewing games to build your profile!"
                : `${viewedProfile.display_name || viewedProfile.username} hasn't written any reviews yet.`}
            </p>
          </div>
        )}
      </div>

      {showEditModal && editingLog && currentUserProfile && (
        <CreateLogModal
          game={editingLog.game}
          userId={currentUserProfile.id}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
          editingLog={editingLog}
        />
      )}
    </>
  );
};

export default Reviews;
