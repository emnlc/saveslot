import { UserAuth } from "@/context/AuthContext";

import EmailForm from "./AccountForms/EmailForm";
import PasswordForm from "./AccountForms/PasswordForm";

const Account = () => {
  const { profile, session } = UserAuth();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 items-start">
        <div className="flex flex-row justify-between w-full items-center">
          <label htmlFor="editUsername" className="text-sm">
            Username
          </label>
        </div>
        <input
          name="editUsername"
          id="editUsername"
          placeholder="Enter your display name..."
          defaultValue={profile ? profile.username : ""}
          className="text-sm border border-primary rounded-lg min-h-fit py-4 p-2 bg-base-100 focus:outline outline-primary outline-offset-2 transition-all w-full cursor-not-allowed opacity-50"
          disabled
          maxLength={25}
        />
      </div>

      <EmailForm session={session} />

      <PasswordForm />
    </div>
  );
};

export default Account;
