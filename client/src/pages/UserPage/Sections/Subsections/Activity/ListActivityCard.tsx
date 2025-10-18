import { Link, useParams } from "@tanstack/react-router";
import { List } from "lucide-react";
import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";
import { ListActivity } from "@/types/activity";
import { formatDate } from "@/utils/activityUtils";

interface ListActivityCardProps {
  activity: ListActivity;
}

export const ListActivityCard = ({ activity }: ListActivityCardProps) => {
  const { username } = useParams({ strict: false });
  const { profile: currentUser } = UserAuth();
  const { data: viewedProfile } = useProfile(username || "", currentUser?.id);
  const isOwnProfile = currentUser?.id === viewedProfile?.id;

  return (
    <div className="border border-base-300 rounded-lg p-4 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            <List className="w-4 h-4 text-secondary flex-shrink-0" />
            <span className="text-sm font-medium text-secondary">
              Created List
            </span>
            <span className="text-xs text-base-content/60">
              {formatDate(activity.timestamp)}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-base-content/60 text-sm">
              {isOwnProfile ? "You" : viewedProfile?.display_name || "User"}{" "}
              created new list
            </span>
            <Link
              to="/u/$username/list/$listslug"
              params={{
                username: viewedProfile?.username || "",
                listslug: activity.data.slug,
              }}
              className="text-sm text-base-content hover:text-primary transition-all"
            >
              {activity.data.name}
            </Link>
            <span className="text-xs text-base-content/60">
              {activity.data.gameCount}{" "}
              {activity.data.gameCount === 1 ? "game" : "games"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
