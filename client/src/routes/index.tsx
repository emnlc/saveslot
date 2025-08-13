import { createFileRoute } from "@tanstack/react-router";
// import LandingPage from "../pages/Landing/Landing";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <></>;
}
