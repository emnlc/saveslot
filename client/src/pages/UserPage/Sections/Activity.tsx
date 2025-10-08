import { UseProfileContext } from "@/context/ViewedProfileContext";
import { useUserActivity } from "@/hooks/UserActivityHooks/useUserActivity";
import { ActivityCard } from "./Subsections/Activity/ActivityCard";

const Activity = () => {
  const { viewedProfile, isOwnProfile } = UseProfileContext();

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
          <p className="text-muted-foreground">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading activity: {error?.message}</p>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No recent activity</h3>
        <p className="text-muted-foreground">
          {isOwnProfile
            ? "Start playing games and writing reviews to see your activity here!"
            : `${viewedProfile?.display_name} hasn't been active recently.`}
        </p>
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
        <p className="self-end text-muted-foreground text-sm mt-1 text-base-content/60">
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
