import { createRootRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useRef, useEffect } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function RootComponent() {
  const loadingBarRef = useRef<LoadingBarRef>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = router.subscribe("onBeforeLoad", () => {
      loadingBarRef.current?.continuousStart();
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    const unsubscribe = router.subscribe("onLoad", () => {
      loadingBarRef.current?.complete();
    });

    return unsubscribe;
  }, [router]);

  return (
    <>
      <div className="flex flex-col justify-between min-h-svh" id="layout">
        <Navbar />
        <LoadingBar
          ref={loadingBarRef}
          color="#EA003E"
          height={3}
          shadow={true}
        />
        <div className="flex-1 flex justify-center relative">
          <Outlet />
        </div>
        {/* <TanStackRouterDevtools /> */}
        <Footer />
      </div>
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
