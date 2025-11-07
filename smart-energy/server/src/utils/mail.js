import nodemailer from "nodemailer";
import logger from "../config/logger.js";

// Hardcoded SMTP credentials (fill these in before running)
const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 465; // 465 for SSL, 587 for STARTTLS
const SMTP_SECURE = true; // false if using 587
const SMTP_USER = "sonamchopheld@gmail.com"; // e.g., 'sonamchopheld@gmail.com'
const SMTP_PASS = "jcpm ggtj loeu kkwf"; // e.g., Gmail App Password

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Boolean(SMTP_SECURE),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  return transporter;
}

export async function sendMail({ to, subject, text }) {
  const t = getTransporter();
  try {
    const info = await t.sendMail({
      from: SMTP_USER,
      to,
      subject,
      text,
    });
    logger.info("Mail sent", { to, subject, messageId: info.messageId });
    return info;
  } catch (err) {
    logger.error("Mail send failed", { to, subject, error: err.message });
    throw err;
  }
}

export async function verifyMailTransport() {
  const t = getTransporter();
  try {
    await t.verify();
    logger.info("SMTP transport verified");
    return true;
  } catch (err) {
    logger.error("SMTP transport verification failed", { error: err.message });
    return false;
  }
}
