import { Profile } from "@/Interface";
import FollowButton from "@/components/FollowButton";
import { UserAuth } from "@/context/AuthContext";

type Props = {
  profile: Profile;
  isOwnProfile: boolean;
  setViewedProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
};

const ProfileHeader = ({ profile, isOwnProfile, setViewedProfile }: Props) => {
  const { getFollowStats } = UserAuth();
  const AVATAR_PLACEHOLDER = `https://ui-avatars.com/api/?name=${profile.username}&background=FE9FA1&color=fff`;
  return (
    <>
      {/* banner */}
      <div
        className="w-full max-w-6xl -z-10 mx-auto aspect-[3/1] bg-cover bg-center bg-no-repeat relative "
        style={
          profile.banner_url
            ? {
                backgroundImage: `url(${profile.banner_url})`,
              }
            : {
                backgroundColor: "#333333",
              }
        }
      >
        {/* base overlay */}
        <div className="absolute inset-0 [data-theme=saveslot]:bg-gradient-to-b [data-theme=saveslot]:from-base-100/10 [data-theme=saveslot]:via-base-100/20 [data-theme=saveslot]:to-base-100/30" />

        {/* bottom gradient */}
        <div className="absolute bottom-0 left-0 w-full h-6 md:h-20 bg-gradient-to-b from-transparent to-base-100" />
        {/* left gradient */}
        <div className="hidden sm:block absolute top-0 left-0 h-full sm:w-12 md:w-20 sm:bg-gradient-to-r sm:from-base-100 sm:to-transparent" />
        {/* right gradient */}
        <div className="hidden sm:block absolute top-0 right-0 h-full sm:w-12 md:w-20 sm:bg-gradient-to-l sm:from-base-100 sm:to-transparent" />
      </div>

      {/* Profile Data */}
      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8 mb-8 w-full px-4 md:px-0 relative -mt-12 md:-mt-16">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={profile.avatar_url || AVATAR_PLACEHOLDER}
            alt="Avatar"
            className="w-24 h-24 md:w-32 md:h-32 rounded object-cover ring-4 ring-base-100 "
          />
        </div>

        {/* User Info */}
        <div className="flex-1 flex flex-col md:justify-center gap-1 md:mt-16 w-full">
          <div className="flex flex-row justify-between items-center w-full ">
            <h1 className="text-2xl font-semibold">
              {profile.display_name || profile.username}
            </h1>

            {!isOwnProfile && (
              <FollowButton
                userId={profile.id}
                onFollowChange={async () => {
                  const followStats = await getFollowStats(profile.id);
                  setViewedProfile((prev) =>
                    prev ? { ...prev, ...followStats } : null
                  );
                }}
              />
            )}
          </div>

          <h2 className="text-md text-muted-foreground">@{profile.username}</h2>

          <div className="mt-2">
            <p>
              {profile.bio ? (
                profile.bio
              ) : (
                <span className="italic text-sm">No bio</span>
              )}
            </p>
          </div>

          {/* Follower Stats */}
          <div className="mt-2 flex flex-row gap-4 text-sm text-base-content font-medium">
            <span className="hover:underline underline-offset-2">
              {profile.followers}{" "}
              <span className="text-base-content/80 font-normal">
                Followers
              </span>{" "}
            </span>
            <span className="hover:underline underline-offset-2">
              {profile.following}{" "}
              <span className="text-base-content/80 font-normal">
                Following
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
