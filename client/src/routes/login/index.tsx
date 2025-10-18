import { createFileRoute } from "@tanstack/react-router";
import Login from "@/pages/Auth/Login";
import { useEffect } from "react";

export const Route = createFileRoute("/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    document.title = "Login | SaveSlot";
  });

  return <Login />;
}
