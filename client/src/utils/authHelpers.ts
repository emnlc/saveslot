import { supabase } from "@/services/supabase";
import type { Profile } from "@/Interface";

import type { NavigateFn } from "@tanstack/react-router";

// Follow a user
export const followUser = async (
  currentUserId: string,
  targetUserId: string
) => {
  const { data, error } = await supabase
    .from("follows")
    .insert([{ follower_id: currentUserId, following_id: targetUserId }]);

  if (error) throw new Error(error.message);
  return data;
};

// Unfollow a user
export const unfollowUser = async (
  currentUserId: string,
  targetUserId: string
) => {
  const { error } = await supabase
    .from("follows")
    .delete()
    .match({ follower_id: currentUserId, following_id: targetUserId });

  if (error) throw new Error(error.message);
};

export const getFollowerCount = async (profile: Profile) => {
  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id);

  return followerCount;
};

export const getFollowingCount = async (profile: Profile) => {
  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id);

  return followingCount;
};

export const handleSignOut = async (navigate: NavigateFn) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return;
  }
  navigate({ to: "/" });
};

export const fetchProfile = async (
  username: string,
  setError: (error: string | null) => void,
  setProfile: (profile: Profile | null) => void
) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    setError("User not found");
  } else {
    setProfile(data);
  }
};

export const handleAvatarChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  profile: Profile,
  setError: (error: string | null) => void,
  fetchProfile: () => Promise<void>
) => {
  if (!profile) return;

  const file = e.target.files?.[0];
  if (!file || !profile.id) return;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user || user.id !== profile.id) {
    setError("Authentication error or unauthorized.");
    return;
  }

  const { data: existingFiles, error: listError } = await supabase.storage
    .from("avatars")
    .list(profile.id);
  if (listError) {
    console.log("List files error:", listError);
  } else if (existingFiles?.length) {
    const pathsToRemove = existingFiles.map((f) => `${profile.id}/${f.name}`);
    const { error: removeError } = await supabase.storage
      .from("avatars")
      .remove(pathsToRemove);
    if (removeError) console.log("Remove error:", removeError);
  }

  const filePath = `${profile.id}/avatar.png`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    setError(`Upload failed: ${uploadError.message}`);
    return;
  }
  // console.log("Upload successful:", uploadData);

  const { data: publicData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);
  if (!publicData?.publicUrl) {
    setError("Failed to get public URL.");
    return;
  }
  const cacheBustedUrl = `${publicData.publicUrl}?t=${Date.now()}`;

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: cacheBustedUrl })
    .eq("id", profile.id);

  if (updateError) {
    setError(`Profile update failed: ${updateError.message}`);
    return;
  }

  await fetchProfile();

  const { error: signedUrlError } = await supabase.storage
    .from("avatars")
    .createSignedUrl(filePath, 60);
  if (signedUrlError) {
    console.log("Signed URL error:", signedUrlError);
  }
};
