import { useUpdateProfile } from "@/hooks/profiles";
import { UserAuth, type AuthProfile } from "@/context/AuthContext";
import { useRef, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CloudUpload } from "lucide-react";
import { supabase } from "@/services/supabase";

type Props = {
  profile: AuthProfile;
};

const BannerForm = ({ profile }: Props) => {
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(
    null
  );
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(
    profile.banner_url || null
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { refreshProfile } = UserAuth();
  const queryClient = useQueryClient();
  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    if (profile.banner_url && !selectedBannerFile) {
      setBannerPreviewUrl(profile.banner_url);
    }
  }, [profile.banner_url, selectedBannerFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
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
    if (!selectedBannerFile) return;

    setIsUploading(true);

    try {
      // Upload to user-images bucket
      const filePath = `${profile.id}/banner.png`;

      // Delete old banner if it exists
      const { error: deleteError } = await supabase.storage
        .from("user-images")
        .remove([filePath]);

      if (deleteError) {
        console.warn(
          "No existing banner to delete or error deleting:",
          deleteError
        );
      }

      // Upload new banner
      const { error: uploadError } = await supabase.storage
        .from("user-images")
        .upload(filePath, selectedBannerFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("user-images")
        .getPublicUrl(filePath);

      const bannerUrl = `${data.publicUrl}?t=${Date.now()}`;

      // Update profile with new banner
      await updateProfileMutation.mutateAsync({
        userId: profile.id,
        banner_url: bannerUrl,
      });

      setSelectedBannerFile(null);
      if (bannerPreviewUrl && bannerPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(bannerPreviewUrl);
      }

      // Refresh auth profile
      await refreshProfile();

      // Invalidate profile queries
      queryClient.invalidateQueries({
        queryKey: ["profile", profile.username],
      });
    } catch (error) {
      console.error("Banner update failed:", error);
      alert("Failed to update banner. Please try again.");
    } finally {
      setIsUploading(false);
    }
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
      <div className="flex flex-col md:flex-row gap-4">
        <div
          className={`w-32 h-32 md:min-w-48 md:h-48 rounded border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? "border-primary bg-primary/10"
              : "border-base-content/30 hover:border-primary hover:bg-base-100/20"
          }`}
          onClick={() => bannerInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleBannerDrop}
        >
          <div className="text-center">
            <CloudUpload className="mx-auto text-base-content/70" />
            <p className="text-xs md:text-sm text-base-content/70 text-center px-2">
              Drag & drop or click to upload banner
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <img
            src={
              bannerPreviewUrl ||
              `https://ui-avatars.com/api/?name=${profile.username}&background=FE9FA1&color=fff`
            }
            className="aspect-[3/1] rounded object-cover border-2 border-primary"
            alt="Current banner"
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
        onClick={handleBannerSave}
        className={`self-start btn btn-sm ${isUploading ? "btn-ghost" : "btn-primary"} ${hasUnsavedChanges ? "block" : "hidden"}`}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Update"}
      </button>
    </form>
  );
};

export default BannerForm;
