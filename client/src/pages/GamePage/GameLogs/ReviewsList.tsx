import { GameLogWithProfile, LogFilters } from "@/Interface";
import { useDeleteGameLog } from "@/hooks/gameLogs";
import LogItem from "./LogItems/LogItem";

type Props = {
  logs: GameLogWithProfile[];
  currentUserId?: string;
  filters: LogFilters;
  isLoading: boolean;
  onLoadMore: () => void;
  onEditLog?: (logId: string) => void;
};

const ReviewsList = ({
  logs,
  currentUserId,
  filters,
  isLoading,
  onLoadMore,
  onEditLog,
}: Props) => {
  const deleteLogMutation = useDeleteGameLog();

  const handleEditLog = (logId: string) => {
    onEditLog?.(logId);
  };

  const handleDeleteLog = async (logId: string) => {
    if (!currentUserId) return;

    try {
      await deleteLogMutation.mutateAsync({
        logId,
        userId: currentUserId,
      });
    } catch (error) {
      console.error("Error deleting log:", error);
      alert("Failed to delete log. Please try again.");
    }
  };

  const handleReportLog = (logId: string) => {
    console.log("Report log:", logId);
    alert("Thank you for your report. We will review it shortly.");
  };

  return (
    <>
      <div className="space-y-4">
        {logs.map((log) => (
          <LogItem
            key={log.id}
            log={log}
            currentUserId={currentUserId}
            onEdit={() => handleEditLog(log.id)}
            onDelete={handleDeleteLog}
            onReport={handleReportLog}
          />
        ))}
      </div>

      {/* Load More Button */}
      {logs.length >= filters.limit! && (
        <div className="text-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="btn btn-outline"
          >
            {isLoading ? "Loading..." : "Load More Reviews"}
          </button>
        </div>
      )}
    </>
  );
};

export default ReviewsList;
