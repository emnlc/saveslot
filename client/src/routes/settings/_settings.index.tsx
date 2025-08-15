import { createFileRoute } from "@tanstack/react-router";
import Settings from "@/pages/Settings/Settings";
import { useEffect } from "react";

export const Route = createFileRoute("/settings/_settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    document.title = "Profile Settings";
  });

  return (
    <>
      <Settings />
    </>
  );
}
