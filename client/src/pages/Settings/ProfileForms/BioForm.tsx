import { useUpdateProfile } from "@/hooks/profiles";
import { UserAuth, type AuthProfile } from "@/context/AuthContext";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  profile: AuthProfile;
};

const BioForm = ({ profile }: Props) => {
  const [bio, setBio] = useState(profile.bio || "");
  const { refreshProfile } = UserAuth();
  const queryClient = useQueryClient();
  const updateProfileMutation = useUpdateProfile();

  const handleBioChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile || bio === profile.bio) return;

    try {
      await updateProfileMutation.mutateAsync({
        userId: profile.id,
        bio: bio || null,
      });

      // Refresh auth profile
      await refreshProfile();

      // Invalidate profile queries
      queryClient.invalidateQueries({
        queryKey: ["profile", profile.username],
      });
    } catch (error) {
      console.error("Bio update failed:", error);
    }
  };

  const hasChanges = bio !== profile.bio;
  const isLoading = updateProfileMutation.isPending;

  return (
    <form className="flex flex-col gap-2 items-start">
      <div className="flex flex-row justify-between w-full items-center">
        <label htmlFor="editBio" className="text-sm">
          Bio
        </label>
        <span className="text-xs self-end">{bio?.length || 0} / 160</span>
      </div>
      <textarea
        name="editBio"
        id="editBio"
        placeholder="Tell us about yourself..."
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="text-sm border border-primary rounded-lg min-h-fit py-4 p-2 bg-base-100 focus:outline outline-primary outline-offset-2 transition-all w-full resize-y field-sizing-content"
        rows={3}
        maxLength={160}
      />
      <button
        onClick={handleBioChange}
        className={`btn btn-sm ${isLoading ? "btn-ghost" : "btn-primary"} ${hasChanges ? "block" : "hidden"}`}
        disabled={isLoading}
      >
        {isLoading ? "Updating..." : "Update"}
      </button>
    </form>
  );
};

export default BioForm;
