import {
  editInvoice,
  getAllInvoices,
  markPaid,
  viewInvoice,
  downloadInvoice,
} from "./invoice.service.js";
import { sendSuccess } from "../../../utils/response.js";
import { generateInvoicePdf } from "../../../utils/invoicePdf.js";

const invoiceList = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const result = await getAllInvoices(userId, req.query);
    return sendSuccess(res, result, "Invoices Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const invoiceView = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const result = await viewInvoice(userId, req.params.id);
    return sendSuccess(res, result, "Invoice Details Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const invoiceEdit = async (req, res, next) => {
  try {
    const result = await editInvoice(req.user.id, req.params.id, req.body);
    return sendSuccess(res, result, "Invoice Updated Successfully");
  } catch (error) {
    next(error);
  }
};

const invoiceMarkPaid = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const result = await markPaid(userId, req.params.id);
    return sendSuccess(res, result, "Invoice Marked as Paid Successfully");
  } catch (error) {
    next(error);
  }
};

const invoiceDownload = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const invoice = await downloadInvoice(userId, req.params.id);
    const pdfBuffer = await generateInvoicePdf(invoice);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
    );
    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export { invoiceList, invoiceView, invoiceEdit, invoiceMarkPaid, invoiceDownload };
