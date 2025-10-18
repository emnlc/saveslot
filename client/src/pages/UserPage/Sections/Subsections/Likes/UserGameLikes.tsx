import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";
import { useUserLikedGames } from "@/hooks/likes";
import { useParams } from "@tanstack/react-router";
import GameCard from "@/components/content/GameCard";

const UserGameLikes = () => {
  const { username } = useParams({ strict: false });
  const { profile: currentUser } = UserAuth();
  const { data: viewedProfile } = useProfile(username || "", currentUser?.id);
  const isOwnProfile = currentUser?.id === viewedProfile?.id;

  const {
    data: likedGames,
    isLoading,
    error,
    isError,
  } = useUserLikedGames(viewedProfile?.id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-base-300 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading liked games...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">
          Error loading liked games:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!likedGames || likedGames.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12 bg-base-100 rounded-lg border border-base-300">
          <h3 className="text-lg font-semibold mb-2">No liked games yet</h3>
          <p className="text-base-content/60">
            {isOwnProfile
              ? "Games you like will appear here!"
              : `${viewedProfile?.display_name} hasn't liked any games yet.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {likedGames.map((game) => (
        <GameCard
          key={game.id}
          id={game.id.toString()}
          name={game.name}
          slug={game.slug || ""}
          coverId={game.cover_id || ""}
        />
      ))}
    </div>
  );
};

export default UserGameLikes;
