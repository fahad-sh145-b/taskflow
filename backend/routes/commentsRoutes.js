const express = require('express');
const router = express.Router();

const Comments = require('../models/comments');
const Task = require('../models/task');
const Project = require('../models/project');
const User = require('../models/user');
const { jwtAuthMiddleware } = require('../jwt');

const { sendEmail } = require("../utils/emailService");
const { commentNotificationTemplate } = require("../utils/emailTemplates");

// Check whether user can access a task
async function canAccessTask(task, userId, role) {
    const uId = userId.toString();
    const currentUser = await User.findById(uId);
    if ((currentUser?.role || role) === "admin") return true;

    const project = await Project.findById(task.project);
    if (!project) return false;

    return (
        project.owner.toString() === uId ||
        task.createdBy.toString() === uId ||
        (task.assignedTo && task.assignedTo.toString() === uId)
    );
}

// GET COMMENTS FOR A TASK
router.get('/:taskId', jwtAuthMiddleware, async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const userId = req.user._id || req.user.id;
        const allowed = await canAccessTask(task, userId, req.user.role);
        if (!allowed) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const comments = await Comments.find({ task: task._id })
            .populate("user", "name email")
            .sort({ createdAt: 1 });

        return res.status(200).json(comments);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// GET ALL COMMENTS (Admin or general inspection)
router.get('/', jwtAuthMiddleware, async (req, res) => {
    try {
        const response = await Comments.find();
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// CREATE COMMENT
router.post('/:taskId', jwtAuthMiddleware, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const taskId = req.params.taskId;
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const userId = req.user._id || req.user.id;
        const allowed = await canAccessTask(task, userId, req.user.role);
        if (!allowed) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const newComment = await Comments.create({
            text: text.trim(),
            task: task._id,
            user: userId
        });

        const populatedComment = await Comments.findById(newComment._id).populate("user", "name email");

        // Send email notifications to creator and assignee (excluding commenter)
        try {
            const notificationUsers = [];

            if (task.createdBy) {
                notificationUsers.push(task.createdBy.toString());
            }

            if (task.assignedTo) {
                notificationUsers.push(task.assignedTo.toString());
            }

            // Also notify the commenter so they receive a record in their inbox
            if (userId) {
                notificationUsers.push(userId.toString());
            }

            const uniqueUsers = [
                ...new Set(notificationUsers),
            ];

            if (uniqueUsers.length > 0) {
                const recipients = await User.find({
                    _id: { $in: uniqueUsers },
                }).select("name email");

                const frontendUrl = process.env.FRONTEND_URL || "https://taskflow-eta-ten-87.vercel.app";
                const taskUrl = `${frontendUrl}/?taskId=${task._id}&tab=comments`;

                await Promise.all(
                    recipients.map((recipient) =>
                        sendEmail({
                            to: recipient.email,
                            subject: `[TaskFlow] New Comment on "${task.title}"`,
                            html: commentNotificationTemplate({
                                userName: recipient.name,
                                taskTitle: task.title,
                                commentAuthor: populatedComment.user?.name || "A team member",
                                commentText: populatedComment.text,
                                taskUrl,
                            }),
                        }).catch(e => console.error("Email send failed:", e.message))
                    )
                );
            }
        } catch (emailError) {
            console.error("Email notification error:", emailError.message);
        }

        return res.status(201).json({
            message: 'Comment added successfully',
            comment: populatedComment
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;
