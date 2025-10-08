import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { UseProfileContext } from "@/context/ViewedProfileContext";
import { LikeActivity } from "@/hooks/UserActivityHooks/useUserActivity";
import { formatDate } from "@/utils/activityUtils";

interface LikeActivityCardProps {
  activity: LikeActivity;
}

export const LikeActivityCard = ({ activity }: LikeActivityCardProps) => {
  const { viewedProfile, isOwnProfile } = UseProfileContext();

  return (
    <div className="border border-base-300 rounded-lg p-4 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          {activity.data.targetType === "game" && activity.data.game && (
            <>
              <div className="flex items-center gap-1 mb-1">
                <Heart className="w-4 h-4 text-error flex-shrink-0 fill-current" />
                <span className="text-sm font-medium text-error">
                  Liked Game
                </span>
                <span className="text-xs text-base-content/60">
                  {formatDate(activity.timestamp)}
                </span>
              </div>
              <span className="text-base-content/60 text-sm">
                {isOwnProfile ? "You" : viewedProfile?.display_name || "User"}{" "}
                liked
              </span>{" "}
              <Link
                to="/games/$gamesSlug"
                params={{ gamesSlug: activity.data.game.slug }}
                className="text-sm hover:text-primary transition-all"
              >
                {activity.data.game.name}
              </Link>
            </>
          )}

          {activity.data.targetType === "review" && activity.data.review && (
            <>
              <div className="flex items-center gap-1 mb-1">
                <Heart className="w-4 h-4 text-error flex-shrink-0 fill-current" />
                <span className="text-sm font-medium text-error">
                  Liked Review
                </span>
                <span className="text-xs text-base-content/60">
                  {formatDate(activity.timestamp)}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-base-content/60 text-sm">
                  {isOwnProfile ? "You" : viewedProfile?.display_name || "User"}{" "}
                  liked a review for
                </span>
                <Link
                  to="/u/$username/reviews"
                  params={{ username: viewedProfile?.username || "" }}
                  className="text-sm hover:text-primary transition-all"
                >
                  {activity.data.review.games.name}
                </Link>
              </div>
            </>
          )}

          {activity.data.targetType === "list" && activity.data.list && (
            <>
              <div className="flex items-center gap-1 mb-1">
                <Heart className="w-4 h-4 text-error flex-shrink-0 fill-current" />
                <span className="text-sm font-medium text-error">
                  Liked List
                </span>
                <span className="text-xs text-base-content/60">
                  {formatDate(activity.timestamp)}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-base-content/60 text-sm">
                  {isOwnProfile ? "You" : viewedProfile?.display_name || "User"}{" "}
                  liked
                </span>
                <Link
                  to="/u/$username/list/$listslug"
                  params={{
                    username: activity.data.list.users?.username || "",
                    listslug: activity.data.list.slug,
                  }}
                  className="text-sm hover:text-primary transition-all"
                >
                  {activity.data.list.name}
                </Link>
                {activity.data.list.users && (
                  <>
                    <span className="text-base-content/60 text-sm">by</span>
                    <div className="flex items-center gap-1">
                      <img
                        src={
                          activity.data.list.users.avatar_url ||
                          "/default-avatar.png"
                        }
                        alt={activity.data.list.users.display_name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <Link
                        to="/u/$username"
                        params={{
                          username: activity.data.list.users.username,
                        }}
                        className="text-sm hover:text-primary transition-all"
                      >
                        {activity.data.list.users.display_name}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
