import { motion } from "framer-motion";
import React, { useState } from "react";
import { supabase } from "@/services/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { UserAuth } from "@/context/AuthContext";

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile } = UserAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setLoading(true);
    setError(null);

    // Helper to create the base slug from the name
    const createSlug = (str: string) =>
      str.trim().toLowerCase().replace(/\s+/g, "-");

    const baseSlug = createSlug(name);
    let slug = baseSlug;

    // Fetch existing slugs for this user that start with the baseSlug
    const { data: existingSlugs, error: fetchError } = await supabase
      .from("game_lists")
      .select("slug")
      .eq("user_id", profile.id)
      .like("slug", `${baseSlug}%`);

    if (fetchError) {
      setLoading(false);
      setError(fetchError.message);
      return;
    }

    if (existingSlugs && existingSlugs.length > 0) {
      const slugNumbers = existingSlugs
        .map(({ slug: existingSlug }) => {
          if (existingSlug === baseSlug) return 0; // base slug without number
          const match = existingSlug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((num) => num !== null);

      if (slugNumbers.includes(0)) {
        const maxNum = Math.max(
          ...(slugNumbers.filter((n) => n !== null) as number[])
        );
        slug = `${baseSlug}-${maxNum + 1}`;
      } else {
        slug = baseSlug;
      }
    }

    const { error: insertError } = await supabase.from("game_lists").insert([
      {
        user_id: profile.id,
        name,
        slug,
        is_public: isPublic,
      },
    ]);

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    queryClient.invalidateQueries({
      queryKey: ["user-lists-fresh", profile.id],
    });
    onClose();
    setName("");
    setIsPublic(true);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        onClose();
      }}
    >
      <motion.div
        className="rounded-xl max-w-2xl w-full flex flex-col relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex mx-2 md:mx-0 flex-col gap-4 bg-base-200 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Create New List</h2>

          <form onSubmit={handleSubmit}>
            <label className="block mb-2">
              List Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border w-full p-2 rounded mt-1"
                required
              />
            </label>

            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Public list
            </label>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn bg-black hover:bg-black/65 transition-all text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateListModal;
