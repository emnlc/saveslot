import { Hono } from "hono";
import { supabase } from "../../lib/supabase";

export const listsRoutes = new Hono();

const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

listsRoutes.get("/user/:user_id", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { data: lists, error: listsError } = await supabase
      .from("game_lists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (listsError) throw listsError;
    if (!lists || lists.length === 0) return c.json([]);

    const listIds = lists.map((list) => list.id);

    const { data: allItems, error: itemsError } = await supabase
      .from("game_list_items")
      .select("list_id, game_id, rank")
      .in("list_id", listIds)
      .order("rank", { ascending: true });

    if (itemsError) throw itemsError;

    const listData: {
      [key: string]: { count: number; gameIds: number[] };
    } = {};

    allItems?.forEach((item) => {
      if (!listData[item.list_id]) {
        listData[item.list_id] = { count: 0, gameIds: [] };
      }
      listData[item.list_id].count++;
      if (listData[item.list_id].gameIds.length < 5) {
        listData[item.list_id].gameIds.push(item.game_id);
      }
    });

    const allGameIds = Object.values(listData).flatMap((data) => data.gameIds);
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, name, cover_id, slug, is_nsfw")
      .in("id", allGameIds);

    if (gamesError) throw gamesError;

    const gameMap: { [key: number]: any } = {};
    games?.forEach((game) => {
      gameMap[game.id] = game;
    });

    const enrichedLists = lists.map((list) => {
      const data = listData[list.id] || { count: 0, gameIds: [] };
      const previewGames = data.gameIds
        .map((gameId) => gameMap[gameId])
        .filter((game) => game && !game.is_nsfw);

      return {
        ...list,
        game_count: data.count,
        preview_games: previewGames,
      };
    });

    return c.json(enrichedLists);
  } catch (err) {
    console.error("Error fetching user lists:", err);
    return c.json({ error: "Failed to fetch user lists" }, 500);
  }
});

listsRoutes.get("/user/:user_id/popular", async (c) => {
  try {
    const userId = c.req.param("user_id");
    const limit = parseInt(c.req.query("limit") || "3");

    const { data: lists, error: listsError } = await supabase
      .from("game_lists")
      .select(
        `
        id,
        name,
        slug,
        is_public,
        created_at,
        last_updated,
        user_id
      `
      )
      .eq("user_id", userId)
      .eq("is_public", true)
      .order("last_updated", { ascending: false });

    if (listsError) throw listsError;
    if (!lists || lists.length === 0) return c.json([]);

    const listIds = lists.map((list) => list.id);

    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("list_id")
      .in("list_id", listIds)
      .not("list_id", "is", null);

    if (likesError) throw likesError;

    const likeCountMap: { [key: string]: number } = {};
    likes?.forEach((like) => {
      if (like.list_id) {
        likeCountMap[like.list_id] = (likeCountMap[like.list_id] || 0) + 1;
      }
    });

    const { data: allItems, error: itemsError } = await supabase
      .from("game_list_items")
      .select("list_id, game_id, rank")
      .in("list_id", listIds)
      .order("rank", { ascending: true });

    if (itemsError) throw itemsError;

    const listData: {
      [key: string]: { count: number; gameIds: number[] };
    } = {};

    allItems?.forEach((item) => {
      if (!listData[item.list_id]) {
        listData[item.list_id] = { count: 0, gameIds: [] };
      }
      listData[item.list_id].count++;
      if (listData[item.list_id].gameIds.length < 5) {
        listData[item.list_id].gameIds.push(item.game_id);
      }
    });

    const allGameIds = Object.values(listData).flatMap((data) => data.gameIds);
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, name, cover_id, slug, is_nsfw")
      .in("id", allGameIds);

    if (gamesError) throw gamesError;

    const gameMap: { [key: number]: any } = {};
    games?.forEach((game) => {
      gameMap[game.id] = game;
    });

    const listsWithStats = lists
      .map((list) => {
        const data = listData[list.id] || { count: 0, gameIds: [] };
        const previewGames = data.gameIds
          .map((gameId) => gameMap[gameId])
          .filter((game) => game && !game.is_nsfw);

        return {
          ...list,
          like_count: likeCountMap[list.id] || 0,
          item_count: data.count,
          preview_games: previewGames,
        };
      })
      .sort((a, b) => b.like_count - a.like_count)
      .slice(0, limit);

    return c.json(listsWithStats);
  } catch (err) {
    console.error("Error fetching popular lists:", err);
    return c.json({ error: "Failed to fetch popular lists" }, 500);
  }
});

listsRoutes.get("/:username/:list_slug", async (c) => {
  try {
    const username = c.req.param("username");
    const listSlug = c.req.param("list_slug");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (profileError || !profile) {
      return c.json({ error: "User not found" }, 404);
    }

    const { data: listData, error: listError } = await supabase
      .from("game_lists")
      .select("id, name, slug, is_public, user_id, created_at, last_updated")
      .eq("slug", listSlug)
      .eq("user_id", profile.id)
      .single();

    if (listError || !listData) {
      return c.json({ error: "List not found" }, 404);
    }

    const { data: listItems, error: itemsError } = await supabase
      .from("game_list_items")
      .select("id, game_id, rank")
      .eq("list_id", listData.id)
      .order("rank", { ascending: true });

    if (itemsError) throw itemsError;

    if (!listItems || listItems.length === 0) {
      return c.json({
        ...listData,
        games: [],
      });
    }

    const gameIds = listItems.map((item) => item.game_id);

    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select(
        "id, name, cover_id, slug, is_released, official_release_date, igdb_total_rating, popularity, is_nsfw"
      )
      .in("id", gameIds);

    if (gamesError) throw gamesError;

    const gameMap = new Map(games?.map((game) => [game.id, game]) || []);

    const enrichedItems = listItems
      .map((item) => {
        const game = gameMap.get(item.game_id);
        if (!game) return null;

        return {
          id: item.id,
          rank: item.rank,
          games: game,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return c.json({
      ...listData,
      games: enrichedItems,
    });
  } catch (err) {
    console.error("Error fetching list items:", err);
    return c.json({ error: "Failed to fetch list items" }, 500);
  }
});

listsRoutes.post("/", async (c) => {
  try {
    const { name, is_public, user_id } = await c.req.json();

    if (!name || !user_id) {
      return c.json({ error: "Name and user_id are required" }, 400);
    }

    const slug = createSlug(name);

    const { data: existingList } = await supabase
      .from("game_lists")
      .select("id")
      .eq("slug", slug)
      .eq("user_id", user_id)
      .single();

    if (existingList) {
      return c.json({ error: "A list with this name already exists" }, 409);
    }

    const { data, error } = await supabase
      .from("game_lists")
      .insert({
        name,
        slug,
        is_public: is_public ?? true,
        user_id,
      })
      .select()
      .single();

    if (error) throw error;

    return c.json(data, 201);
  } catch (err) {
    console.error("Error creating list:", err);
    return c.json({ error: "Failed to create list" }, 500);
  }
});

listsRoutes.patch("/:list_id", async (c) => {
  try {
    const listId = c.req.param("list_id");
    const { name, is_public } = await c.req.json();

    const updates: any = { last_updated: new Date().toISOString() };

    if (name) {
      const slug = createSlug(name);

      const { data: existingList } = await supabase
        .from("game_lists")
        .select("id, user_id")
        .eq("slug", slug)
        .neq("id", listId)
        .single();

      if (existingList) {
        return c.json({ error: "A list with this name already exists" }, 409);
      }

      updates.name = name;
      updates.slug = slug;
    }

    if (is_public !== undefined) {
      updates.is_public = is_public;
    }

    const { data, error } = await supabase
      .from("game_lists")
      .update(updates)
      .eq("id", listId)
      .select()
      .single();

    if (error) throw error;

    return c.json(data);
  } catch (err) {
    console.error("Error updating list:", err);
    return c.json({ error: "Failed to update list" }, 500);
  }
});

listsRoutes.delete("/:list_id", async (c) => {
  try {
    const listId = c.req.param("list_id");

    await supabase.from("game_list_items").delete().eq("list_id", listId);

    const { error } = await supabase
      .from("game_lists")
      .delete()
      .eq("id", listId);

    if (error) throw error;

    return c.json({ success: true });
  } catch (err) {
    console.error("Error deleting list:", err);
    return c.json({ error: "Failed to delete list" }, 500);
  }
});

listsRoutes.post("/:list_id/games", async (c) => {
  try {
    const listId = c.req.param("list_id");
    const { game_id } = await c.req.json();

    if (!game_id) {
      return c.json({ error: "game_id is required" }, 400);
    }

    const { data: existingItem } = await supabase
      .from("game_list_items")
      .select("id")
      .eq("list_id", listId)
      .eq("game_id", game_id)
      .single();

    if (existingItem) {
      return c.json({ error: "Game is already in this list" }, 409);
    }

    const { data: maxRankData } = await supabase
      .from("game_list_items")
      .select("rank")
      .eq("list_id", listId)
      .order("rank", { ascending: false })
      .limit(1)
      .single();

    const nextRank = maxRankData ? maxRankData.rank + 1 : 1;

    const { data, error } = await supabase
      .from("game_list_items")
      .insert({
        list_id: listId,
        game_id,
        rank: nextRank,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from("game_lists")
      .update({ last_updated: new Date().toISOString() })
      .eq("id", listId);

    return c.json(data, 201);
  } catch (err) {
    console.error("Error adding game to list:", err);
    return c.json({ error: "Failed to add game to list" }, 500);
  }
});

listsRoutes.delete("/:list_id/games/:game_id", async (c) => {
  try {
    const listId = c.req.param("list_id");
    const gameId = c.req.param("game_id");

    const { error } = await supabase
      .from("game_list_items")
      .delete()
      .eq("list_id", listId)
      .eq("game_id", gameId);

    if (error) throw error;

    await supabase
      .from("game_lists")
      .update({ last_updated: new Date().toISOString() })
      .eq("id", listId);

    return c.json({ success: true });
  } catch (err) {
    console.error("Error removing game from list:", err);
    return c.json({ error: "Failed to remove game from list" }, 500);
  }
});

listsRoutes.patch("/:list_id/ranks", async (c) => {
  try {
    const listId = c.req.param("list_id");
    const { updates } = await c.req.json();

    if (!Array.isArray(updates) || updates.length === 0) {
      return c.json({ error: "Invalid updates array" }, 400);
    }

    const promises = updates.map(({ item_id, rank }: any) =>
      supabase
        .from("game_list_items")
        .update({ rank })
        .eq("id", item_id)
        .eq("list_id", listId)
    );

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result.error) throw result.error;
    }

    await supabase
      .from("game_lists")
      .update({ last_updated: new Date().toISOString() })
      .eq("id", listId);

    return c.json({ success: true });
  } catch (err) {
    console.error("Error updating ranks:", err);
    return c.json({ error: "Failed to update ranks" }, 500);
  }
});
