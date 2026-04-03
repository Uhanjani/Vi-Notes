const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", "..", ".env");

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");

  envFile.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || "SECRET_KEY",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
};

if (!env.mongoUri) {
  throw new Error(
    "Missing MONGO_URI. Create backend/.env and add your MongoDB connection string."
  );
}

module.exports = { env };
