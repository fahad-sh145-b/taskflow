const Task = require("../models/task");
const Activity = require("../models/activity");
const { sendEmail } = require("./emailService");
const {
  taskDueTodayTemplate,
  taskOverdueTemplate,
} = require("./emailTemplates");

/**
 * Checks if a date was already on the same calendar day (UTC/Local)
 */
const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Formats a date nicely: e.g. "Nov 21, 2026"
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? "N/A"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/**
 * Automated due date & overdue scanner
 * Intended to run on a schedule (e.g. daily or hourly)
 */
const checkAndSendDueDateReminders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all incomplete tasks with a due date
    const tasks = await Task.find({
      status: { $ne: "completed" },
      dueDate: { $ne: null },
    })
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    let dueTodaySent = 0;
    let overdueSent = 0;

    for (const task of tasks) {
      if (!task.dueDate) continue;

      const target = new Date(task.dueDate);
      target.setHours(0, 0, 0, 0);

      const diffMs = target.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      const formattedDue = formatDate(task.dueDate);
      const projectName = task.project?.name || "General";

      // 1. Task is Due Today (diffDays === 0)
      if (diffDays === 0) {
        if (!task.lastDueReminderSentAt || !isSameDay(task.lastDueReminderSentAt, today)) {
          // Send to ASSIGNEE ONLY
          if (task.assignedTo?.email) {
            const html = taskDueTodayTemplate({
              userName: task.assignedTo.name || "Team Member",
              taskTitle: task.title,
              projectName,
              taskDescription: task.description,
              dueDate: formattedDue,
            });

            await sendEmail({
              to: task.assignedTo.email,
              subject: `[TaskFlow] Reminder: Task "${task.title}" is due today!`,
              html,
            });

            // Log activity
            await Activity.create({
              task: task._id,
              user: task.createdBy?._id || task.assignedTo._id,
              action: `Automated due today reminder sent to ${task.assignedTo.name} (${task.assignedTo.email})`,
            });

            task.lastDueReminderSentAt = new Date();
            await task.save();
            dueTodaySent++;
            console.log(`[DueDateService] Due Today reminder sent to ${task.assignedTo.email} for task "${task.title}"`);
          }
        }
      }
      // 2. Overdue tasks (diffDays < 0): NO emails sent per configuration
    }

    return {
      success: true,
      dueTodaySent,
      overdueSent: 0,
      totalProcessed: tasks.length,
    };
  } catch (error) {
    console.error("[DueDateService] Error running automated checks:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Manual 1-click trigger: Sends reminder immediately on demand
 */
const sendManualTaskReminder = async (taskId, triggeredBy) => {
  const task = await Task.findById(taskId)
    .populate("project", "name")
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.status === "completed") {
    throw new Error("Task is already marked as completed");
  }

  if (!task.assignedTo?.email) {
    throw new Error("Cannot send reminder: Task has no assigned member");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formattedDue = formatDate(task.dueDate);
  const projectName = task.project?.name || "General";

  let isOverdue = false;
  let daysAgo = 0;

  if (task.dueDate) {
    const target = new Date(task.dueDate);
    target.setHours(0, 0, 0, 0);
    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      isOverdue = true;
      daysAgo = Math.abs(diffDays);
    }
  }

  const sentRecipients = [];

  if (isOverdue) {
    throw new Error("Reminder emails are disabled for overdue tasks. Reminders are only sent for tasks on their due date.");
  }

  // Due today or upcoming reminder: Send to Assignee
  const html = taskDueTodayTemplate({
    userName: task.assignedTo.name,
    taskTitle: task.title,
    projectName,
    taskDescription: task.description,
    dueDate: formattedDue,
  });

  await sendEmail({
    to: task.assignedTo.email,
    subject: `[TaskFlow] Reminder: Task "${task.title}" (${task.dueDate ? `Due ${formattedDue}` : "Follow Up"})`,
    html,
  });
  sentRecipients.push(task.assignedTo.email);

  task.lastDueReminderSentAt = new Date();
  await task.save();

  // Record audit activity
  await Activity.create({
    task: task._id,
    user: triggeredBy._id || triggeredBy.id,
    action: `Manual due date reminder email sent to ${sentRecipients.join(", ")} by ${triggeredBy.name || "User"}`,
  });

  return {
    success: true,
    task,
    recipients: sentRecipients,
    isOverdue,
    daysAgo,
  };
};

module.exports = {
  checkAndSendDueDateReminders,
  sendManualTaskReminder,
};
