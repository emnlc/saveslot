import type { LikedList } from "@/types/likes";
import { useListLikeCount } from "@/hooks/likes";
import { Heart, User } from "lucide-react";
import { Link } from "@tanstack/react-router";

type Props = {
  list: LikedList;
};

const LikedList = ({ list }: Props) => {
  const { data: likeCount } = useListLikeCount(list.id);

  return (
    <div className="flex flex-col gap-8">
      <div
        className="flex flex-col-reverse md:flex-row gap-2 md:gap-0"
        key={list.like_id}
      >
        <div className="flex flex-1">
          {list.preview_games && list.preview_games.length > 0 && (
            <Link
              to="/u/$username/list/$listslug"
              params={{
                username: list.author?.username || "",
                listslug: list.slug,
              }}
              className="flex w-full md:max-w-[479px] -space-x-[36px] h-fit rounded-lg overflow-x-auto md:overflow-x-hidden border-2 border-transparent hover:border-primary transition-all"
            >
              {list.preview_games.slice(0, 10).map((game, index) => (
                <div
                  key={game.id}
                  className="relative"
                  style={{ zIndex: 10 - index }}
                >
                  {game.cover_id ? (
                    <img
                      src={`https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover_id}.jpg`}
                      alt={`${game.name} cover`}
                      className="rounded w-20 min-w-20 object-scale-down"
                      style={{
                        boxShadow: "4px 0 6px -2px rgba(0,0,0,0.6)",
                      }}
                    />
                  ) : (
                    <div className="rounded w-16 h-24 bg-base-300 flex items-center justify-center">
                      <span className="text-xs text-base-content/50">
                        No Image
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </Link>
          )}
        </div>
        <div className="flex flex-col items-start gap-2 flex-1">
          <div className="flex flex-col items-start">
            <Link
              to="/u/$username/list/$listslug"
              params={{
                username: list.author?.username || "",
                listslug: list.slug,
              }}
              className="card-title text-lg hover:text-primary transition-all"
            >
              {list.name}
            </Link>
            {list.author && (
              <>
                <div className="flex items-center gap-2">
                  {list.author.avatar_url ? (
                    <img
                      src={list.author.avatar_url}
                      alt={list.author.display_name}
                      className="w-4 h-4 rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="text-sm text-base-content/60">
                    by{" "}
                    <Link
                      to="/u/$username"
                      params={{ username: list.author.username }}
                      className="hover:text-base-content/60 transition-all text-base-content"
                    >
                      @{list.author.username}
                    </Link>
                  </span>
                  <span className="text-sm text-base-content/60">
                    {list.game_count} games
                  </span>
                  <span className="flex flex-row items-center gap-1 text-sm text-base-content/60">
                    <Heart className="w-4 fill-base-content/60 stroke-0" />
                    {likeCount || 0}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LikedList;
