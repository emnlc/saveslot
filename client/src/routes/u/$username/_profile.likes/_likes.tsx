import {
  createFileRoute,
  Link,
  Outlet,
  useParams,
} from "@tanstack/react-router";
import { UseProfileContext } from "@/context/ViewedProfileContext";

export const Route = createFileRoute("/u/$username/_profile/likes/_likes")({
  component: RouteComponent,
});

function RouteComponent() {
  const { username } = useParams({
    from: "/u/$username/_profile/likes/_likes",
  });
  const { viewedProfile, isOwnProfile } = UseProfileContext();

  return (
    <>
      <div className="p-6 my-12 flex flex-col gap-8 ">
        <div className="flex flex-row justify-between gap-4">
          <h2 className="text-2xl font-bold">
            {isOwnProfile
              ? "Your Likes"
              : `${viewedProfile?.display_name}'s Likes`}
          </h2>

          <div className="flex gap-2">
            <Link
              to="/u/$username/likes/games"
              params={{ username }}
              className="btn btn-sm md:btn-md "
              activeProps={{
                className: "btn-secondary",
              }}
              inactiveProps={{
                className: "btn-ghost hover:btn-secondary",
              }}
            >
              Games
            </Link>
            <Link
              to="/u/$username/likes/lists"
              params={{ username }}
              className="btn btn-sm md:btn-md "
              activeProps={{
                className: "btn-secondary",
              }}
              inactiveProps={{
                className: "btn-ghost hover:btn-secondary",
              }}
            >
              Lists
            </Link>
            <Link
              to="/u/$username/likes/reviews"
              params={{ username }}
              className="btn btn-sm md:btn-md"
              activeProps={{
                className: "btn-secondary",
              }}
              inactiveProps={{
                className: "btn-ghost hover:btn-secondary",
              }}
            >
              Reviews
            </Link>
          </div>
        </div>
        <Outlet />
      </div>
    </>
  );
}
