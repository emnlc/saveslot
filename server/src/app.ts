import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

import { gamesRoutes } from "./routes/games";
// import { usersRoutes } from "./routes/users";
// import { authRoutes } from "./routes/auth";
// import { listsRoutes } from "./routes/lists";
// import { reviewsRoutes } from "./routes/reviews";

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
// app.route("/reviews", reviewsRoutes);

export default app;
