import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { to, subject, html, text } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, message: "Recipient 'to' is required" });
    }

    const smtpUser = (process.env.SMTP_USER || "shaikhbashiruddinmohdhajishaik@gmail.com").trim();
    const smtpPass = (process.env.SMTP_PASS || "pxpoelgixszslnix").replace(/\s+/g, "");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const info = await new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: `"TaskFlow" <${smtpUser}>`,
          replyTo: smtpUser,
          to,
          subject,
          text: text || subject,
          html,
          headers: {
            "X-Priority": "3",
            "X-MSMail-Priority": "Normal",
            "Importance": "Normal",
            "X-Mailer": "TaskFlow Enterprise Mailer v2",
            "List-Unsubscribe": `<mailto:${smtpUser}?subject=unsubscribe>`,
          },
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      relay: "vercel-serverless",
    });
  } catch (error) {
    console.error("[Vercel Email Relay Error]:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
