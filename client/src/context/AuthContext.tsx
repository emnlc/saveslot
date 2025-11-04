import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";

export interface AuthProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
}

interface AuthContextType {
  session: Session | null;
  profile: AuthProfile | null;
  loading: boolean;
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
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const validateUsername = (
    username: string
  ): { isValid: boolean; error?: string } => {
    const lowerUsername = username.toLowerCase();

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

    const validPattern = /^[a-zA-Z0-9_]+$/;
    if (!validPattern.test(username)) {
      return {
        isValid: false,
        error: "Username can only contain letters, numbers, and underscores.",
      };
    }

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

  const refreshProfile = async () => {
    if (!session?.user?.id) {
      console.warn("No session available to refresh profile");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, banner_url, bio")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error refreshing profile:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, banner_url, bio")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
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
  }, []);

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

  const signUpNewUser = async (
    email: string,
    password: string,
    username: string
  ) => {
    const validation = validateUsername(username);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return { success: false, error: signUpError.message };
    }

    const userId = data.user?.id;

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
        {
          user_id: userId,
          name: "Favorites",
          is_public: true,
          ranked: false,
          slug: "favorites",
        },
        {
          user_id: userId,
          name: "Backlog",
          is_public: true,
          ranked: false,
          slug: "backlog",
        },
        {
          user_id: userId,
          name: "Wishlist",
          is_public: true,
          ranked: false,
          slug: "wishlist",
        },
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
