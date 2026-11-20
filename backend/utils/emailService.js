const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport(
  process.env.SMTP_HOST && process.env.SMTP_HOST !== "smtp.gmail.com"
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
    : {
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
);

/**
 * Strips HTML tags and creates a clean, readable plain-text email fallback.
 * Essential for anti-spam scoring (multipart/alternative).
 */
const htmlToPlainText = (html) => {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+\n/g, "\n\n")
    .trim();
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!to) {
      return {
        success: false,
        message: "Recipient email is required",
      };
    }

    const smtpUser = process.env.SMTP_USER;
    const plainText = text || htmlToPlainText(html) || subject;

    const info = await transporter.sendMail({
      from: `"TaskFlow" <${smtpUser}>`,
      replyTo: smtpUser,
      to,
      subject,
      text: plainText,
      html,
    });

    console.log("Email sent successfully to:", to, "ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error.message);

    return {
      success: false,
      message: error.message,
    };
  }
};

module.exports = {
  sendEmail,
  transporter,
  htmlToPlainText,
};
