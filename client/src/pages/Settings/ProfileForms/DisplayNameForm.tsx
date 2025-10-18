import { useUpdateProfile } from "@/hooks/profiles";
import { UserAuth, type AuthProfile } from "@/context/AuthContext";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  profile: AuthProfile;
};

const DisplayNameForm = ({ profile }: Props) => {
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const { refreshProfile } = UserAuth();
  const queryClient = useQueryClient();
  const updateProfileMutation = useUpdateProfile();

  const handleDisplayNameChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile || displayName === profile.display_name) return;

    try {
      await updateProfileMutation.mutateAsync({
        userId: profile.id,
        display_name: displayName,
      });

      // Refresh auth profile
      await refreshProfile();

      // Invalidate profile queries
      queryClient.invalidateQueries({
        queryKey: ["profile", profile.username],
      });
    } catch (error) {
      console.error("Display name update failed:", error);
    }
  };

  const hasChanges = displayName !== profile.display_name;
  const isLoading = updateProfileMutation.isPending;

  return (
    <form className="flex flex-col gap-2 items-start">
      <div className="flex flex-row justify-between w-full items-center">
        <label htmlFor="editDisplayName" className="text-sm">
          Display Name
        </label>
        <span className="text-xs self-end">
          {displayName?.length || 0} / 25
        </span>
      </div>
      <input
        name="editDisplayName"
        id="editDisplayName"
        placeholder="Enter your display name..."
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="text-sm border border-primary rounded-lg min-h-fit py-4 p-2 bg-base-100 focus:outline outline-primary outline-offset-2 transition-all w-full"
        maxLength={25}
      />
      <button
        onClick={handleDisplayNameChange}
        className={`btn btn-sm ${isLoading ? "btn-ghost" : "btn-primary"} ${hasChanges ? "block" : "hidden"}`}
        disabled={isLoading}
      >
        {isLoading ? "Updating..." : "Update"}
      </button>
    </form>
  );
};

export default DisplayNameForm;
