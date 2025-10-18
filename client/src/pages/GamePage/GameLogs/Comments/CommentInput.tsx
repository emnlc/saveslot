import { useState } from "react";

interface AuthProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

type Props = {
  onSubmit: (commentText: string) => Promise<void>;
  isSubmitting: boolean;
  profile: AuthProfile;
};

const CommentInput = ({ onSubmit, isSubmitting, profile }: Props) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await onSubmit(newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  return (
    <div className="flex items-start space-x-2 md:space-x-3">
      {profile && (
        <>
          {profile.avatar_url ? (
            <>
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-base-300 rounded-full flex items-center justify-center">
                <span className="text-xs text-base-content font-medium">
                  You
                </span>
              </div>
            </>
          )}
        </>
      )}
      <div className="flex-1">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          maxLength={1000}
          rows={2}
          className="textarea textarea-neutral focus:textarea-primary focus:outline-0 transition-all w-full resize-none text-xs md:text-sm"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs  text-base-content/60">
            {newComment.length}/1000 characters
          </span>
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            className="btn btn-primary btn-sm"
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentInput;
