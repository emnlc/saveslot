import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";
// Define your Profile type
import type { Profile } from "@/Interface";

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  getFollowStats: (
    userId: string
  ) => Promise<{ followers: number; following: number }>;
  refreshProfile: () => Promise<void>;
  signUpNewUser: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInUser: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; username?: string; error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const validateUsername = (
    username: string
  ): { isValid: boolean; error?: string } => {
    // Convert to lowercase for case-insensitive validation
    const lowerUsername = username.toLowerCase();

    // Check length
    if (username.length < 4) {
      return {
        isValid: false,
        error: "Username must be at least 4 characters long.",
      };
    }
    if (username.length > 20) {
      return {
        isValid: false,
        error: "Username must be 20 characters or less.",
      };
    }

    // Check allowed characters (letters, numbers, underscore only)
    const validPattern = /^[a-zA-Z0-9_]+$/;
    if (!validPattern.test(username)) {
      return {
        isValid: false,
        error: "Username can only contain letters, numbers, and underscores.",
      };
    }

    // Optional: Check for reserved usernames
    const reservedNames = [
      "admin",
      "api",
      "www",
      "support",
      "help",
      "about",
      "contact",
      "login",
      "signup",
      "profile",
    ];
    if (reservedNames.includes(lowerUsername)) {
      return {
        isValid: false,
        error: "This username is reserved and cannot be used.",
      };
    }

    return { isValid: true };
  };

  const getFollowStats = async (userId: string) => {
    const { count: followersCount, error: followersError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    const { count: followingCount, error: followingError } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (followersError || followingError) {
      console.error(
        "Error fetching follow stats",
        followersError || followingError
      );
      return { followers: 0, following: 0 };
    }

    const stats = {
      followers: followersCount ?? 0,
      following: followingCount ?? 0,
    };

    return stats;
  };

  // Refresh profile data function
  const refreshProfile = async () => {
    if (!session?.user?.id) {
      console.warn("No session available to refresh profile");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error refreshing profile:", error);
        return;
      }

      // Get follow stats and merge with profile data
      const followStats = await getFollowStats(session.user.id);
      setProfile({ ...data, ...followStats });
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  // Fetch profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      // Get follow stats and merge with profile data
      const followStats = await getFollowStats(userId);
      const profileWithStats = { ...data, ...followStats };

      setProfile(profileWithStats);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        if (session?.user?.id) {
          fetchProfile(session.user.id);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error getting initial session:", error);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sign in
  const signInUser = async (email: string, password: string) => {
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

    // Quick fetch of just the username for navigation purposes
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single();

    if (profileError || !profileData?.username) {
      return { success: false, error: "Could not find user profile." };
    }

    return { success: true, username: profileData.username };
  };

  // Sign up
  const signUpNewUser = async (
    email: string,
    password: string,
    username: string
  ) => {
    const validation = validateUsername(username);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Check if username exists
    const { data: existingUsernames, error: usernameError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", username);

    if (usernameError) {
      return { success: false, error: "Error checking username." };
    }

    if (existingUsernames && existingUsernames.length > 0) {
      return { success: false, error: "Username is already taken." };
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

  // Sign out
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        getFollowStats,
        refreshProfile,
        signUpNewUser,
        signInUser,
        signOut,
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
