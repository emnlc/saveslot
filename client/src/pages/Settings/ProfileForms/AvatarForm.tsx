import { useUpdateProfile } from "@/hooks/profiles";
import { UserAuth, type AuthProfile } from "@/context/AuthContext";
import { useRef, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CloudUpload } from "lucide-react";
import { supabase } from "@/services/supabase";

type Props = {
  profile: AuthProfile;
};

const AvatarForm = ({ profile }: Props) => {
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
    profile.avatar_url || null
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { refreshProfile } = UserAuth();
  const queryClient = useQueryClient();
  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    if (profile.avatar_url && !selectedAvatarFile) {
      setAvatarPreviewUrl(profile.avatar_url);
    }
  }, [profile.avatar_url, selectedAvatarFile]);

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
    if (!selectedAvatarFile) return;

    setIsUploading(true);

    try {
      // Upload to Supabase Storage in user-images bucket
      const filePath = `${profile.id}/avatar.png`;

      // Delete old avatar if it exists
      const { error: deleteError } = await supabase.storage
        .from("user-images")
        .remove([filePath]);

      if (deleteError) {
        console.warn(
          "No existing avatar to delete or error deleting:",
          deleteError
        );
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("user-images")
        .upload(filePath, selectedAvatarFile, {
          cacheControl: "3600",
          upsert: true, // This will overwrite if file exists
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("user-images")
        .getPublicUrl(filePath);

      // Add timestamp to bust cache
      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      await updateProfileMutation.mutateAsync({
        userId: profile.id,
        avatar_url: avatarUrl,
      });

      // Clean up
      setSelectedAvatarFile(null);
      if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }

      // Refresh auth profile
      await refreshProfile();

      // Invalidate profile queries
      queryClient.invalidateQueries({
        queryKey: ["profile", profile.username],
      });
    } catch (error) {
      console.error("Avatar update failed:", error);
      alert("Failed to update avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
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
              ? "border-primary bg-primary/10"
              : "border-base-content/30 hover:border-primary hover:bg-base-100/20"
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
              `https://ui-avatars.com/api/?name=${profile.username}&background=FE9FA1&color=fff`
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
        onClick={handleAvatarSave}
        className={`self-start btn btn-sm ${isUploading ? "btn-ghost" : "btn-primary"} ${hasUnsavedChanges ? "block" : "hidden"}`}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Update"}
      </button>
    </form>
  );
};

export default AvatarForm;
