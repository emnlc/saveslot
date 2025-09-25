import { GameLogWithProfile } from "@/Interface";
import LogItemHeader from "./LogItemHeader";
import LogItemDetails from "./LogItemDetails";
import LogItemReview from "./LogItemReview";
import CommentsSection from "../Comments/CommentsSection";

type Props = {
  log: GameLogWithProfile;
  currentUserId?: string;
  onEdit?: () => void;
  onDelete?: (logId: string) => void;
  onReport?: (logId: string) => void;
};

const LogItem = ({ log, currentUserId, onEdit, onDelete, onReport }: Props) => {
  const handleEdit = () => {
    onEdit?.();
  };

  const handleDelete = (logId: string) => {
    onDelete?.(logId);
  };

  const handleReport = (logId: string) => {
    onReport?.(logId);
  };

  return (
    <div className="bg-base-100 rounded-lg border border-base-300 p-6 mb-4">
      {/* Header */}
      <LogItemHeader
        log={log}
        currentUserId={currentUserId}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReport={handleReport}
      />

      {/* Game Details */}
      <LogItemDetails log={log} />

      {/* Review Text */}
      <LogItemReview
        reviewText={log.review_text || ""}
        containsSpoilers={log.contains_spoilers}
      />

      {/* Comments Section */}
      <CommentsSection logId={log.id} currentUserId={currentUserId} />
    </div>
  );
};

export default LogItem;
