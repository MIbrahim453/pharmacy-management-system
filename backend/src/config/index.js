import dotenv from "dotenv";
dotenv.config();

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,

  // Frontend
  frontendUrl: (process.env.FRONTEND_URL || "http://localhost:5173").trim(),

  // Database
  database: {
    dbName: process.env.DB_NAME,
    dbUrl: process.env.MONGODB_URI,
    maxPool: Number(process.env.MAX_POOL_SIZE) || 10,
    minPool: Number(process.env.MIN_POOL_SIZE) || 1,
  },

  //  JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshSecretExpiry: process.env.JWT_REFRESH_SECRET_EXPIRES_IN,
    rememberMeExpiry: process.env.JWT_REFRESH_SECRET_EXPIRES_IN_REMEMBER_ME,
  },

  //Logs
  log: {
    logLevel: process.env.LOG_LEVEL || "info",
    logDir: process.env.LOG_DIR || "./logs",
    maxSize: process.env.LOG_MAX_SIZE || "10m",
    maxFiles: process.env.LOG_MAX_FILES || "14d",
  },

  //Email
  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    from: process.env.EMAIL_FROM,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },

  // Cron
  cron: {
    cronExpression: process.env.EXPIRY_CHECK_CRON || "0 0 * * *",
    cronTimezone: process.env.CRON_TIMEZONE,
  },
};

const validateConfig = () => {
  const requiredConfig = ["database.dbName", "database.dbUrl"];
  if (config.nodeEnv === "production") {
    const missing = [];
    requiredConfig.forEach((key) => {
      const keys = key.split(".");
      let value = config;
      keys.forEach((k) => {
        value = value?.[k];
        if (!value) {
          missing.push(key);
        }
      });
    });
    if (missing.length > 0) {
      throw new Error(
        `Missing required config in production: ${missing.join(", ")}`,
      );
    }
  }
};

validateConfig();

export { config };
