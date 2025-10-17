import { Hono } from "hono";
import { supabase } from "../../lib/supabase";

export const profilesRoutes = new Hono();

profilesRoutes.get("/:username", async (c) => {
  try {
    const username = c.req.param("username");
    const currentUserId = c.req.query("current_user_id");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, username, display_name, bio, avatar_url, banner_url, created_at"
      )
      .ilike("username", username)
      .single();

    if (profileError || !profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    const { count: followersCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profile.id);

    const { count: followingCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profile.id);

    let isFollowing = false;
    if (currentUserId && currentUserId !== profile.id) {
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", currentUserId)
        .eq("following_id", profile.id);

      if (count) {
        isFollowing = count > 0;
      }
    }

    return c.json({
      ...profile,
      followers: followersCount ?? 0,
      following: followingCount ?? 0,
      is_following: isFollowing,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

profilesRoutes.put("/:user_id", async (c) => {
  try {
    const userId = c.req.param("user_id");
    const { display_name, bio, avatar_url, banner_url } = await c.req.json();

    if (display_name !== undefined) {
      if (!display_name || display_name.trim().length === 0) {
        return c.json({ error: "Display name cannot be empty" }, 400);
      }
      if (display_name.length > 50) {
        return c.json(
          { error: "Display name must be 50 characters or less" },
          400
        );
      }
    }

    if (bio !== undefined && bio !== null && bio.length > 160) {
      return c.json({ error: "Bio must be 160 characters or less" }, 400);
    }

    const updates: any = {};
    if (display_name !== undefined) updates.display_name = display_name.trim();
    if (bio !== undefined) updates.bio = bio ? bio.trim() : null;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (banner_url !== undefined) updates.banner_url = banner_url;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return c.json(data);
  } catch (err) {
    console.error("Error updating profile:", err);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

profilesRoutes.get("/:user_id/layout", async (c) => {
  try {
    const userId = c.req.param("user_id");

    const { data, error } = await supabase
      .from("profiles")
      .select("profile_layout")
      .eq("id", userId)
      .single();

    if (error) throw error;

    if (!data?.profile_layout) {
      return c.json({
        stats: true,
        favorites: true,
        currently_playing: true,
        recent_reviews: true,
        heatmap: true,
        rating_distribution: true,
        popular_lists: true,
        top_platforms: true,
        top_genres: true,
      });
    }

    return c.json(data.profile_layout);
  } catch (err) {
    console.error("Error fetching profile layout:", err);
    return c.json({ error: "Failed to fetch profile layout" }, 500);
  }
});

profilesRoutes.patch("/:user_id/layout", async (c) => {
  try {
    const userId = c.req.param("user_id");
    const layout = await c.req.json();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        profile_layout: layout,
      })
      .eq("id", userId)
      .select("profile_layout")
      .single();

    if (error) throw error;

    return c.json(data.profile_layout);
  } catch (err) {
    console.error("Error updating profile layout:", err);
    return c.json({ error: "Failed to update profile layout" }, 500);
  }
});
