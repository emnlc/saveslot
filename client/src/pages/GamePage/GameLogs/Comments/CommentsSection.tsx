import { useState } from "react";
import { MessageCircle, ChevronDown } from "lucide-react";
import {
  useLogComments,
  useCreateLogComment,
  useDeleteLogComment,
} from "@/hooks/gameLogs";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";

import { UserAuth } from "@/context/AuthContext";

import InlineLikeButton from "@/components/controls/InlineLikeButton";

type Props = {
  logId: string;
  currentUserId?: string;
};

const CommentsSection = ({ logId, currentUserId }: Props) => {
  const { profile } = UserAuth();
  const [showComments, setShowComments] = useState(false);
  const { data: comments } = useLogComments(logId);
  const createCommentMutation = useCreateLogComment();
  const deleteCommentMutation = useDeleteLogComment();

  const handleCommentSubmit = async (commentText: string) => {
    if (!currentUserId) return;
    await createCommentMutation.mutateAsync({
      log_id: logId,
      comment_text: commentText,
      user_id: currentUserId,
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUserId) return;

    try {
      await deleteCommentMutation.mutateAsync({
        commentId,
        userId: currentUserId,
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

  return (
    <>
      {/* Likes and Comments Row */}
      <div className="flex items-center justify-between pt-4 border-t border-base-300">
        <div className="flex items-center space-x-6">
          {/* Like Section */}
          <div className="flex items-center space-x-2">
            <InlineLikeButton targetId={logId} targetType="review" />
          </div>

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
                  currentUserId={currentUserId}
                  onDelete={handleDeleteComment}
                  onReport={handleReportComment}
                />
              ))}
            </div>
          )}

          {/* New Comment Input */}
          {profile && currentUserId && (
            <CommentInput
              onSubmit={handleCommentSubmit}
              isSubmitting={createCommentMutation.isPending}
              profile={profile}
            />
          )}
        </div>
      )}
    </>
  );
};

export default CommentsSection;
