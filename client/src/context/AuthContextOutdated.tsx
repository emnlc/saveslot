import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/services/supabase";
import { Session } from "@supabase/supabase-js";
import type { Profile } from "@/Interface";

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  userSignUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ success: boolean; error?: string }>;
  userSignIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; username?: string; error?: string }>;
  userSignOut: () => Promise<{ success: boolean; error?: string }>;
  updateAvatar: (file: File) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: {
    username?: string;
    display_name?: string | null;
    bio?: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get session on mount
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const activeSession = data.session;
      setSession(activeSession);
      if (activeSession?.user) {
        await fetchProfile(activeSession.user.id);
      }
      setIsLoading(false);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const userSignUp = async (
    email: string,
    password: string,
    username: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Check if username exists
    const { data: existingUsername, error: usernameError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUsername) {
      return { success: false, error: "Username is already taken." };
    }

    if (usernameError && usernameError.code !== "PGRST116") {
      return { success: false, error: "Error checking username." };
    }

    // Sign up with Supabase
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return { success: false, error: signUpError.message };
    }

    const userId = data.user?.id;

    // Check session (required for RLS)
    const { data: sessionResult } = await supabase.auth.getSession();
    if (!sessionResult.session) {
      return {
        success: false,
        error: "No active session — profile insert blocked by RLS.",
      };
    }

    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        username,
        display_name: username,
      });

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      const { error: listError } = await supabase.from("game_lists").insert([
        { user_id: userId, name: "Favorites", is_public: true },
        { user_id: userId, name: "Backlog", is_public: true },
        { user_id: userId, name: "Wishlist", is_public: true },
      ]);

      if (listError) {
        return {
          success: false,
          error: "Failed to create default lists: " + listError.message,
        };
      }
    }

    return { success: true };
  };

  const userSignIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; username?: string; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const userId = data.user?.id;
    if (!userId) {
      return {
        success: false,
        error: "Login succeeded but user ID not found.",
      };
    }

    // Fetch username
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.username) {
      return { success: false, error: "Could not find user profile." };
    }

    return { success: true, username: profile.username };
  };

  const userSignOut = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };

    setSession(null);
    return { success: true };
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Failed to fetch profile:", error.message);
      setProfile(null);
    } else {
      setProfile(data);
    }
  };

  const updateAvatar = async (
    file: File
  ): Promise<{ success: boolean; error?: string }> => {
    if (!profile || !session?.user.id) {
      return { success: false, error: "No authenticated user." };
    }

    const filePath = `${session.user.id}/avatar.png`;

    // Delete existing files in user's avatar folder
    const { data: existingFiles } = await supabase.storage
      .from("avatars")
      .list(session.user.id);
    if (existingFiles?.length) {
      const paths = existingFiles.map((f) => `${session.user.id}/${f.name}`);
      await supabase.storage.from("avatars").remove(paths);
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = `${publicData.publicUrl}?t=${Date.now()}`;

    // Update profile record
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", session.user.id);

    if (dbError) {
      return { success: false, error: dbError.message };
    }

    // Update local state
    setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : prev));

    return { success: true };
  };

  const updateProfile = async (updates: {
    username?: string;
    display_name?: string | null;
    bio?: string | null;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!profile || !session?.user.id) {
      return { success: false, error: "No authenticated user." };
    }

    // If updating username, check for uniqueness
    if (updates.username && updates.username !== profile.username) {
      const { data: existing, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", updates.username)
        .neq("id", session.user.id)
        .single();

      if (existing) {
        return { success: false, error: "Username is already taken." };
      }

      if (error && error.code !== "PGRST116") {
        return { success: false, error: "Failed to check username." };
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", session.user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Update local profile state
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        updateAvatar,
        updateProfile,
        userSignUp,
        userSignIn,
        userSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
};
