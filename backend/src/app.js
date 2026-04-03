const express = require("express");
const cors = require("cors");
const { env } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: env.clientOrigin
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
