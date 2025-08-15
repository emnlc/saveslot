import { UserProfile } from "@/context/ProfileContext";
import { Profile } from "@/Interface";
import { useState } from "react";
import { UserAuth } from "@/context/AuthContext";

type Props = {
  profile: Profile | null;
};

const BioForm = ({ profile }: Props) => {
  const [bio, setBio] = useState(profile?.bio || "");
  const [loading, setLoading] = useState(false);
  const { updateBio } = UserProfile();
  const { refreshProfile } = UserAuth();

  const handleBioChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!profile) return;

    if (bio !== profile.bio) {
      const { success, error } = await updateBio(bio);
      if (!success) {
        console.error("Bio update failed: ", error);
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
        <label htmlFor="editBio" className="text-sm">
          Bio
        </label>
        <span className="text-xs self-end">{bio?.length || 0} / 160</span>
      </div>
      <textarea
        name="editBio"
        id="editBio"
        placeholder="Tell us about yourself..."
        defaultValue={bio ? bio : ""}
        onChange={(e) => {
          setBio(e.target.value);
        }}
        className="text-sm border border-primary rounded-lg min-h-fit py-4 p-2 bg-base-100 focus:outline outline-primary outline-offset-2 transition-all w-full resize-y field-sizing-content"
        rows={3}
        maxLength={160}
      />
      <button
        onClick={(e) => {
          handleBioChange(e);
        }}
        className={`btn btn-sm ${loading ? "btn-ghost" : "btn-primary"} ${bio !== profile?.bio ? "block" : "hidden"}`}
        disabled={loading}
      >
        {loading ? "Updating..." : "Update"}
      </button>
    </form>
  );
};

export default BioForm;
