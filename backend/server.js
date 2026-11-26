const express = require('express');

const app = express();

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const db = require('./db');
const PORT = process.env.PORT || 4000

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/projectRoutes');
const commentsRoutes = require("./routes/commentsRoutes");
const activityRoutes = require("./routes/activityRoutes");
// Routes middleware (supports direct, plural, and /api prefixes)
app.use('/user', userRoutes);
app.use('/users', userRoutes);
app.use('/task', taskRoutes);
app.use('/tasks', taskRoutes);
app.use('/project', projectRoutes);
app.use('/projects', projectRoutes);
app.use('/comments', commentsRoutes);
app.use('/comment', commentsRoutes);
app.use('/activity', activityRoutes);
app.use('/activities', activityRoutes);
const attachmentRoutes = require("./routes/attachmentRoutes");
app.use('/attachments', attachmentRoutes);
app.use('/attachment', attachmentRoutes);

app.use('/api/auth', userRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/comment', commentsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/activities', activityRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/attachment", attachmentRoutes);

// Root endpoint - Elegant Status & Landing Page
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaskFlow API - Operational</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 40px 32px; max-width: 500px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .status-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); color: #4ade80; padding: 6px 16px; border-radius: 9999px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
    .status-dot { width: 10px; height: 10px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 12px 0; color: #ffffff; }
    p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0; }
    .btn { display: inline-block; background: #6366f1; color: #ffffff; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 10px; text-decoration: none; transition: background 0.2s; }
    .btn:hover { background: #4f46e5; }
    .footer-note { font-size: 12px; color: #64748b; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="status-badge"><span class="status-dot"></span> TaskFlow Backend API is Online</div>
    <h1>Cloud Services Operational</h1>
    <p>This is the REST API server powering TaskFlow. To access the project management dashboard, open the live web app.</p>
    <a href="https://taskflow-eta-ten-87.vercel.app" class="btn">Open TaskFlow App &rarr;</a>
    <div class="footer-note">Render Cloud Backend &bull; Monitored 24/7 by UptimeRobot</div>
  </div>
</body>
</html>
    `);
});

// Health check endpoint for Render & UptimeRobot monitoring
const BUILD_VERSION = "2.4.0-attachment-notifications";
const BUILD_TIME = "2026-11-26T04:45:00Z";
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'taskflow-backend', version: BUILD_VERSION, buildTime: BUILD_TIME, uptime: process.uptime() }));
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok', service: 'taskflow-backend', version: BUILD_VERSION, buildTime: BUILD_TIME, uptime: process.uptime() }));

// Cloud email diagnostic test endpoint
app.get('/api/test-email', async (req, res) => {
    try {
        const { sendEmail } = require('./utils/emailService');
        const target = req.query.to || process.env.SMTP_USER || 'bashir.runtime@gmail.com';

        const result = await sendEmail({
            to: target,
            subject: 'TaskFlow Cloud Email Diagnostic Test',
            html: '<h2>TaskFlow Cloud Email Test</h2><p>If you see this, email delivery from Render cloud backend is working 100%!</p>'
        });

        res.json({
            status: result.success ? 'success' : 'failed',
            target,
            diagnostics: {
                hasSmtpUser: !!process.env.SMTP_USER,
                smtpUser: process.env.SMTP_USER ? process.env.SMTP_USER.replace(/(.{3})(.*)(@.*)/, '$1***$3') : null,
                hasSmtpPass: !!process.env.SMTP_PASS,
                passLength: process.env.SMTP_PASS ? process.env.SMTP_PASS.trim().length : 0,
                smtpHost: process.env.SMTP_HOST || 'default (smtp.gmail.com:465 SSL)'
            },
            result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const { checkAndSendDueDateReminders } = require('./utils/dueDateService');

app.listen(PORT, () => {
    console.log(`Server is live on port ${PORT}`);

    // Run due date reminder checks 10 seconds after boot (when DB is ready)
    setTimeout(() => {
        console.log('[Scheduler] Running initial due date & overdue email check...');
        checkAndSendDueDateReminders().catch(err => console.error('[Scheduler] Initial check error:', err.message));
    }, 10000);

    // Run recurring checks every 4 hours
    setInterval(() => {
        console.log('[Scheduler] Running scheduled due date & overdue check...');
        checkAndSendDueDateReminders().catch(err => console.error('[Scheduler] Interval check error:', err.message));
    }, 4 * 60 * 60 * 1000);
});