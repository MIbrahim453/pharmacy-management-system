import app from "./app.js";
import { connectDB } from "./config/db.js";
import { config } from "./config/index.js";
import dns from "dns";
import logger from "./utils/logger.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const startServer = async () => {
  try {
    await connectDB();
    logger.info("Database connected to server");

    const server = app.listen(config.port, () => "Server Started Successfully");

    let isShuttingDown = false;

    const gracefulShutdown = async (signal) => {
      if (isShuttingDown) return;

      isShuttingDown = true;
      console.log(`${signal} received. Shutting down gracefully`);
      const forceShutdown = setTimeout(async () => {
        logger.info("Forcefully shutting down the server");
        await disconnectDB();
        process.exit(1);
      }, 30000);

      server.close(async () => {
        clearTimeout(forceShutdown);
        await disconnectDB();
        logger.info("Database disconnected");
        process.exit(0);
      });
    };
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  process.exit(1);
});
startServer();
