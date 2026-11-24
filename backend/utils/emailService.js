const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const nodemailer = require("nodemailer");

/**
 * Creates and returns an optimized nodemailer transporter.
 * Uses port 465 SSL for cloud container reliability (Render / Railway / AWS).
 */
const createTransporter = () => {
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

  if (process.env.SMTP_HOST && process.env.SMTP_HOST !== "smtp.gmail.com") {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  // Reliable Direct SSL for Gmail in Cloud Environments
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

const transporter = createTransporter();

// Verify connection on startup
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter.verify((err, success) => {
    if (err) {
      console.error("⚠️ [Nodemailer] SMTP Verification Failed:", err.message);
    } else {
      console.log("✅ [Nodemailer] SMTP Connection Verified: Ready to send emails.");
    }
  });
} else {
  console.warn("⚠️ [Nodemailer] SMTP_USER or SMTP_PASS not set in environment variables.");
}

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

    const smtpUser = (process.env.SMTP_USER || "").trim();
    const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

    if (!smtpUser || !smtpPass) {
      console.error("❌ [Email Error] SMTP_USER or SMTP_PASS is not set in environment variables!");
      return {
        success: false,
        message: "SMTP_USER or SMTP_PASS is missing in environment variables on Render",
      };
    }

    const plainText = text || htmlToPlainText(html) || subject;

    // 1. Attempt Direct Nodemailer SMTP (works on localhost, VPS, or unrestricted hosts)
    try {
      const activeTransporter = createTransporter();

      const info = await activeTransporter.sendMail({
        from: `"TaskFlow" <${smtpUser}>`,
        replyTo: smtpUser,
        to,
        subject,
        text: plainText,
        html,
        headers: {
          "X-Priority": "3",
          "X-MSMail-Priority": "Normal",
          "Importance": "Normal",
        },
      });

      console.log("✅ Email sent successfully via Direct SMTP to:", to, "ID:", info.messageId);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (smtpErr) {
      console.warn("⚠️ Direct SMTP failed (e.g. Render Free Tier port block):", smtpErr.message);
      console.log("🔄 Forwarding to Vercel HTTPS Serverless Relay (Port 443)...");

      // 2. HTTPS Relay over Port 443 (Never blocked by cloud firewalls)
      const relayUrl = process.env.VERCEL_MAIL_RELAY_URL || "https://taskflow-eta-ten-87.vercel.app/api/send-email";
      const relayRes = await fetch(relayUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          html,
          text: plainText,
        }),
      });

      const relayData = await relayRes.json().catch(() => ({}));

      if (relayRes.ok && relayData?.success) {
        console.log("✅ Email sent successfully via Vercel HTTPS Relay to:", to, "ID:", relayData.messageId);
        return {
          success: true,
          messageId: relayData.messageId,
          relay: true,
        };
      }

      throw new Error(relayData?.error || relayData?.message || `HTTP ${relayRes.status}`);
    }
  } catch (error) {
    console.error("❌ Email sending failed completely:", error.message);

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
