
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { jwtAuthMiddleware, generatetoken } = require('../jwt')
const Task = require("../models/task");
const Activity = require("../models/activity");
const Project = require("../models/project");
const User = require("../models/user");
const { sendEmail } = require("../utils/emailService");
const {
    taskAssignedTemplate,
    taskCompletedTemplate,
    taskUpdatedTemplate,
} = require("../utils/emailTemplates");
const {
    sendManualTaskReminder,
    checkAndSendDueDateReminders,
} = require("../utils/dueDateService");




// GET TASKS
// User can see tasks from owned projects or tasks assigned to them.
router.get("/", jwtAuthMiddleware, async (req, res) => {
    try {
        const { project, status, assignedTo } = req.query;
        const userId = req.user._id || req.user.id;

        const ownedProjects = await Project.find({
            owner: userId,
        }).select("_id");

        const ownedProjectIds = ownedProjects.map((p) => p._id);

        const filter = {
            $or: [
                { project: { $in: ownedProjectIds } },
                { assignedTo: userId },
                { createdBy: userId },
            ],
        };

        if (project && mongoose.isValidObjectId(project)) {
            filter.project = project;
            delete filter.$or;
        }

        if (status) {
            filter.status = status;
        }

        if (assignedTo && mongoose.isValidObjectId(assignedTo)) {
            filter.assignedTo = assignedTo;
        }

        const tasks = await Task.find(filter)
            .populate("project", "name")
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

// CREATE TASK
router.post("/", jwtAuthMiddleware, async (req, res) => {
    try {
        const {
            title,
            description,
            project,
            priority,
            dueDate,
            assignedTo,
        } = req.body;

        if (!title || !project) {
            return res.status(400).json({
                message: "Title and project are required",
            });
        }

        const projectData = await Project.findById(project);

        if (!projectData) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        let assignee = null;

        if (assignedTo) {
            if (mongoose.isValidObjectId(assignedTo)) {
                assignee = await User.findById(assignedTo);
            } else if (typeof assignedTo === "string" && assignedTo.includes("@")) {
                const cleanEmail = assignedTo.trim().toLowerCase();
                assignee = await User.findOne({ email: cleanEmail });
                if (!assignee) {
                    assignee = await User.create({
                        name: (req.body.assignedToName && req.body.assignedToName.trim()) || cleanEmail.split("@")[0],
                        email: cleanEmail,
                        password: "User@" + Math.random().toString(36).substring(2, 8),
                        role: "member",
                    });
                }
            } else {
                return res.status(400).json({
                    message: "Invalid assigned user ID or email",
                });
            }

            if (!assignee) {
                return res.status(404).json({
                    message: "Assigned user not found",
                });
            }
        }

        const task = await Task.create({
            title,
            description,
            project,
            priority,
            dueDate,
            createdBy: req.user._id || req.user.id,
            assignedTo: assignee ? assignee._id : null,
        });

        const populatedTask = await Task.findById(task._id)
            .populate("project", "name")
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");

        res.status(201).json({
            message: "Task created successfully",
            task: populatedTask,
        });

        if (populatedTask.assignedTo && populatedTask.assignedTo.email) {
            try {
                await sendEmail({
                    to: populatedTask.assignedTo.email,
                    subject: `[TaskFlow] Task Assigned: "${populatedTask.title}"`,
                    html: taskAssignedTemplate({
                        userName: populatedTask.assignedTo.name,
                        taskTitle: populatedTask.title,
                        projectName: populatedTask.project?.name || "Project",
                        taskDescription: populatedTask.description,
                        priority: populatedTask.priority,
                        dueDate: populatedTask.dueDate ? new Date(populatedTask.dueDate).toLocaleDateString() : null,
                    }),
                });
            } catch (emailErr) {
                console.error("Assignment email failed:", emailErr.message);
            }
        }
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

// UPDATE TASK
router.put("/:id", jwtAuthMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const projectData = await Project.findById(task.project);

        const currentUserId = (req.user._id || req.user.id).toString();

        const currentUser = await User.findById(currentUserId);
        const userRole = currentUser?.role || req.user.role;
        const isAdmin = userRole === "admin";

        const isProjectOwner =
            projectData &&
            projectData.owner.toString() === currentUserId;

        const isCreator =
            task.createdBy.toString() === currentUserId;

        const isAssignee =
            task.assignedTo &&
            task.assignedTo.toString() === currentUserId;

        if (!isAdmin && !isProjectOwner && !isCreator && !isAssignee) {
            return res.status(403).json({
                message: "You are not authorized to update this task",
            });
        }

        const oldValues = {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : null,
            assignedTo: task.assignedTo ? task.assignedTo.toString() : null,
        };

        const allowedFields = [
            "title",
            "description",
            "status",
            "priority",
            "dueDate",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                task[field] = req.body[field];
            }
        });

        // Reassignment handling
        let assigneeChanged = false;
        if (req.body.assignedTo !== undefined) {
            if (!isAdmin && !isProjectOwner && !isCreator) {
                return res.status(403).json({
                    message: "Only admin, project owner, or creator can reassign tasks",
                });
            }

            if (req.body.assignedTo === null || req.body.assignedTo === "") {
                if (task.assignedTo) assigneeChanged = true;
                task.assignedTo = null;
            } else {
                if (!mongoose.isValidObjectId(req.body.assignedTo)) {
                    return res.status(400).json({
                        message: "Invalid assigned user ID",
                    });
                }

                const newAssignee = await User.findById(req.body.assignedTo);
                if (!newAssignee) {
                    return res.status(404).json({
                        message: "Assigned user not found",
                    });
                }

                if (!task.assignedTo || task.assignedTo.toString() !== newAssignee._id.toString()) {
                    assigneeChanged = true;
                }
                task.assignedTo = newAssignee._id;
            }
        }

        await task.save();

        const fieldsToTrack = ["status", "priority", "assignedTo", "title", "description", "dueDate"];
        const activities = [];

        for (const field of fieldsToTrack) {
            const oldValue = oldValues[field];
            const newValue =
                field === "assignedTo"
                    ? task.assignedTo
                        ? task.assignedTo.toString()
                        : null
                    : field === "dueDate"
                        ? task.dueDate
                            ? new Date(task.dueDate).toISOString().substring(0, 10)
                            : null
                        : task[field];

            if (String(oldValue) !== String(newValue)) {
                activities.push({
                    task: task._id,
                    user: req.user._id || req.user.id,
                    action: `${field} updated`,
                    field,
                    oldValue: oldValue === null ? "None" : String(oldValue),
                    newValue: newValue === null ? "None" : String(newValue),
                });
            }
        }

        if (activities.length > 0) {
            await Activity.insertMany(activities);
        }

        const updatedTask = await Task.findById(task._id)
            .populate("project", "name")
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");

        // Send Email Notification to Assignee and Creator
        const recipients = new Map();
        if (updatedTask.assignedTo && updatedTask.assignedTo.email) {
            recipients.set(updatedTask.assignedTo.email, updatedTask.assignedTo.name);
        }
        if (updatedTask.createdBy && updatedTask.createdBy.email) {
            recipients.set(updatedTask.createdBy.email, updatedTask.createdBy.name);
        }

        const updaterName = req.user.name || req.user.email || "A team member";

        // Build list of change descriptions
        const changeList = [];
        if (oldValues.title !== updatedTask.title) {
            changeList.push(`Title changed to "${updatedTask.title}"`);
        }
        if (oldValues.description !== updatedTask.description) {
            changeList.push(`Description updated to: "${updatedTask.description || '(none)'}"`);
        }
        if (oldValues.status !== updatedTask.status) {
            changeList.push(`Status changed from "${oldValues.status}" to "${updatedTask.status}"`);
        }
        if (oldValues.priority !== updatedTask.priority) {
            changeList.push(`Priority changed from "${oldValues.priority}" to "${updatedTask.priority}"`);
        }
        if (oldValues.dueDate !== (updatedTask.dueDate ? new Date(updatedTask.dueDate).toISOString().substring(0, 10) : null)) {
            changeList.push(`Due Date set to: ${updatedTask.dueDate ? new Date(updatedTask.dueDate).toLocaleDateString() : "None"}`);
        }
        if (assigneeChanged) {
            changeList.push(`Assigned to: ${updatedTask.assignedTo ? updatedTask.assignedTo.name : "Unassigned"}`);
        }

        // Send to every person involved with this task
        for (const [recipientEmail, recipientName] of recipients.entries()) {
            try {
                let subject = `[TaskFlow] Task Updated: "${updatedTask.title}"`;
                if (oldValues.status !== "completed" && updatedTask.status === "completed") {
                    subject = `[TaskFlow] Task Completed: "${updatedTask.title}"`;
                } else if (assigneeChanged && recipientEmail === updatedTask.assignedTo?.email) {
                    subject = `[TaskFlow] Task Assigned: "${updatedTask.title}"`;
                }

                await sendEmail({
                    to: recipientEmail,
                    subject,
                    html: taskUpdatedTemplate({
                        userName: recipientName,
                        taskTitle: updatedTask.title,
                        taskDescription: updatedTask.description,
                        projectName: updatedTask.project?.name || "Project",
                        updatedBy: updaterName,
                        status: updatedTask.status,
                        priority: updatedTask.priority,
                        dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate).toLocaleDateString() : null,
                        changes: changeList,
                    }),
                });
                console.log(`Update email sent successfully to: ${recipientEmail}`);
            } catch (emailErr) {
                console.error("Task update email failed:", emailErr.message);
            }
        }

        res.json({
            message: "Task updated successfully",
            task: updatedTask,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

// DELETE TASK
router.delete("/:id", jwtAuthMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const projectData = await Project.findById(task.project);

        const currentUserId = (req.user._id || req.user.id).toString();

        const currentUser = await User.findById(currentUserId);
        const userRole = currentUser?.role || req.user.role;
        const isAdmin = userRole === "admin";

        const isProjectOwner =
            projectData &&
            projectData.owner.toString() === currentUserId;

        const isCreator =
            task.createdBy.toString() === currentUserId;

        // Admin, Project Owner, or Task Creator can delete the task
        if (!isAdmin && !isProjectOwner && !isCreator) {
            return res.status(403).json({
                message: "You are not authorized to delete this task",
            });
        }

        await task.deleteOne();

        res.json({
            message: "Task deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

// MANUAL DUE DATE REMINDER
// Sends an immediate email reminder (Jira style)
router.post("/:id/remind", jwtAuthMiddleware, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id || req.user.id);
        const result = await sendManualTaskReminder(
            req.params.id,
            currentUser || req.user
        );

        res.json({
            message: `Reminder email successfully sent to ${result.recipients.join(", ")}`,
            ...result,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message || "Failed to send due date reminder",
        });
    }
});

// TRIGGER AUTOMATED DUE DATE & OVERDUE CHECKS
router.post("/run-due-checks", jwtAuthMiddleware, async (req, res) => {
    try {
        const result = await checkAndSendDueDateReminders();
        res.json({
            message: "Due date checks completed",
            result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

module.exports = router;
