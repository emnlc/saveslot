import { createFileRoute } from "@tanstack/react-router";
import List from "@/pages/UserPage/Sections/Subsections/List/List";

export const Route = createFileRoute("/u/$username/list/_list/$listslug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <List />;
}
