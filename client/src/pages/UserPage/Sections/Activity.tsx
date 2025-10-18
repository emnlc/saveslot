import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";
import { useUserActivity } from "@/hooks/UserActivityHooks/useUserActivity";
import { useParams } from "@tanstack/react-router";
import { ActivityCard } from "./Subsections/Activity/ActivityCard";

const Activity = () => {
  const { username } = useParams({ strict: false });
  const { profile: currentUser } = UserAuth();
  const { data: viewedProfile } = useProfile(username || "", currentUser?.id);
  const isOwnProfile = currentUser?.id === viewedProfile?.id;

  const {
    data: activities,
    isLoading,
    error,
    isError,
  } = useUserActivity(viewedProfile?.id || "", 14);

  if (!viewedProfile) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-medium">No Viewed Profile</h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-base-300 mx-auto mb-4"></div>
          <p className="text-base-content/60">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Error loading activity:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {isOwnProfile
              ? "Your Activity"
              : `${currentUser?.display_name || currentUser?.username}'s Activity`}
          </h2>
        </div>
        <div className="text-center py-12 bg-base-100 rounded-lg border border-base-300">
          <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
          <p className="text-base-content/60">
            {isOwnProfile
              ? "Start playing games and writing reviews to see your activity here!"
              : `${viewedProfile?.display_name} hasn't been active recently.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between">
        <h2 className="text-2xl font-bold">
          {isOwnProfile
            ? "Your Activity"
            : `${viewedProfile?.display_name}'s Activity`}
        </h2>
        <p className="self-end text-base-content/60 text-sm mt-1">
          Last 14 days
        </p>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
};

export default Activity;
