import { UseProfileContext } from "@/context/ViewedProfileContext";
import { useUserLikedGames } from "@/hooks/UserLikeHooks/useUserLikedGames";
import { Heart } from "lucide-react";

import GameCard from "@/components/GameCard";

const UserGameLikes = () => {
  const { viewedProfile, isOwnProfile } = UseProfileContext();

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
          Error loading liked games: {error?.message}
        </p>
      </div>
    );
  }

  if (!likedGames || likedGames.length === 0) {
    return (
      <div className="p-8 text-center">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No liked games yet</h3>
        <p className="text-muted-foreground">
          {isOwnProfile
            ? "Games you like will appear here!"
            : `${viewedProfile?.display_name} hasn't liked any games yet.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {likedGames.map((game) => (
        <GameCard
          id={game.id}
          name={game.name}
          slug={game.slug || ""}
          coverId={game.cover_id || ""}
        />
      ))}
    </div>
  );
};

export default UserGameLikes;
