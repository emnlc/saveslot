import { Link } from "@tanstack/react-router";
import { GameListWithGames } from "@/Interface";
import { List, Heart } from "lucide-react";

interface ListCardProps {
  list: GameListWithGames;
}

const ListCard = ({ list }: ListCardProps) => {
  return (
    <Link
      to="/u/$username/list/$listslug"
      params={{
        username: list.profile.username,
        listslug: list.slug,
      }}
      className="group block p-4 rounded-xl bg-base-200/50 hover:bg-base-200 transition-all duration-200 border border-transparent hover:border-base-300"
    >
      {/* 5 game preview */}
      <div className="grid grid-cols-5 gap-1 mb-3">
        {list.top_games.slice(0, 5).map((game) => (
          <div
            key={game.id}
            className="relative rounded overflow-hidden bg-base-300 aspect-[90/128]"
          >
            {game.cover_id ? (
              <img
                src={`https://images.igdb.com/igdb/image/upload/t_cover_small/${game.cover_id}.jpg`}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <List className="w-4 h-4 text-base-content/30" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* list info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
          {list.name}
        </h3>

        <div className="flex items-center justify-between text-xs text-base-content/60">
          <div className="flex items-center gap-2">
            <img
              src={
                list.profile.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${list.profile.username}`
              }
              alt={list.profile.display_name || list.profile.username}
              className="w-5 h-5 rounded-full"
            />
            <span className="truncate">
              {list.profile.display_name || list.profile.username}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>{list.item_count} games</span>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{list.like_count}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListCard;
