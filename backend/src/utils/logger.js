import winston from "winston";
import winstonDailyRotateFile from "winston-daily-rotate-file";
import { config } from "../config/index.js";
import path from "path";
import fs from "fs";

if (!fs.existsSync(config.log.logDir)) {
  fs.mkdirSync(config.log.logDir, { recursive: true });
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? ` | ${Object.entries(meta)
          .map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
          .join(" | ")}`
      : "";

    return `[${timestamp}] ${level}: ${message}${metaString}`;
  }),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const transports = [];

transports.push(
  new winston.transports.Console({
    level: config.nodeEnv === "production" ? config.log.logLevel : "debug",
    format: consoleFormat,
  }),
);

if (config.nodeEnv === "production") {
  transports.push(
    new winstonDailyRotateFile({
      filename: path.join(config.log.logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      format: fileFormat,
      maxSize: config.log.maxSize,
      maxFiles: config.log.maxFiles,
      zippedArchive: true,
    }),
  );

  transports.push(
    new winstonDailyRotateFile({
      filename: path.join(config.log.logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      format: fileFormat,
      maxSize: config.log.maxSize,
      maxFiles: "7d",
      zippedArchive: true,
    }),
  );
}

const logger = winston.createLogger({
  level: config.log.logLevel,
  levels,
  defaultMeta: { service: "pharmacy-management-system" },
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(config.log.logDir, "exceptions.log"),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(config.log.logDir, "rejections.log"),
      format: fileFormat,
    }),
  ],
  exitOnError: false,
});

export default logger;
