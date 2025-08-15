import { UserProfile } from "@/context/ProfileContext";
import { Profile } from "@/Interface";
import { useRef, useState, useEffect } from "react";
import { UserAuth } from "@/context/AuthContext";

import { CloudUpload } from "lucide-react";

type Props = {
  profile: Profile | null;
};

const BannerForm = ({ profile }: Props) => {
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(
    null
  );
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(
    profile?.banner_url || null
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const { updateImage } = UserProfile();
  const { refreshProfile } = UserAuth();

  useEffect(() => {
    if (profile?.banner_url && !selectedBannerFile) {
      setBannerPreviewUrl(profile.banner_url);
    }
  }, [profile?.banner_url, selectedBannerFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDrageLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleBannerSelect(files[0]);
    }
  };

  const handleBannerSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedBannerFile(file);
      setBannerPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleBannerSave = async (e: React.FormEvent) => {
    e.preventDefault();
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

      setSelectedBannerFile(null);

      if (bannerPreviewUrl && bannerPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(bannerPreviewUrl);
      }
    }

    await refreshProfile();
    setLoading(false);
  };

  const hasUnsavedChanges = selectedBannerFile !== null;

  return (
    <form className="flex flex-col gap-2">
      <div className="flex flex-col">
        <label className="text-sm">Banner</label>
        <span className="text-xs text-base-content/60">
          Allowed Formats: JPEG, PNG. Max size: 6mb. Optimal aspect ratio: 3:1
        </span>
      </div>
      <div className="flex gap-4">
        <div
          className={`min-w-48 h-48 rounded border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? "border-primary bg-primary/10 "
              : "border-base-content/30 hover:border-primary hover:bg-base-100/20 "
          }`}
          onClick={() => bannerInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDrageLeave}
          onDrop={handleBannerDrop}
        >
          <div className="text-center">
            <CloudUpload className="mx-auto text-base-content/70" />
            <p className="text-sm text-base-content/70 text-center px-2">
              Drag & drop or click to upload banner
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <img
            src={
              bannerPreviewUrl ||
              `https://ui-avatars.com/api/?name=${profile?.username}&background=FE9FA1&color=fff`
            }
            className="aspect-[3/1] rounded object-cover border-2 border-primary"
            alt="Current avatar"
          />
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={bannerInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleBannerSelect(file);
          }
        }}
        className="hidden"
      />
      <button
        onClick={(e) => {
          handleBannerSave(e);
        }}
        className={`self-start btn btn-sm ${loading ? "btn-ghost" : "btn-primary"} ${hasUnsavedChanges ? "block" : "hidden"}`}
        disabled={loading}
      >
        {loading ? "Updating..." : "Update"}
      </button>
    </form>
  );
};

export default BannerForm;
