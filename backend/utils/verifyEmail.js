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

async function verifyEmail() {
  try {
    console.log("Testing connection with:", process.env.SMTP_USER);
    await transporter.verify();
    console.log("SUCCESS: SMTP server is connected and ready to send emails!");
  } catch (error) {
    console.error("ERROR: SMTP verification failed:", error.message);
  }
}

verifyEmail();
