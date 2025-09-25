import { Calendar, Clock } from "lucide-react";
import { GameLogWithProfile } from "@/Interface";

type Props = {
  log: GameLogWithProfile;
};

const LogItemDetails = ({ log }: Props) => {
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

  const hasDetails =
    log.game_status ||
    log.platform ||
    log.play_start_date ||
    log.play_end_date ||
    log.hours_played > 0 ||
    log.minutes_played > 0;

  if (!hasDetails) return null;

  return (
    <div className="flex flex-wrap gap-4 mb-4 text-xs md:text-sm text-base-content/60">
      {log.game_status && (
        <div className="flex items-center space-x-2">
          <span
            className={`w-3 h-3 rounded-full ${getStatusColor(log.game_status)}`}
          />
          <span className="capitalize">
            {log.game_status.replace("_", " ")}
          </span>
        </div>
      )}

      {log.platform && (
        <div>
          <span className="capitalize">{log.platform}</span>
        </div>
      )}

      {(log.play_start_date || log.play_end_date) && (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
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
          <Clock className="w-4 h-4 mr-1" />
          <span>{formatPlayTime(log.hours_played, log.minutes_played)}</span>
        </div>
      )}
    </div>
  );
};

export default LogItemDetails;
