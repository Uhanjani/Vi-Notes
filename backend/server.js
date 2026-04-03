const app = require("./src/app");
const connectDatabase = require("./src/config/db");
const { env } = require("./src/config/env");

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`Backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
