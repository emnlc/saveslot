import { UserProfile } from "@/context/ProfileContext";
import { Profile } from "@/Interface";
import { useRef, useState, useEffect } from "react";
import { UserAuth } from "@/context/AuthContext";
import { CloudUpload } from "lucide-react";

type Props = {
  profile: Profile | null;
};

const AvatarForm = ({ profile }: Props) => {
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
    profile?.avatar_url || null
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const { updateImage } = UserProfile();
  const { refreshProfile } = UserAuth();

  useEffect(() => {
    if (profile?.avatar_url && !selectedAvatarFile) {
      setAvatarPreviewUrl(profile.avatar_url);
    }
  }, [profile?.avatar_url, selectedAvatarFile]);

  const handleAvatarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleAvatarDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleAvatarSelect(files[0]);
    }
  };

  const handleAvatarSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedAvatarFile(file);
      setAvatarPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAvatarSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      setSelectedAvatarFile(null);

      if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    }

    await refreshProfile();
    setLoading(false);
  };

  const hasUnsavedChanges = selectedAvatarFile !== null;

  return (
    <form className="flex flex-col gap-2">
      <div className="flex flex-col">
        <label className="text-sm">Avatar</label>
        <span className="text-xs text-base-content/60">
          Allowed Formats: JPEG, PNG. Max size: 3mb. Optimal aspect ratio: 1:1
        </span>
      </div>
      <div className="flex gap-4">
        <div
          className={`w-30 h-30 md:w-48 md:h-48 rounded border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? "border-primary bg-primary/10 "
              : "border-base-content/30 hover:border-primary hover:bg-base-100/20 "
          }`}
          onClick={() => avatarInputRef.current?.click()}
          onDragOver={handleAvatarDragOver}
          onDragLeave={handleAvatarDragLeave}
          onDrop={handleAvatarDrop}
        >
          <div className="text-center">
            <CloudUpload className="mx-auto text-base-content/70" />
            <p className="text-xs md:text-sm text-base-content/70 text-center px-2">
              Drag & drop or click to upload avatar
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <img
            src={
              avatarPreviewUrl ||
              `https://ui-avatars.com/api/?name=${profile?.username}&background=FE9FA1&color=fff`
            }
            className="w-32 h-32 md:w-48 md:h-48 rounded object-cover border-2 border-primary"
            alt="Current avatar"
          />
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={avatarInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleAvatarSelect(file);
          }
        }}
        className="hidden"
      />
      <button
        onClick={(e) => {
          handleAvatarSave(e);
        }}
        className={`self-start btn btn-sm ${loading ? "btn-ghost" : "btn-primary"} ${hasUnsavedChanges ? "block" : "hidden"}`}
        disabled={loading}
      >
        {loading ? "Updating..." : "Update"}
      </button>
    </form>
  );
};

export default AvatarForm;
