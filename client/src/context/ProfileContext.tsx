import { createContext, ReactNode, useContext, useState } from "react";
import { supabase } from "@/services/supabase";
import { UserAuth } from "./AuthContext";

interface ProfileContextType {
  uploading: boolean;
  updateImage: (
    file: File,
    type: string
  ) => Promise<{ success: boolean; error?: string; avatarUrl?: string }>;
  updateDisplayName: (
    displayName: string | null
  ) => Promise<{ success: boolean; error?: string }>;
  updateBio: (
    bio: string | null
  ) => Promise<{ success: boolean; error?: string }>;
  followUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  unfollowUser: (
    userId: string
  ) => Promise<{ success: boolean; error?: string }>;
  checkIfFollowing: (
    userId: string
  ) => Promise<{ isFollowing: boolean; error?: string }>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [uploading, setUploading] = useState(false);
  const { session, profile, refreshProfile } = UserAuth();

  const updateImage = async (file: File, type: string) => {
    if (!session?.user?.id) {
      return { success: false, error: "No authenticated user" };
    }
    if (!profile?.id) {
      return { success: false, error: "No profile found" };
    }

    setUploading(true);
    try {
      if (!file.type.startsWith("image/")) {
        return { success: false, error: "Please select an image file" };
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return { success: false, error: "Image must be smaller than 5MB" };
      }

      const userId = session.user.id;
      const path = `${userId}/${type}.png`;

      // Upload to Supabase Storage and overwrite existing avatar
      const { error: uploadError } = await supabase.storage
        .from("user-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return { success: false, error: uploadError.message };
      }

      // Get the public URL and bust the cache with a timestamp query
      const {
        data: { publicUrl },
      } = supabase.storage.from("user-images").getPublicUrl(path);
      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

      // Update the profile with the new image URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update(
          type === "avatar"
            ? { avatar_url: cacheBustedUrl }
            : { banner_url: cacheBustedUrl }
        )
        .eq("id", profile.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        return {
          success: false,
          error:
            `Failed to update profile with new ${type}: ` + updateError.message,
        };
      }

      return { success: true, avatarUrl: cacheBustedUrl };
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setUploading(false);
    }
  };

  const updateDisplayName = async (displayName: string | null) => {
    if (!session?.user?.id) {
      return { success: false, error: "No authenticated user" };
    }
    if (!profile?.id) {
      return { success: false, error: "No profile found" };
    }

    // Validate display name
    if (!displayName) {
      return { success: false, error: "Display name cannot be empty" };
    }
    if (displayName.length > 50) {
      return {
        success: false,
        error: "Display name must be 50 characters or less",
      };
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("id", profile.id);

      if (error) {
        console.error("Error updating display name:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating display name:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const updateBio = async (bio: string | null) => {
    if (!session?.user?.id) {
      return { success: false, error: "No authenticated user" };
    }
    if (!profile?.id) {
      return { success: false, error: "No profile found" };
    }

    if (bio && bio.length > 160) {
      return { success: false, error: "Bio must be 160 characters or less" };
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ bio: bio ? bio.trim() : null })
        .eq("id", profile.id);

      if (error) {
        console.error("Error updating bio:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating bio:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const followUser = async (userId: string) => {
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to follow users" };
    }

    if (!profile?.id) {
      return { success: false, error: "No profile found" };
    }

    if (profile.id === userId) {
      return { success: false, error: "You cannot follow yourself" };
    }

    try {
      // Check if already following using count instead of select
      const { count, error: checkError } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile.id)
        .eq("following_id", userId);

      if (checkError) {
        console.error("Error checking existing follow:", checkError);
        return { success: false, error: "Failed to check follow status" };
      }

      if (count && count > 0) {
        return { success: false, error: "You are already following this user" };
      }

      // Create the follow relationship
      const { error: insertError } = await supabase.from("follows").insert({
        follower_id: profile.id,
        following_id: userId,
      });

      if (insertError) {
        console.error("Error creating follow:", insertError);
        return { success: false, error: "Failed to follow user" };
      }

      // Refresh the current user's profile to update following count
      await refreshProfile();

      return { success: true };
    } catch (error) {
      console.error("Error following user:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to unfollow users",
      };
    }

    if (!profile?.id) {
      return { success: false, error: "No profile found" };
    }

    try {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", profile.id)
        .eq("following_id", userId);

      if (error) {
        console.error("Error unfollowing user:", error);
        return { success: false, error: "Failed to unfollow user" };
      }

      // Refresh the current user's profile to update following count
      await refreshProfile();

      return { success: true };
    } catch (error) {
      console.error("Error unfollowing user:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const checkIfFollowing = async (userId: string) => {
    if (!session?.user?.id || !profile?.id) {
      return { isFollowing: false, error: "Not authenticated" };
    }

    if (profile.id === userId) {
      return { isFollowing: false }; // Can't follow yourself
    }

    try {
      const { count, error } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile.id)
        .eq("following_id", userId);

      if (error) {
        console.error("Error checking follow status:", error);
        return { isFollowing: false, error: "Failed to check follow status" };
      }

      return { isFollowing: (count ?? 0) > 0 };
    } catch (error) {
      console.error("Error checking follow status:", error);
      return { isFollowing: false, error: "An unexpected error occurred" };
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        uploading,
        updateImage,
        updateDisplayName,
        updateBio,
        followUser,
        unfollowUser,
        checkIfFollowing,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const UserProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx)
    throw new Error("useProfile must be used inside a ProfileContextProvider");
  return ctx;
};
