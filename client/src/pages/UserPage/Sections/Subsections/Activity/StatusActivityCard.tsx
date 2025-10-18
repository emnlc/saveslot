import { Link, useParams } from "@tanstack/react-router";
import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";
import { StatusActivity } from "@/types/activity";
import { formatDate, getStatusText } from "@/utils/activityUtils";

interface StatusActivityCardProps {
  activity: StatusActivity;
}

export const StatusActivityCard = ({ activity }: StatusActivityCardProps) => {
  const { username } = useParams({ strict: false });
  const { profile: currentUser } = UserAuth();
  const { data: viewedProfile } = useProfile(username || "", currentUser?.id);
  const isOwnProfile = currentUser?.id === viewedProfile?.id;

  const displayName = viewedProfile?.display_name || "User";
  const { prefix, statusLabel } = getStatusText(
    activity.data.status,
    isOwnProfile
  );

  return (
    <div className="border border-base-300 rounded-lg p-4 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-info">Status Update</span>
            <span className="text-xs text-base-content/60">
              {formatDate(activity.timestamp)}
            </span>
          </div>
          <p className="text-base-content/60 text-sm">
            {!isOwnProfile && <>{displayName} </>}
            {prefix}{" "}
            {statusLabel && (
              <span className="text-base-content/80">{statusLabel}</span>
            )}{" "}
            <Link
              to="/games/$gamesSlug"
              params={{ gamesSlug: activity.data.game.slug }}
              className="text-base-content hover:text-primary transition-all"
            >
              {activity.data.game.name}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
