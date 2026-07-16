import nodemailer from "nodemailer";
import { config } from "./index.js";
import logger from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const from = config.email.from;
    const response = await transporter.sendMail({
      to,
      from,
      subject,
      html,
    });

    logger.info(`Email sent to ${to}`, {
      messageId: response.messageId,
      accepted: response.accepted,
    });

    return response;
  } catch (error) {
    logger.info(`Error sending email to ${to}: ${error.message}`, {
      code: error.code,
      command: error.command,
      response: error.response,
    });
    throw error;
  }
};

export default sendEmail