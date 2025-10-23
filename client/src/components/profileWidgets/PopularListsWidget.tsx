import { usePopularUserLists } from "@/hooks/lists/";
import { Link } from "@tanstack/react-router";
import { List, Heart, ArrowRight } from "lucide-react";

interface Props {
  userId: string;
  username?: string;
}

const PopularListsWidget = ({ userId, username }: Props) => {
  const { data: lists, isLoading } = usePopularUserLists(userId, 2);

  if (isLoading) {
    return (
      <div className="bg-base-100 p-4">
        <div className="pb-3 border-b border-base-300 mb-3">
          <h2 className="text-lg font-semibold">Popular Lists</h2>
        </div>
        <div className="space-y-3 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-base-300 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <div className="bg-base-100 p-4">
        <div className="pb-3 border-b border-base-300 mb-3">
          <h2 className="text-lg font-semibold">Popular Lists</h2>
        </div>
        <div className="text-center py-8">
          <List className="w-10 h-10 mx-auto mb-2 text-base-content/40" />
          <p className="text-sm text-base-content/60">No public lists yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-base-300 mb-3">
        <h2 className="text-lg font-semibold">Popular Lists</h2>
        {username && lists.length > 0 && (
          <Link
            to="/u/$username/lists"
            params={{ username }}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            See all
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div className="space-y-3">
        {lists.map((list) => (
          <Link
            key={list.id}
            to="/u/$username/list/$listslug"
            params={{ username: username || "", listslug: list.slug }}
            className="block border border-base-300 rounded hover:border-primary transition-colors overflow-hidden"
          >
            {/* Preview Images */}
            {list.preview_games.length > 0 && (
              <div className="p-3">
                <div className="flex">
                  {list.preview_games.map((game, index) => (
                    <div
                      key={game.id}
                      className="relative aspect-[2/3] w-1/4 overflow-hidden rounded"
                      style={{
                        marginLeft: index > 0 ? "-12px" : "0",
                        zIndex: 10 - index,
                      }}
                    >
                      {game.cover_id ? (
                        <img
                          src={`https://images.igdb.com/igdb/image/upload/t_cover_med/${game.cover_id}.jpg`}
                          alt={game.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-base-300 flex items-center justify-center rounded">
                          <span className="text-xl font-bold text-base-content/20">
                            {game.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List Info */}
            <div className="px-3 pb-3">
              <h3 className="font-semibold text-sm line-clamp-1 mb-2">
                {list.name}
              </h3>

              <div className="flex items-center gap-3 text-xs text-base-content/60">
                <div className="flex items-center gap-1">
                  <span>{list.item_count} Games</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 fill-base-content/60" stroke="0" />
                  <span>{list.like_count}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularListsWidget;
