const express = require("express");
const cors = require("cors");
const { env } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();
const allowedOrigins = new Set([
  env.clientOrigin,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

const isAllowedOrigin = (origin) => {
  if (!origin || allowedOrigins.has(origin)) {
    return true;
  }

  return /^https:\/\/.+-\d+\.app\.github\.dev$/.test(origin);
};

app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    }
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(authRoutes);
app.use(sessionRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
