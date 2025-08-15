import { createFileRoute } from "@tanstack/react-router";
import Account from "@/pages/Settings/Account";
import { useEffect } from "react";

export const Route = createFileRoute("/settings/_settings/account")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    document.title = "Account Settings";
  });

  return (
    <>
      <Account />
    </>
  );
}
