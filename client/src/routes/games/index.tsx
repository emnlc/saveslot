import { createFileRoute } from "@tanstack/react-router";

import Games from "../../pages/Games/Games";
import { useEffect } from "react";

export const Route = createFileRoute("/games/")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    document.title = "Games";
  });

  return <Games />;
}
