import { Link } from "@tanstack/react-router";
import { MessageSquare, BookOpen } from "lucide-react";
import StarDisplay from "@/components/StarDisplay";
import { ReviewActivity } from "@/hooks/UserActivityHooks/useUserActivity";
import { formatDate, getCoverUrl } from "@/utils/activityUtils";

interface ReviewActivityCardProps {
  activity: ReviewActivity;
}

export const ReviewActivityCard = ({ activity }: ReviewActivityCardProps) => {
  const hasRating =
    activity.data.rating !== null && activity.data.rating !== undefined;

  if (hasRating) {
    return (
      <div className="border border-base-300 rounded-lg p-4 transition-colors">
        <div className="flex gap-4">
          <Link
            to="/games/$gamesSlug"
            params={{ gamesSlug: activity.data.game.slug }}
          >
            <img
              src={getCoverUrl(activity.data.game.cover_id)}
              alt={activity.data.game.name}
              className="w-24 h-full object-cover rounded-sm"
            />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Reviewed</span>
              <span className="text-xs text-base-content/60">
                {formatDate(activity.timestamp)}
              </span>
            </div>
            <Link
              to="/games/$gamesSlug"
              params={{ gamesSlug: activity.data.game.slug }}
              className="font-medium hover:text-primary transition-all"
            >
              {activity.data.game.name}
            </Link>
            <div className="flex items-center gap-1 mt-2">
              <StarDisplay rating={activity.data.rating} />
              {activity.data.containsSpoilers && (
                <span className="badge badge-warning badge-sm">Spoilers</span>
              )}
            </div>
            {activity.data.reviewText && (
              <p className="text-sm mt-2 line-clamp-2">
                {activity.data.reviewText}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Log entry without rating
  return (
    <div className="border border-base-300 rounded-lg p-4 transition-colors">
      <div className="flex gap-4">
        <Link
          to="/games/$gamesSlug"
          params={{ gamesSlug: activity.data.game.slug }}
        >
          <img
            src={getCoverUrl(activity.data.game.cover_id)}
            alt={activity.data.game.name}
            className="w-24 h-full object-cover rounded-sm"
          />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            <BookOpen className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Logged</span>
            <span className="text-xs text-base-content/60">
              {formatDate(activity.timestamp)}
            </span>
          </div>
          <Link
            to="/games/$gamesSlug"
            params={{ gamesSlug: activity.data.game.slug }}
            className="font-medium hover:text-primary transition-all"
          >
            {activity.data.game.name}
          </Link>
          {activity.data.reviewText && (
            <p className="text-sm mt-2 line-clamp-2">
              {activity.data.reviewText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
