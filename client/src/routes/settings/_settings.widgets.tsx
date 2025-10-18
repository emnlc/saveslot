import { createFileRoute } from "@tanstack/react-router";
import Widget from "@/pages/Settings/Widgets";
import { useEffect } from "react";

export const Route = createFileRoute("/settings/_settings/widgets")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    document.title = "Widget Settings";
  });

  return (
    <>
      <Widget />
    </>
  );
}
