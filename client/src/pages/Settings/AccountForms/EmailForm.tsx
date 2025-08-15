import React, { useState } from "react";
import { supabase } from "@/services/supabase";
import type { Session } from "@supabase/supabase-js";

import Toast from "@/components/Toast";

type Props = {
  session: Session | null;
};

const EmailForm = ({ session }: Props) => {
  const [newEmail, setNewEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || newEmail === session?.user.email) {
      setEmailMessage("Please enter a new email address");
      return;
    }

    setIsUpdatingEmail(true);
    setEmailMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) {
        setEmailMessage(`Error: ${error.message}`);
      } else {
        setEmailMessage(
          "Check your email for confirmation link to complete the change"
        );
        setNewEmail("");
      }
    } catch (error) {
      console.error(error);
      setEmailMessage("An unexpected error occurred");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const hasNewEmail =
    newEmail.trim() !== "" && newEmail !== session?.user.email;

  return (
    <>
      <div className="flex flex-col gap-2 items-start">
        <div className="flex flex-row justify-between w-full items-center">
          <label className="text-sm">Current Email</label>
        </div>
        <input
          value={session ? session.user.email : ""}
          className="text-sm border border-primary rounded-lg min-h-fit py-4 p-2 bg-base-100 w-full cursor-not-allowed opacity-50"
          disabled
          readOnly
        />
      </div>

      <form
        onSubmit={handleEmailChange}
        className="flex flex-col gap-2 items-start"
      >
        <div className="flex flex-row justify-between w-full items-center">
          <label htmlFor="newEmail" className="text-sm">
            Change Email
          </label>
        </div>
        <input
          name="newEmail"
          id="newEmail"
          type="email"
          placeholder="Enter new email address..."
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="text-sm border border-primary rounded-lg min-h-fit py-4 p-2 bg-base-100 focus:outline outline-primary outline-offset-2 transition-all w-full"
          disabled={isUpdatingEmail}
          required
        />

        {emailMessage && (
          <Toast
            message={emailMessage}
            setMessage={setEmailMessage}
            isToastVisible={isToastVisible}
            setIsToastVisible={setIsToastVisible}
          />
        )}

        {hasNewEmail && (
          <button
            type="submit"
            disabled={isUpdatingEmail}
            className="btn btn-primary btn-sm"
          >
            {isUpdatingEmail ? "Updating..." : "Update Email"}
          </button>
        )}
      </form>
    </>
  );
};

export default EmailForm;
