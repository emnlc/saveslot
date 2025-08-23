import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/u/$username/_profile/likes/_likes/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/u/$username/likes/games",
      params: { username: params.username },
    });
  },
});
