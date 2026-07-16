import cron from "node-cron";
import logger from "../utils/logger.js";
import { checkAndExpireBatches } from "../utils/expiryCheck.js";
import { config } from "../config/index.js";

let expiryCheckTask = null;
let isRunning = false;

const cronExpression = config.cron.cronExpression;
const cronTimezone = config.cron.cronTimezone;

const runExpiryCheck = async (trigger = "scheduled") => {
  if (isRunning) {
    logger.warn(
      `Expiry check skipped because a previous run is still active | trigger = "${trigger}"`,
    );
    return;
  }

  isRunning = true;

  try {
    await checkAndExpireBatches();
    logger.info(`Expiry check completed successfully | trigger = "${trigger}"`);
  } catch (error) {
    logger.error(`Expiry check failed | trigger = "${trigger}"`, error);
  } finally {
    isRunning = false;
  }
};

const startExpiryCheckJob = () => {
  if (expiryCheckTask) {
    return expiryCheckTask;
  }

  expiryCheckTask = cron.schedule(
    cronExpression,
    () => {
      void runExpiryCheck("cron");
    },
    cronTimezone ? { timezone: cronTimezone } : undefined,
  );

  logger.info(
    `Expiry check cron scheduled with expression "${cronExpression}"${
      cronTimezone ? ` in timezone "${cronTimezone}"` : ""
    }`,
  );

  return expiryCheckTask;
};

const stopExpiryCheckJob = () => {
  if (!expiryCheckTask) {
    return;
  }

  expiryCheckTask.stop();
  expiryCheckTask = null;
};

export { startExpiryCheckJob, stopExpiryCheckJob, runExpiryCheck };
