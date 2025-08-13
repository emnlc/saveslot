import { motion } from "framer-motion";
import { Profile } from "@/Interface";
import { useRef, useState } from "react";
import { UserProfile } from "@/context/ProfileContext";
import { UserAuth } from "@/context/AuthContext";

// TODO: remove this and move profile customization into settings
type Props = {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
};

const EditModal = (props: Props) => {
  const { updateImage, updateDisplayName, updateBio } = UserProfile();
  const { refreshProfile } = UserAuth();
  const [displayName, setDisplayName] = useState(props.profile.display_name);
  const [bio, setBio] = useState(props.profile.bio);
  const [loading, setLoading] = useState(false);

  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(
    null
  );
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
    props.profile.avatar_url || null
  );
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(
    props.profile.banner_url || null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!props.isOpen) return null;

  const handleSave = async () => {
    setLoading(true);

    if (selectedBannerFile) {
      const { success, error } = await updateImage(
        selectedBannerFile,
        "banner"
      );

      if (!success) {
        console.error("Banner update failed: ", error);
        setLoading(false);
        return;
      }
    }

    if (selectedAvatarFile) {
      const { success, error } = await updateImage(
        selectedAvatarFile,
        "avatar"
      );
      if (!success) {
        console.error("Avatar update failed: ", error);
        setLoading(false);
        return;
      }
    }

    if (bio !== props.profile.bio) {
      const { success, error } = await updateBio(bio);
      if (!success) {
        console.error("Bio update failed: ", error);
        setLoading(false);
        return;
      }
    }

    if (displayName !== props.profile.display_name) {
      const { success, error } = await updateDisplayName(displayName);
      if (!success) {
        console.error("Display name update failed: ", error);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    refreshProfile();
    props.onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        props.onClose();
      }}
    >
      <motion.div
        className="rounded-xl max-w-2xl w-full flex flex-col relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex mx-2 md:mx-0 flex-col justify-between gap-4 min-h-[28rem]  md:min-h-[32rem]  bg-base-200 p-6 rounded-xl">
          <div id="edit-inputs" className="flex flex-col gap-4">
            <div className="flex flex-col items-center">
              <div
                className="aspect-[3/1] w-full border-2 border-primary cursor-pointer bg-no-repeat bg-center"
                style={
                  bannerPreviewUrl
                    ? {
                        backgroundImage: `url(${bannerPreviewUrl})`,
                        backgroundSize: "cover",
                      }
                    : {
                        backgroundColor: "#333333",
                      }
                }
                onClick={() => bannerInputRef.current?.click()}
              />

              <input
                type="file"
                accept="image/*"
                ref={bannerInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedBannerFile(file);
                    setBannerPreviewUrl(URL.createObjectURL(file));
                  }
                }}
                className="hidden"
              />
              <span className="text-sm text-muted-foreground mt-1">
                Optimal size:{" "}
                <span className="text-accent">1500x500 (3:1)</span> |{" "}
                <a
                  href="https://redketchup.io/image-resizer"
                  target="_blank"
                  className="hover:text-primary transition-all"
                >
                  RedKetchup Resize Tool
                </a>
              </span>
            </div>

            <div className="flex flex-col items-center self-start">
              <img
                src={
                  avatarPreviewUrl ||
                  `https://ui-avatars.com/api/?name=${props.profile.username}&background=FE9FA1&color=fff`
                }
                className="w-20 h-20 rounded-full object-cover border-2 border-primary cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedAvatarFile(file);
                    setAvatarPreviewUrl(URL.createObjectURL(file));
                  }
                }}
                className="hidden"
              />
              <span className="text-sm text-muted-foreground mt-1">
                Click to change avatar
              </span>
            </div>

            <div className="flex flex-col gap-2 items-start">
              <div className="flex flex-row justify-between w-full items-center">
                <label htmlFor="editDisplayName">Display Name</label>
                <span className="text-xs self-end">
                  {displayName?.length} / 25
                </span>
              </div>
              <input
                type="textarea"
                id="editDisplayName"
                onChange={(e) => {
                  setDisplayName(e.target.value);
                }}
                defaultValue={displayName ? displayName : ""}
                className="border border-primary rounded-lg p-2 bg-base-100 focus:outline outline-primary outline-offset-2 transition-all w-full"
                maxLength={25}
              />
            </div>

            <div className="flex flex-col gap-2 items-start">
              <div className="flex flex-row justify-between w-full items-center">
                <label htmlFor="editBio">Bio</label>
                <span className="text-xs self-end">{bio?.length} / 160</span>
              </div>
              <textarea
                name="editBio"
                id="editBio"
                defaultValue={bio ? bio : ""}
                onChange={(e) => {
                  setBio(e.target.value);
                }}
                className="border border-primary rounded-lg p-2 bg-base-100 focus:outline outline-primary outline-offset-2 transition-all w-full resize-none"
                rows={5}
                maxLength={160}
              />
            </div>
          </div>

          <div id="edit-btns" className="flex flex-row gap-4 justify-end">
            <button
              className="btn bg-black hover:bg-black/65 transition-all text-white"
              onClick={() => {
                setAvatarPreviewUrl(props.profile.avatar_url);
                setBannerPreviewUrl(props.profile.banner_url);
                setDisplayName(props.profile.display_name);
                setBio(props.profile.bio);
                props.onClose();
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditModal;
