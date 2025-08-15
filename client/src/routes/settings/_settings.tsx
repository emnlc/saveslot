import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

import { UserAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
export const Route = createFileRoute("/settings/_settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, profile } = UserAuth();
  const nav = useNavigate();

  if (!session) {
    nav({ to: "/login" });
  }

  if (!profile) {
    return (
      <>
        <div className="flex flex-row container mx-auto md:max-w-5xl gap-4 my-12">
          <div className="p-4">
            <nav>
              <span className="text-sm">Settings</span>
              <ul className="flex flex-col ml-4 mt-4 gap-2 w-full">
                <li className="flex-1">
                  <Link
                    className="flex-1 block text-left text-sm text-base-content/60 hover:text-primary hover:bg-base-200/70 transition-all rounded-lg py-2 pl-4 pr-16"
                    activeProps={{
                      className: "text-primary tab-active bg-base-200/70",
                    }}
                    activeOptions={{ exact: true }}
                    to="/settings"
                  >
                    Profile
                  </Link>
                </li>

                <li className="flex-1">
                  <Link
                    className="flex-1 block text-left text-sm text-base-content/60 hover:text-primary hover:bg-base-200/70 transition-all rounded-lg py-2 pl-4 pr-16"
                    activeProps={{
                      className: "text-primary tab-active bg-base-200/70",
                    }}
                    to="/settings/account"
                  >
                    Account
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex-1 bg-base-200 p-8 rounded-lg">
            <div className="skeleton h-8 w-full mb-4" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-row container mx-auto md:max-w-5xl gap-4 my-12 ">
        <div className="p-4">
          <nav>
            <span className="text-sm">Settings</span>
            <ul className="flex flex-col ml-4 mt-4 gap-2 w-full">
              <li className="flex-1">
                <Link
                  className="flex-1 block text-left text-sm text-base-content/60 hover:text-primary hover:bg-base-200/70 transition-all rounded-lg py-2 pl-4 pr-16"
                  activeProps={{
                    className: "text-primary tab-active bg-base-200/70",
                  }}
                  activeOptions={{ exact: true }}
                  to="/settings"
                >
                  Profile
                </Link>
              </li>

              <li className="flex-1">
                <Link
                  className="flex-1 block text-left text-sm text-base-content/60 hover:text-primary hover:bg-base-200/70 transition-all rounded-lg py-2 pl-4 pr-16"
                  activeProps={{
                    className: "text-primary tab-active bg-base-200/70",
                  }}
                  to="/settings/account"
                >
                  Account
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex-1 bg-base-200 p-8 rounded-lg">
          <Outlet />
        </div>
      </div>
    </>
  );
}
