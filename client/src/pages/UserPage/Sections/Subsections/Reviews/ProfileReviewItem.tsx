import { useState } from "react";
import {
  Calendar,
  Clock,
  Eye,
  EyeOff,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { GameLogWithProfile } from "@/Interface";
import StarDisplay from "@/components/StarDisplay";
import LogDropdown from "@/pages/GamePage/GameLogs/LogItems/LogDropdown";
import InlineLikeButton from "@/components/InlineLikeButton";
import {
  useLogComments,
  useCreateLogComment,
  useDeleteLogComment,
} from "@/hooks/GameLogs/useGameLogs";
import CommentItem from "@/pages/GamePage/GameLogs/Comments/CommentItem";
import CommentInput from "@/pages/GamePage/GameLogs/Comments/CommentInput";
import { UserAuth } from "@/context/AuthContext";
import { Link } from "@tanstack/react-router";

type Props = {
  log: GameLogWithProfile;
  isOwnProfile: boolean;
  onDelete?: (logId: string) => void;
  onReport?: (logId: string) => void;
};

const ProfileReviewItem = ({
  log,
  isOwnProfile,
  onDelete,
  onReport,
}: Props) => {
  const { profile } = UserAuth();
  const [showFullReview, setShowFullReview] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(isOwnProfile);
  const [showComments, setShowComments] = useState(false);

  // Comment hooks
  const { data: comments } = useLogComments(log.id);
  const createCommentMutation = useCreateLogComment();
  const deleteCommentMutation = useDeleteLogComment();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPlayTime = (hours: number, minutes: number) => {
    if (hours === 0 && minutes === 0) return null;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "playing":
        return "bg-blue-500";
      case "dropped":
        return "bg-red-500";
      case "plan_to_play":
        return "bg-yellow-500";
      case "abandoned":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleDelete = () => {
    onDelete?.(log.id);
  };

  const handleReport = () => {
    onReport?.(log.id);
  };

  const handleCommentSubmit = async (commentText: string) => {
    if (!profile?.id) return;
    await createCommentMutation.mutateAsync({
      log_id: log.id,
      comment_text: commentText,
      user_id: profile.id,
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!profile?.id) return;

    try {
      await deleteCommentMutation.mutateAsync({
        commentId,
        userId: profile.id,
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleReportComment = (commentId: string) => {
    // TODO: report
    console.log("report comment:", commentId);
  };

  const shouldTruncateReview = log.review_text && log.review_text.length > 200;
  const displayText =
    shouldTruncateReview && !showFullReview
      ? log.review_text!.slice(0, 200) + "..."
      : log.review_text;

  const cover_url = log.game?.cover_id
    ? `https://images.igdb.com/igdb/image/upload/t_cover_small/${log.game.cover_id}.jpg`
    : null;

  return (
    <div className="bg-base-100 rounded-lg border border-base-300 p-4">
      {/* Header with Game Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {cover_url && (
            <img
              src={cover_url}
              alt={log.game.name}
              className="w-12 h-16 rounded object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold text-base-content hover:text-primary transition-all">
              <Link
                to={`/games/$gamesSlug`}
                params={{ gamesSlug: log.game.slug }}
              >
                {log.game.name}
              </Link>
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              {log.rating && (
                <div className="flex items-center space-x-1">
                  <StarDisplay rating={log.rating} size="md" />
                  <span className="text-sm text-base-content/60 ml-1">
                    {log.rating}/5
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-base-content/60 mt-1">
              {formatDate(log.created_at)}
              {log.updated_at !== log.created_at && " (edited)"}
            </p>
          </div>
        </div>

        {/* Dropdown Menu - only show if user is logged in */}
        <div className="flex items-center space-x-2">
          <LogDropdown
            onDelete={isOwnProfile ? handleDelete : undefined}
            onReport={!isOwnProfile ? handleReport : undefined}
            isOwner={isOwnProfile}
            showAlways={true}
          />
        </div>
      </div>

      {/* Game Details */}
      <div className="flex flex-wrap gap-3 mb-3 text-xs text-base-content/60">
        {log.game_status && (
          <div className="flex items-center space-x-1">
            <span
              className={`w-2 h-2 rounded-full ${getStatusColor(log.game_status)}`}
            />
            <span className="capitalize">
              {log.game_status.replace("_", " ")}
            </span>
          </div>
        )}
        {log.platform && <div>{log.platform}</div>}
        {(log.play_start_date || log.play_end_date) && (
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>
              {log.play_start_date && log.play_end_date
                ? `${formatDate(log.play_start_date)} - ${formatDate(log.play_end_date)}`
                : log.play_start_date
                  ? `Started ${formatDate(log.play_start_date)}`
                  : `Finished ${formatDate(log.play_end_date!)}`}
            </span>
          </div>
        )}
        {formatPlayTime(log.hours_played, log.minutes_played) && (
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>{formatPlayTime(log.hours_played, log.minutes_played)}</span>
          </div>
        )}
      </div>

      {/* Review Text */}
      {log.review_text && (
        <div>
          {/* Review Content */}
          <div
            className={log.contains_spoilers && !showSpoilers ? "relative" : ""}
          >
            <p
              className={`text-xs md:text-sm text-base-content whitespace-pre-wrap leading-relaxed ${
                log.contains_spoilers && !showSpoilers
                  ? "blur-sm select-none"
                  : ""
              }`}
            >
              {displayText}
            </p>

            {/* Spoiler Overlay */}
            {log.contains_spoilers && !showSpoilers && (
              <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                <button
                  onClick={() => setShowSpoilers(true)}
                  className="btn btn-outline btn-sm text-warning border-warning hover:bg-warning hover:text-warning-content"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Click to reveal spoilers
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {(!log.contains_spoilers || showSpoilers) && (
            <div className="flex items-center space-x-3 mt-2">
              {/* Read more/less button */}
              {shouldTruncateReview && (
                <button
                  onClick={() => setShowFullReview(!showFullReview)}
                  className="btn btn-sm text-primary hover:text-primary-focus font-medium"
                >
                  {showFullReview ? "Show less" : "Read more"}
                </button>
              )}

              {/* Hide spoilers button */}
              {log.contains_spoilers && showSpoilers && (
                <button
                  onClick={() => setShowSpoilers(false)}
                  className="btn btn-ghost btn-sm text-warning hover:bg-warning/10"
                >
                  <EyeOff className="w-3 h-3 mr-1" />
                  Hide spoilers
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Likes and Comments Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-base-300 mt-4">
        <div className="flex items-center space-x-6">
          {/* Like Section */}
          <InlineLikeButton targetId={log.id} targetType="review" />

          {/* Comments Section */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-base-content/60 hover:text-base-content transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">
              {comments?.length || 0} Comment{comments?.length !== 1 ? "s" : ""}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showComments ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Comments Content */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-base-300">
          {/* Existing Comments */}
          {comments && comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={profile?.id}
                  onDelete={handleDeleteComment}
                  onReport={handleReportComment}
                />
              ))}
            </div>
          )}

          {/* New Comment Input */}
          {profile?.id && (
            <CommentInput
              onSubmit={handleCommentSubmit}
              isSubmitting={createCommentMutation.isPending}
              profile={profile}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileReviewItem;
