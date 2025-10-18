import { useGamesByStatus } from "@/hooks/userGames";
import { Link } from "@tanstack/react-router";
import { Gamepad2, ArrowRight } from "lucide-react";
import GameCard from "../content/GameCard";

interface Props {
  userId: string;
  username?: string;
}

const CurrentlyPlayingWidget = ({ userId, username }: Props) => {
  const { data: games, isLoading } = useGamesByStatus(userId, "playing", 5);

  if (isLoading) {
    return (
      <div className="bg-base-100 p-4">
        <div className="pb-3 border-b border-base-300 mb-3">
          <h2 className="text-lg font-semibold">Currently Playing</h2>
        </div>
        <div className="grid grid-cols-5 gap-2 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-base-300 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="bg-base-100 p-4">
        <div className="pb-3 border-b border-base-300 mb-3">
          <h2 className="text-lg font-semibold">Currently Playing</h2>
        </div>
        <div className="text-center py-8">
          <Gamepad2 className="w-10 h-10 mx-auto mb-2 text-base-content/40" />
          <p className="text-sm text-base-content/60">No games being played</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-base-300 mb-3">
        <h2 className="text-lg font-semibold">Currently Playing</h2>
        {username && (
          <Link
            to="/u/$username/games"
            params={{ username }}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            See all
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-5 gap-1">
        {games.map((userGame) => (
          <GameCard
            key={userGame.id}
            id={userGame.game_id.toString()}
            slug={userGame.game.slug}
            coverId={userGame.game.cover_id ?? ""}
          />
        ))}
      </div>
    </div>
  );
};

export default CurrentlyPlayingWidget;
