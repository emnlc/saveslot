import { UserAuth } from "@/context/AuthContext";

import DisplayNameForm from "./ProfileForms/DisplayNameForm";
import BioForm from "./ProfileForms/BioForm";
import AvatarForm from "./ProfileForms/AvatarForm";
import BannerForm from "./ProfileForms/BannerForm";
import WidgetsForm from "./ProfileForms/WidgetsForm";

const Settings = () => {
  const { profile } = UserAuth();

  return (
    <>
      {profile && (
        <>
          <div className="flex flex-col gap-4 relative">
            <DisplayNameForm profile={profile} />

            <BioForm profile={profile} />

            <AvatarForm profile={profile} />

            <BannerForm profile={profile} />

            <WidgetsForm profile={profile} />
          </div>
        </>
      )}
    </>
  );
};

export default Settings;
