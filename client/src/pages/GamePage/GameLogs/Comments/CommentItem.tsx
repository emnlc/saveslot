import { LogCommentWithProfile } from "@/Interface";
import LogDropdown from "../LogItems/LogDropdown";

type Props = {
  comment: LogCommentWithProfile;
  currentUserId?: string;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onReport?: (commentId: string) => void;
};

const CommentItem = ({ comment, currentUserId, onDelete, onReport }: Props) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOwner = currentUserId === comment.user_id;

  const handleDelete = () => {
    onDelete?.(comment.id);
  };

  const handleReport = () => {
    onReport?.(comment.id);
  };

  return (
    <div className="flex items-start space-x-2 md:space-x-3 group">
      {comment.profile.avatar_url ? (
        <img
          src={comment.profile.avatar_url}
          alt={comment.profile.username}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 bg-base-300 rounded-full flex items-center justify-center">
          <span className="text-xs text-base-content font-medium">
            {comment.profile.display_name?.[0] || comment.profile.username[0]}
          </span>
        </div>
      )}
      <div className="flex-1">
        <div className="bg-base-200 rounded-lg px-3 py-2 relative">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">
                {comment.profile.display_name || comment.profile.username}
              </span>
              <span className="text-xs text-base-content/60">
                {formatDate(comment.created_at)}
              </span>
            </div>
            {/* Dropdown menu */}
            {currentUserId && (
              <LogDropdown
                onDelete={isOwner ? handleDelete : undefined}
                onReport={!isOwner ? handleReport : undefined}
                isOwner={isOwner}
                showAlways={false}
              />
            )}
          </div>
          <p className="text-xs md:text-sm text-base-content">
            {comment.comment_text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
