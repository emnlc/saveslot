import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

import { addNewGames, addUpcomingGames } from "./services/gameUpdater";

import { gamesRoutes } from "./routes/games";
// import { usersRoutes } from "./routes/users";
// import { authRoutes } from "./routes/auth";
// import { listsRoutes } from "./routes/lists";
import { reviewsRoutes } from "./routes/reviews";

const app = new Hono();

// middleware
app.use("*", logger()); // Log all requests
app.use("*", cors()); // Enable CORS

// health check
app.get("/", (c) => c.text("SaveSlot API is running."));

// routes
app.route("/games", gamesRoutes);
// app.route("/users", usersRoutes);
// app.route("/auth", authRoutes);
// app.route("/lists", listsRoutes);
app.route("/reviews", reviewsRoutes);

app.post("/update-games", async (c) => {
  return c.json({ success: true });
});

// scheduled routes
addNewGames();
addUpcomingGames();
setInterval(addNewGames, 24 * 60 * 60 * 1000); // every 24 hours

export default app;
