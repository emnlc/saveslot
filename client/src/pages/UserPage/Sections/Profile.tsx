import { useParams } from "@tanstack/react-router";
import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";
import {
  FavoriteGamesWidget,
  StatsOverviewWidget,
  RecentReviewsWidget,
  CurrentlyPlayingWidget,
  RatingDistributionWidget,
  TopGenresWidget,
  TopPlatformsWidget,
  ActivityHeatmapWidget,
} from "@/components/profileWidgets";
import AddFavoriteModal from "@/components/modals/addFavoriteModal";
import { useState } from "react";
import PopularListsWidget from "@/components/profileWidgets/PopularListsWidget";
import { useProfileLayout } from "@/hooks/profiles";
import WidgetWrapper from "@/components/profileWidgets/WidgetWrapper";

const Profile = () => {
  const { username } = useParams({ strict: false });
  const { profile: currentUser } = UserAuth();
  const { data: viewedProfile } = useProfile(username || "", currentUser?.id);
  const { data: layout, isLoading: layoutLoading } = useProfileLayout(
    viewedProfile?.id || ""
  );
  const isOwnProfile = currentUser?.id === viewedProfile?.id;
  const [showAddFavoriteModal, setShowAddFavoriteModal] = useState(false);

  if (!viewedProfile || layoutLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-base-300 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isEnabled = (widgetId: string) => layout?.[widgetId] ?? true;

  return (
    <div className="max-w-7xl mx-auto p-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 space-y-4">
          <WidgetWrapper enabled={isEnabled("stats")}>
            <StatsOverviewWidget userId={viewedProfile.id} />
          </WidgetWrapper>

          <WidgetWrapper enabled={isEnabled("favorites")}>
            <FavoriteGamesWidget
              userId={viewedProfile.id}
              isOwnProfile={isOwnProfile}
              onAddClick={() => setShowAddFavoriteModal(true)}
            />
          </WidgetWrapper>

          <WidgetWrapper enabled={isEnabled("currently_playing")}>
            <CurrentlyPlayingWidget
              userId={viewedProfile.id}
              username={viewedProfile.username}
            />
          </WidgetWrapper>

          <WidgetWrapper enabled={isEnabled("recent_reviews")}>
            <RecentReviewsWidget
              userId={viewedProfile.id}
              username={viewedProfile.username}
            />
          </WidgetWrapper>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <WidgetWrapper enabled={isEnabled("heatmap")}>
            <ActivityHeatmapWidget userId={viewedProfile.id} compact />
          </WidgetWrapper>

          <WidgetWrapper enabled={isEnabled("rating_distribution")}>
            <RatingDistributionWidget userId={viewedProfile.id} />
          </WidgetWrapper>

          <WidgetWrapper enabled={isEnabled("popular_lists")}>
            <PopularListsWidget
              userId={viewedProfile.id}
              username={viewedProfile.username}
            />
          </WidgetWrapper>

          <WidgetWrapper enabled={isEnabled("top_platforms")}>
            <TopPlatformsWidget userId={viewedProfile.id} />
          </WidgetWrapper>

          <WidgetWrapper enabled={isEnabled("top_genres")}>
            <TopGenresWidget userId={viewedProfile.id} />
          </WidgetWrapper>
        </div>
      </div>

      {currentUser && (
        <AddFavoriteModal
          userId={currentUser.id}
          onClose={() => setShowAddFavoriteModal(false)}
          isOpen={showAddFavoriteModal}
        />
      )}
    </div>
  );
};

export default Profile;
