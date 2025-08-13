import React, { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { UserAuth } from "@/context/AuthContext";
import { Profile } from "@/Interface";
import { supabase } from "@/services/supabase";

interface ProfileContextValue {
  viewedProfile: Profile | null;
  setViewedProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  notFound: boolean;
  loading: boolean;
  isOwnProfile: boolean;
  username: string;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(
  undefined
);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { username } = useParams({ from: "/u/$username" });
  const { profile, getFollowStats } = UserAuth();
  const [viewedProfile, setViewedProfile] = useState<Profile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      setNotFound(false);
      setLoading(true);

      if (!username) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", username)
        .single();

      if (error || !data) {
        setNotFound(true);
        setViewedProfile(null);
        setLoading(false);
        return;
      }

      const followStats = await getFollowStats(data.id);
      setViewedProfile({ ...data, ...followStats });
      setLoading(false);
    };

    fetchProfileData();
  }, [getFollowStats, profile, username]);

  const isOwnProfile = profile?.id === viewedProfile?.id;

  const value: ProfileContextValue = {
    viewedProfile,
    setViewedProfile,
    notFound,
    loading,
    isOwnProfile,
    username: username || "",
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function UseProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
}
