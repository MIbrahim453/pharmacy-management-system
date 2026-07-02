import {
  avgHourlySignIns,
  avgPharmacyByCites,
  getAnalytics,
} from "./analytics.service.js";
import { sendSuccess } from "../../../utils/response.js";

const getHourlySignIns = async (req, res, next) => {
  try {
    const result = await avgHourlySignIns();
    return sendSuccess(res, result, "Hourly SignIns Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const getPharmaciesByCity = async (req, res, next) => {
  try {
    const result = await avgPharmacyByCites();
    return sendSuccess(res, result, "Pharmacies By City Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const analyticsCard = async (req, res, next) => {
  try {
    const result = await getAnalytics();
    return sendSuccess(res, result, "Analytics Card Data Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

export { getHourlySignIns, getPharmaciesByCity, analyticsCard };
