import { addPharmacyDetail, pharmacySettings } from "./profile.service.js";
import { sendSuccess } from "../../../utils/response.js";

const updatePharmacyDetail = async (req, res, next) => {
  try {
    const result = await addPharmacyDetail(req.user.pharmacyId, req.body);
    return sendSuccess(res, result, "Pharmacy Details Updated Successfully");
  } catch (error) {
    next(error);
  }
};

const updatePharmacySetting = async (req, res, next) => {
  try {
    const result = await pharmacySettings(req.user.pharmacyId, req.body);
    return sendSuccess(res, result, "Pharmacy Settings Updated Successfully");
  } catch (error) {
    next(error);
  }
};

export { updatePharmacyDetail, updatePharmacySetting };