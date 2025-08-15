import { UserProfile } from "@/context/ProfileContext";
import { Profile } from "@/Interface";
import { useState } from "react";
import { UserAuth } from "@/context/AuthContext";

type Props = {
  profile: Profile | null;
};

const DisplayNameForm = ({ profile }: Props) => {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [loading, setLoading] = useState(false);
  const { updateDisplayName } = UserProfile();
  const { refreshProfile } = UserAuth();

  const handleDisplayNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!profile) return;

    if (displayName !== profile.display_name) {
      const { success, error } = await updateDisplayName(displayName);
      if (!success) {
        console.error("Display name update failed: ", error);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    refreshProfile();
  };

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
        defaultValue={displayName ? displayName : ""}
        onChange={(e) => {
          setDisplayName(e.target.value);
        }}
        className="text-sm border border-primary rounded-lg min-h-fit py-4 p-2 bg-base-100 focus:outline outline-primary outline-offset-2 transition-all w-full"
        maxLength={25}
      />
      <button
        onClick={(e) => {
          handleDisplayNameChange(e);
        }}
        className={`btn btn-sm ${loading ? "btn-ghost" : "btn-primary"} ${displayName !== profile?.display_name ? "block" : "hidden"}`}
        disabled={loading}
      >
        {loading ? "Updating..." : "Update"}
      </button>
    </form>
  );
};

export default DisplayNameForm;
