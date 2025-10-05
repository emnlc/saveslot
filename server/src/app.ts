import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

import { addNewGames } from "./services/updaters/newGames";
import { addUpcomingGames } from "./services/updaters/upcomingGames";

import { gamesRoutes } from "./routes/games";
import { reviewsRoutes } from "./routes/reviews";
import { landingRoutes } from "./routes/landing";
import { searchRoutes } from "./routes/search";

// on database reset
// import { populateGames } from "./services/updaters/populator";

const app = new Hono();

// middleware
app.use("*", logger()); // Log all requests
app.use("*", cors()); // Enable CORS

// health check
app.get("/", (c) => c.text("SaveSlot API is running."));

// routes
app.route("/games", gamesRoutes);
app.route("/reviews", reviewsRoutes);
app.route("/landing", landingRoutes);
app.route("/search", searchRoutes);

app.post("/update-games", async (c) => {
  return c.json({ success: true });
});

// Run on startup
addNewGames();
addUpcomingGames();
// populateGames();

export default app;
