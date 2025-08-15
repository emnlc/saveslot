import { supabase } from "@/services/supabase";
import { FormEvent, useState } from "react";

import Toast from "@/components/Toast";

const PasswordForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [isToastVisible, setIsToastVisible] = useState(false);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage("Passwords do not match!");
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordMessage(`Error: ${error.message}`);
      } else {
        setPasswordMessage("Password successfully changed");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (error) {
      console.error(error);
      setPasswordMessage("An unexpected error occurred");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const hasNewPassword =
    newPassword.trim() !== "" && confirmNewPassword.trim() !== "";

  return (
    <>
      <form
        onSubmit={handlePasswordChange}
        className="flex flex-col gap-2 mt-2 items-start"
      >
        <div className="flex flex-row justify-between w-full items-center">
          <label htmlFor="editPassword" className="text-sm">
            Change Password
          </label>
        </div>
        <input
          name="editPassword"
          id="editPassword"
          placeholder="New password"
          className="text-sm border border-primary rounded-lg min-h-fit py-4 p-2 bg-base-100 focus:outline outline-primary outline-offset-2 transition-all w-full"
          type="password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
          }}
        />

        <input
          name="confirmNewPassword"
          id="confirmNewPassword"
          placeholder="Confirm new password"
          className="text-sm border border-primary rounded-lg min-h-fit mt-2 py-4 p-2 bg-base-100 focus:outline outline-primary outline-offset-2 transition-all w-full"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => {
            setConfirmNewPassword(e.target.value);
          }}
        />

        {passwordMessage && (
          <Toast
            message={passwordMessage}
            setMessage={setPasswordMessage}
            isToastVisible={isToastVisible}
            setIsToastVisible={setIsToastVisible}
          />
        )}

        {hasNewPassword && (
          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="btn btn-primary btn-sm"
          >
            {isUpdatingPassword ? "Updating..." : "Update Password"}
          </button>
        )}
      </form>
    </>
  );
};

export default PasswordForm;
