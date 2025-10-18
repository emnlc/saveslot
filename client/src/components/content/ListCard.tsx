import { useProfile } from "@/hooks/profiles";
import { UserAuth } from "@/context/AuthContext";
import { Link, useParams } from "@tanstack/react-router";
import { Lock, Heart } from "lucide-react";
import { useListLikeCount } from "@/hooks/likes";

type Props = {
  list: {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    is_public: boolean;
    last_updated: string;
    game_count: number;
    preview_games: Array<{
      id: number;
      name: string;
      cover_id: string | null;
      slug: string;
      is_nsfw: boolean;
    }>;
  };
};

const ListCard = ({ list }: Props) => {
  const { username } = useParams({ strict: false });
  const { profile: currentUser } = UserAuth();
  const { data: viewedProfile } = useProfile(username || "", currentUser?.id);
  const { data: likeCount } = useListLikeCount(list.id);

  return (
    <Link
      to="/u/$username/list/$listslug"
      params={{ listslug: list.slug, username: viewedProfile?.username || "" }}
      className="flex flex-col border border-base-300 rounded-lg p-2 md:p-4 hover:border-primary transition-all cursor-pointer h-full"
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

      {list.game_count > 0 ? (
        <div className="w-full mb-3">
          <div className="flex gap-[1px] sm:gap-0 w-full sm:-space-x-5">
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
        <div className="flex items-center justify-center w-full h-full mb-3">
          <span className="text-base-content/60">No games...</span>
        </div>
      )}

      <span className="flex flex-row items-center gap-2 text-sm text-gray-500">
        {likeCount || 0}
        <Heart className="w-[14px]" fill="#6a7282" />
      </span>
    </Link>
  );
};

export default ListCard;
