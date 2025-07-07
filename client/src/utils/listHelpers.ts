import { supabase } from "@/services/supabase";

export const createGameList = async (name: string, isPublic: boolean) => {
  const user = (await supabase.auth.getUser()).data.user;
  const { data, error } = await supabase
    .from("game_lists")
    .insert([{ name, user_id: user?.id, is_public: isPublic }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const addGameToList = async (listId: string, gameId: number) => {
  const { error } = await supabase
    .from("game_list_items")
    .insert([{ list_id: listId, game_id: gameId }]);

  if (error) throw new Error(error.message);
};

export const addGameToFavorites = async (gameId: number) => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("User not logged in");

  let { data: list } = await supabase
    .from("game_lists")
    .select("*")
    .eq("user_id", user.id)
    .eq("name", "Favorites")
    .single();

  if (!list) {
    const { data: newList, error: createError } = await supabase
      .from("game_lists")
      .insert([{ user_id: user.id, name: "Favorites" }])
      .select()
      .single();

    if (createError) throw new Error(createError.message);
    list = newList;
  }

  const { error: insertError } = await supabase
    .from("game_list_items")
    .insert([{ list_id: list.id, game_id: gameId }])
    .select();

  if (insertError && insertError.code !== "23505") {
    throw new Error(insertError.message);
  }

  return list;
};

export const isGameInFavorites = async (gameId: number): Promise<boolean> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return false;

  const { data: list } = await supabase
    .from("game_lists")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", "Favorites")
    .single();

  if (!list) return false;

  const { data: item } = await supabase
    .from("game_list_items")
    .select("id")
    .eq("list_id", list.id)
    .eq("game_id", gameId)
    .single();

  return !!item;
};
