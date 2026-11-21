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

// Health check endpoint for Render & UptimeRobot monitoring
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'taskflow-backend', uptime: process.uptime() }));
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok', service: 'taskflow-backend', uptime: process.uptime() }));

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