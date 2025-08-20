import { UseProfileContext } from "@/context/ViewedProfileContext";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

type Props = {
  list: {
    id: string;
    name: string;
    created_at: string;
    is_public: boolean;
    game_count: number;
    slug: string;
    preview_games: Array<{
      id: string;
      name: string;
      cover_id: string | null;
      slug: string;
    }>;
  };
};

const ListCard = ({ list }: Props) => {
  const { viewedProfile } = UseProfileContext();
  return (
    <Link
      to="/u/$username/list/$listslug"
      params={{ listslug: list.slug, username: viewedProfile?.username || "" }}
      className="flex flex-col border border-base-300 rounded-lg p-2 md:p-4 hover:border-primary transition-all cursor-pointer h-full "
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-row items-center gap-2">
          <h3 className="font-semibold text-lg truncate">{list.name}</h3>
          {!list.is_public && <Lock className="w-4 h-4 text-base-content/50" />}
        </div>

        <span className="text-sm text-gray-500">
          {list.game_count} {list.game_count === 1 ? "game" : "games"}
        </span>
      </div>

      {/* Game Previews */}
      {list.game_count > 0 ? (
        <div className=" w-full">
          <div className="flex gap-[1px] sm:gap-0 w-full sm:-space-x-5 ">
            {list.preview_games.slice(0, 5).map((game, index) => (
              <div
                key={game.id}
                className="w-16 h-24 md:w-18 md:h-26 rounded bg-gray-200 flex items-center justify-center text-sm font-medium overflow-hidden flex-shrink-0 border border-base-300 shadow-md"
                style={{ zIndex: 10 - index }}
              >
                {game.cover_id ? (
                  <img
                    src={`https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover_id}.jpg`}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 font-bold text-sm sm:text-base">
                    {game.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center w-full h-full ">
            <span className="text-base-content/60">No games...</span>
          </div>
        </>
      )}
    </Link>
  );
};

export default ListCard;
