import mongoose from "mongoose";
import { config } from "./index.js";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${config.database.dbUrl}/${config.database.dbName}`,
      {
        maxPoolSize: config.database.maxPool,
        minPoolSize: config.database.minPool,
        connectTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      },
    );
    logger.info("Database Connected Successfully");
    return true;
  } catch (error) {
    logger.error("Error Occurred While Connecting DB", error);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  logger.info("MongoDB connected");
});

mongoose.connection.on("disconnected", () => {
  logger.info("MongoDB disconnected");
});

mongoose.connection.on("error", () => {
  logger.info("MongoDB connection error");
});

const disconnectDB = async () => {
  try {
    const disconnect = await mongoose.disconnect();
    logger.info("Database disconnected");
    return true;
  } catch (error) {
    logger.error("Error occurred while disconnecting DB");
    process.exit(1);
  }
};

export { connectDB, disconnectDB };
