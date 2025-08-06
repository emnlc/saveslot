import { createRootRoute, Outlet } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="flex flex-col justify-between min-h-svh" id="layout">
        <Navbar />
        <div className="flex-1 flex justify-center">
          <Outlet />
        </div>
        {/* <TanStackRouterDevtools /> */}
        <Footer />
      </div>
    </>
  ),
});
