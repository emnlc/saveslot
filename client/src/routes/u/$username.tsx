import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProfileProvider } from "@/context/ViewedProfileContext";

export const Route = createFileRoute("/u/$username")({
  component: () => (
    <ProfileProvider>
      <Outlet />
    </ProfileProvider>
  ),
});
