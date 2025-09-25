import { GameLogWithProfile } from "@/Interface";
import StarDisplay from "@/components/StarDisplay";
import LogDropdown from "./LogDropdown";

type Props = {
  log: GameLogWithProfile;
  currentUserId?: string;
  onEdit?: () => void;
  onDelete?: (logId: string) => void;
  onReport?: (logId: string) => void;
};

const LogItemHeader = ({
  log,
  currentUserId,
  onEdit,
  onDelete,
  onReport,
}: Props) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOwner = currentUserId === log.user_id;

  const handleDelete = () => {
    onDelete?.(log.id);
  };

  const handleReport = () => {
    onReport?.(log.id);
  };

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        {log.profile.avatar_url ? (
          <img
            src={log.profile.avatar_url}
            alt={log.profile.username}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-base-300 rounded-full flex items-center justify-center">
            <span className="text-base-content font-medium">
              {log.profile.display_name?.[0] || log.profile.username[0]}
            </span>
          </div>
        )}
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-base-content">
              {log.profile.display_name || log.profile.username}
            </h4>
            {log.rating && <StarDisplay rating={log.rating} size="md" />}
          </div>
          <p className="text-sm text-base-content/60">
            {formatDate(log.created_at)}
            {log.updated_at !== log.created_at && " (edited)"}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {currentUserId && (
          <LogDropdown
            onEdit={isOwner ? onEdit : undefined}
            onDelete={isOwner ? handleDelete : undefined}
            onReport={!isOwner ? handleReport : undefined}
            isOwner={isOwner}
            showAlways={true}
          />
        )}
      </div>
    </div>
  );
};

export default LogItemHeader;
