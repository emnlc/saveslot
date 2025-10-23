import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { gamesRoutes } from "./routes/games";
import { reviewsRoutes } from "./routes/reviews";
import { landingRoutes } from "./routes/landing";
import { searchRoutes } from "./routes/search";
import { activityRoutes } from "./routes/activity";
import { listsRoutes } from "./routes/lists/lists";
import { likesRoutes } from "./routes/likes/likes";
import { userGamesRoutes } from "./routes/userGames/userGames";
import { profilesRoutes } from "./routes/profiles/profiles";
import { followsRoutes } from "./routes/follows/follows";
import { gameStatsRoutes } from "./routes/gameStats";
import { startScheduler } from "./scheduler";
import { favoritesRoutes } from "./routes/favorites/favorites";
import { profileStatsRoutes } from "./routes/profileStats/profileStats";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: [
      "https://saveslot.app",
      "https://www.saveslot.app",
      process.env.NODE_ENV !== "production" ? "http://localhost:5173" : "",
      process.env.LOCAL_NETWORK_URL || "",
    ].filter(Boolean),
    credentials: true,
  })
);

if (process.env.NODE_ENV !== "production") {
  app.use("*", logger());
}

app.get("/", (c) => c.text("SaveSlot API is running."));

app.route("/games", gamesRoutes);
app.route("/reviews", reviewsRoutes);
app.route("/landing", landingRoutes);
app.route("/search", searchRoutes);
app.route("/activity", activityRoutes);
app.route("/lists", listsRoutes);
app.route("/likes", likesRoutes);
app.route("/user-games", userGamesRoutes);
app.route("/profiles", profilesRoutes);
app.route("/follows", followsRoutes);
app.route("/games", gameStatsRoutes);
app.route("/favorites", favoritesRoutes);
app.route("/profiles", profileStatsRoutes);

startScheduler();

export default app;
