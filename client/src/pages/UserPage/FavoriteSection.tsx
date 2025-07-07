import { supabase } from "@/services/supabase";
import { useEffect, useState } from "react";

import GameCard from "@/components/GameCard";

type Props = {
  userId: string;
};

type GameList = {
  id: string;
  user_id: string;
  name: string;
};

type GameListItem = {
  id: string;
  game_id: number;
  added_at: string;
  games: {
    name: string;
    slug: string;
    cover_id: string;
  } | null;
};

const FavoritesListFetcher = ({ userId }: Props) => {
  const [favoritesList, setFavoritesList] = useState<GameList | null>(null);
  const [listItems, setListItems] = useState<GameListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchFavoritesListAndItems = async () => {
      setLoading(true);
      setError(null);

      const { data: list, error: listError } = await supabase
        .from("game_lists")
        .select("id, user_id, name")
        .eq("user_id", userId)
        .eq("name", "Favorites")
        .single();

      if (listError || !list) {
        setError(listError?.message || "Favorites list not found");
        setFavoritesList(null);
        setListItems([]);
        setLoading(false);
        return;
      }

      setFavoritesList(list);

      const { data: items, error: itemsError } = await supabase
        .from("game_list_items")
        .select(
          `
            id, 
            game_id, 
            added_at, 
            games!inner(name, cover_id, slug)
        `
        )
        .eq("list_id", list.id);

      if (itemsError) {
        setError(itemsError.message);
        setListItems([]);
      } else {
        setListItems((items || []) as unknown as GameListItem[]);
      }

      setLoading(false);
    };

    fetchFavoritesListAndItems();
  }, [userId]);

  if (loading) return <div>Loading favorites list and items...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!favoritesList) return <div>No Favorites list found.</div>;

  return (
    <div>
      {listItems.length === 0 ? (
        <p>No games in this list.</p>
      ) : (
        <>
          <h3 className="text-xl font-semibold mb-2">🎮 Favorite Games</h3>

          <div className=" grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:mx-auto container mb-16 gap-4 place-items-center join">
            {listItems.map((item) => (
              <>
                {item.games ? (
                  <GameCard
                    name={item.games.name}
                    id={item.game_id}
                    slug={item.games.slug}
                    coverId={item.games.cover_id}
                  />
                ) : (
                  <></>
                )}
              </>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FavoritesListFetcher;
