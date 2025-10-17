import { Hono } from "hono";
import { supabase } from "../../lib/supabase";

export const followsRoutes = new Hono();

followsRoutes.get("/stats/:user_id", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { count: followersCount, error: followersError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    const { count: followingCount, error: followingError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (followersError || followingError) {
      throw followersError || followingError;
    }

    return c.json({
      followers: followersCount ?? 0,
      following: followingCount ?? 0,
    });
  } catch (err) {
    console.error("Error fetching follow stats:", err);
    return c.json({ error: "Failed to fetch follow stats" }, 500);
  }
});

followsRoutes.get("/followers/:user_id", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { data: follows, error: followsError } = await supabase
      .from("follows")
      .select("follower_id, created_at")
      .eq("following_id", userId)
      .order("created_at", { ascending: false });

    if (followsError) throw followsError;
    if (!follows || follows.length === 0) return c.json([]);

    const followerIds = follows.map((f) => f.follower_id);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio")
      .in("id", followerIds);

    if (profilesError) throw profilesError;

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    const result = follows
      .map((follow) => {
        const profile = profileMap.get(follow.follower_id);
        if (!profile) return null;
        return {
          ...profile,
          followed_at: follow.created_at,
        };
      })
      .filter(Boolean);

    return c.json(result);
  } catch (err) {
    console.error("Error fetching followers:", err);
    return c.json({ error: "Failed to fetch followers" }, 500);
  }
});

followsRoutes.get("/following/:user_id", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { data: follows, error: followsError } = await supabase
      .from("follows")
      .select("following_id, created_at")
      .eq("follower_id", userId)
      .order("created_at", { ascending: false });

    if (followsError) throw followsError;
    if (!follows || follows.length === 0) return c.json([]);

    const followingIds = follows.map((f) => f.following_id);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio")
      .in("id", followingIds);

    if (profilesError) throw profilesError;

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    const result = follows
      .map((follow) => {
        const profile = profileMap.get(follow.following_id);
        if (!profile) return null;
        return {
          ...profile,
          followed_at: follow.created_at,
        };
      })
      .filter(Boolean);

    return c.json(result);
  } catch (err) {
    console.error("Error fetching following:", err);
    return c.json({ error: "Failed to fetch following" }, 500);
  }
});

followsRoutes.get("/check/:follower_id/:following_id", async (c) => {
  try {
    const followerId = c.req.param("follower_id");
    const followingId = c.req.param("following_id");

    if (followerId === followingId) {
      return c.json({ is_following: false });
    }

    const { count, error } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (error) throw error;

    return c.json({ is_following: (count ?? 0) > 0 });
  } catch (err) {
    console.error("Error checking follow status:", err);
    return c.json({ error: "Failed to check follow status" }, 500);
  }
});

followsRoutes.post("/", async (c) => {
  try {
    const { follower_id, following_id } = await c.req.json();

    if (!follower_id || !following_id) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (follower_id === following_id) {
      return c.json({ error: "You cannot follow yourself" }, 400);
    }

    const { count, error: checkError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", follower_id)
      .eq("following_id", following_id);

    if (checkError) throw checkError;

    if (count && count > 0) {
      return c.json({ error: "Already following this user" }, 400);
    }

    const { data, error } = await supabase
      .from("follows")
      .insert({
        follower_id,
        following_id,
      })
      .select()
      .single();

    if (error) throw error;

    return c.json(data, 201);
  } catch (err) {
    console.error("Error following user:", err);
    return c.json({ error: "Failed to follow user" }, 500);
  }
});

followsRoutes.delete("/:follower_id/:following_id", async (c) => {
  try {
    const followerId = c.req.param("follower_id");
    const followingId = c.req.param("following_id");

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (error) throw error;

    return c.json({ success: true });
  } catch (err) {
    console.error("Error unfollowing user:", err);
    return c.json({ error: "Failed to unfollow user" }, 500);
  }
});
