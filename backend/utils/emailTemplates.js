/**
 * Modern, Enterprise-Grade Transactional Email Templates for TaskFlow
 * Optimized for both Desktop and Mobile views with spacious typography and breathing room.
 */

const FRONTEND_URL = process.env.FRONTEND_URL || "https://taskflow-eta-ten-87.vercel.app";

/**
 * Shared base email layout builder
 */
const buildEmailWrapper = ({
  headerTag = "NOTIFICATION",
  tagBg = "#e0e7ff",
  tagColor = "#4338ca",
  accentColor = "#4f46e5",
  recipientName = "Team Member",
  headline = "Task Update",
  leadText = "",
  contentHtml = "",
  ctaText = "Open in TaskFlow →",
  ctaUrl = FRONTEND_URL,
  secondaryCtaText = "",
  secondaryCtaUrl = "",
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
  <style type="text/css">
    /* Mobile-Specific Responsive Overrides (Keeps Desktop view identical) */
    @media only screen and (max-width: 600px) {
      .outer-wrap {
        padding: 12px 6px !important;
      }
      .card-wrap {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 10px !important;
      }
      .header-wrap {
        padding: 16px 14px 12px 14px !important;
      }
      .body-wrap {
        padding: 18px 16px 22px 16px !important;
      }
      .inner-box {
        padding: 16px 14px !important;
        margin: 14px 0 !important;
      }
      .brand-title {
        font-size: 17px !important;
      }
      .header-tag-badge {
        font-size: 10px !important;
        padding: 4px 8px !important;
        letter-spacing: 0.3px !important;
        white-space: nowrap !important;
      }
      .meta-pills-row {
        margin: 10px 0 14px 0 !important;
        line-height: 2.2 !important;
      }
      .meta-pill {
        display: inline-block !important;
        margin-bottom: 10px !important;
        margin-right: 8px !important;
        padding: 5px 11px !important;
        font-size: 11.5px !important;
        line-height: 1.4 !important;
      }
      .desc-box {
        padding: 14px !important;
        margin-top: 12px !important;
      }
      .desc-title {
        margin-bottom: 8px !important;
        font-size: 11px !important;
      }
      .desc-text {
        font-size: 14px !important;
        line-height: 1.75 !important;
      }
      .lead-text {
        font-size: 14px !important;
        line-height: 1.7 !important;
        margin-bottom: 18px !important;
      }
      .action-notice {
        margin-top: 22px !important;
        padding: 14px 16px !important;
        font-size: 13.5px !important;
        line-height: 1.65 !important;
      }
      .action-notice-text {
        font-size: 13.5px !important;
        line-height: 1.65 !important;
      }
      .footer-wrap {
        padding: 18px 14px !important;
      }
      .footer-text-1 {
        margin-bottom: 10px !important;
        line-height: 1.75 !important;
        font-size: 12px !important;
      }
      .footer-text-2 {
        line-height: 1.6 !important;
        font-size: 11.5px !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;-webkit-font-smoothing:antialiased;">
  <table class="outer-wrap" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:26px 14px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table class="card-wrap" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 16px rgba(15,23,42,0.06);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="5" style="background:linear-gradient(90deg, ${accentColor}, #818cf8);"></td>
          </tr>

          <!-- Header / Brand -->
          <tr>
            <td class="header-wrap" style="padding:22px 28px 18px 28px;border-bottom:1px solid #f1f5f9;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="display:inline-block;vertical-align:middle;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="background:${accentColor};width:32px;height:32px;border-radius:8px;text-align:center;color:#ffffff;font-weight:900;font-size:15px;line-height:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                            TF
                          </td>
                          <td style="padding-left:10px;">
                            <span class="brand-title" style="font-size:19px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;display:block;">TaskFlow</span>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                  <td align="right" style="vertical-align:middle;padding-left:12px;">
                    <span class="header-tag-badge" style="background-color:${tagBg};color:${tagColor};font-size:10.5px;font-weight:700;text-transform:uppercase;padding:4px 9px;border-radius:20px;letter-spacing:0.4px;display:inline-block;white-space:nowrap;">
                      ${headerTag}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td class="body-wrap" style="padding:24px 28px 28px 28px;">
              <h2 style="margin:0 0 10px 0;font-size:18px;font-weight:700;color:#0f172a;">
                Hello ${recipientName},
              </h2>

              ${leadText ? `<p class="lead-text" style="margin:0 0 18px 0;font-size:14px;color:#475569;line-height:1.65;">${leadText}</p>` : ""}

              ${contentHtml}

              <!-- CTA Button / Workspace Notice -->
              ${ctaUrl && !ctaUrl.includes("localhost") && !ctaUrl.includes("127.0.0.1") ? `
                <div style="margin-top:26px;text-align:center;">
                  <a href="${ctaUrl}" target="_blank" style="display:inline-block;background-color:${accentColor};color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 30px;border-radius:8px;box-shadow:0 3px 10px rgba(79,70,229,0.3);letter-spacing:0.2px;">
                    ${ctaText}
                  </a>
                  ${secondaryCtaUrl ? `
                    <div style="margin-top:14px;">
                      <a href="${secondaryCtaUrl}" target="_blank" style="display:inline-block;color:#4f46e5;text-decoration:none;font-size:13px;font-weight:600;padding:7px 18px;border:1px solid #c7d2fe;background-color:#eef2ff;border-radius:6px;">
                        ${secondaryCtaText || "View Task in TaskFlow →"}
                      </a>
                    </div>
                  ` : ""}
                </div>
              ` : `
                <div class="action-notice" style="margin-top:22px;padding:14px 18px;background-color:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;text-align:center;line-height:1.65;">
                  <span class="action-notice-text" style="font-size:13.5px;color:#475569;font-weight:600;display:inline-block;line-height:1.65;">
                    👉 Open your TaskFlow Workspace to view and update this task
                  </span>
                </div>
              `}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-wrap" style="background-color:#f8fafc;padding:20px 24px;border-top:1px solid #e2e8f0;text-align:center;">
              <p class="footer-text-1" style="margin:0 0 10px 0;font-size:12px;color:#94a3b8;line-height:1.75;">
                You received this notification from <strong style="color:#64748b;">TaskFlow</strong> because you are assigned to, created, or watching this task.
              </p>
              <p class="footer-text-2" style="margin:0;font-size:11.5px;color:#cbd5e1;line-height:1.6;">
                TaskFlow Workspace • Real-Time Project Management
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * 1. New Task Assigned Notification
 */
const taskAssignedTemplate = ({
  userName,
  taskTitle,
  projectName = "General",
  taskDescription = "",
  priority = "medium",
  dueDate = null,
  assignedBy = "A team member",
  taskUrl,
}) => {
  const contentHtml = `
    <div class="inner-box" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin:16px 0;">
      <div style="margin-bottom:12px;">
        <span style="display:block;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">PROJECT: ${projectName}</span>
        <h3 style="margin:0;font-size:18px;font-weight:800;color:#0f172a;line-height:1.35;">
          ${taskTitle}
        </h3>
      </div>

      <!-- Current Meta Pills with wrapping spacing -->
      <div class="meta-pills-row" style="margin:12px 0 16px 0;line-height:2.0;">
        <span class="meta-pill" style="background-color:#eef2ff;color:#4338ca;font-size:12px;font-weight:700;padding:5px 11px;border-radius:12px;display:inline-block;margin-right:8px;margin-bottom:10px;vertical-align:middle;line-height:1.4;">
          Status: To Do
        </span>
        <span class="meta-pill" style="background-color:#f1f5f9;color:#475569;font-size:12px;font-weight:600;padding:5px 11px;border-radius:12px;display:inline-block;margin-right:8px;margin-bottom:10px;vertical-align:middle;text-transform:capitalize;line-height:1.4;">
          Priority: ${priority}
        </span>
        ${dueDate ? `
          <span class="meta-pill" style="background-color:#f1f5f9;color:#475569;font-size:12px;font-weight:600;padding:5px 11px;border-radius:12px;display:inline-block;margin-right:8px;margin-bottom:10px;vertical-align:middle;line-height:1.4;">
            Due: ${dueDate}
          </span>
        ` : ""}
      </div>

      ${taskDescription ? `
        <div class="desc-box" style="background-color:#ffffff;border:1px solid #e2e8f0;border-left:3px solid #6366f1;border-radius:6px;padding:14px 16px;margin-top:10px;">
          <div class="desc-title" style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Task Description</div>
          <p class="desc-text" style="margin:0;font-size:14px;color:#334155;line-height:1.75;word-break:break-word;">
            ${taskDescription}
          </p>
        </div>
      ` : ""}
    </div>
  `;

  return buildEmailWrapper({
    headerTag: "TASK ASSIGNED",
    tagBg: "#e0e7ff",
    tagColor: "#4338ca",
    accentColor: "#4f46e5",
    recipientName: userName || "Team Member",
    headline: `New Task: ${taskTitle}`,
    leadText: `<strong>${assignedBy}</strong> assigned a new task to you in <strong>TaskFlow</strong>.`,
    contentHtml,
    ctaText: "View & Start Task →",
    ctaUrl: taskUrl || FRONTEND_URL,
  });
};

/**
 * 2. New Comment / Discussion Notification
 */
const commentNotificationTemplate = ({
  userName,
  taskTitle,
  projectName = "General",
  commentAuthor = "A team member",
  commentText,
  taskUrl,
}) => {
  const contentHtml = `
    <div class="inner-box" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin:16px 0;">
      <div style="margin-bottom:12px;">
        <span style="display:block;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">TASK DISCUSSION</span>
        <h3 style="margin:0;font-size:17px;font-weight:700;color:#0f172a;line-height:1.35;">
          ${taskTitle}
        </h3>
      </div>

      <!-- Comment Speech Bubble -->
      <div class="desc-box" style="background-color:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.03);margin-top:6px;">
        <div style="display:flex;align-items:center;margin-bottom:8px;">
          <strong style="font-size:13px;color:#0f172a;">💬 ${commentAuthor} wrote:</strong>
        </div>
        <p class="desc-text" style="margin:0;font-size:14px;color:#334155;line-height:1.65;white-space:pre-wrap;word-break:break-word;">
          "${commentText}"
        </p>
      </div>
    </div>
  `;

  return buildEmailWrapper({
    headerTag: "NEW COMMENT",
    tagBg: "#e0e7ff",
    tagColor: "#3730a3",
    accentColor: "#6366f1",
    recipientName: userName || "Team Member",
    headline: `New comment on: ${taskTitle}`,
    leadText: `<strong>${commentAuthor}</strong> added a comment to your task.`,
    contentHtml,
    ctaText: "Reply to Comment →",
    ctaUrl: taskUrl || FRONTEND_URL,
  });
};

/**
 * 3. Task Completed Notification
 */
const taskCompletedTemplate = ({
  userName,
  taskTitle,
  projectName = "General",
  completedBy = "The assignee",
  taskUrl,
}) => {
  const contentHtml = `
    <div class="inner-box" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:16px 0;text-align:center;">
      <div style="width:44px;height:44px;background-color:#16a34a;border-radius:50%;color:#ffffff;font-size:22px;line-height:44px;margin:0 auto 12px auto;text-align:center;">
        ✓
      </div>
      <span style="background-color:#dcfce7;color:#15803d;font-size:11px;font-weight:700;padding:4px 10px;border-radius:12px;text-transform:uppercase;display:inline-block;margin-bottom:8px;">
        Status: Completed
      </span>
      <h3 style="margin:6px 0;font-size:18px;font-weight:800;color:#14532d;line-height:1.35;">
        ${taskTitle}
      </h3>
      <p style="margin:8px 0 0 0;font-size:13.5px;color:#15803d;line-height:1.5;">
        Project: <strong>${projectName}</strong> • Completed by <strong>${completedBy}</strong>
      </p>
    </div>
  `;

  return buildEmailWrapper({
    headerTag: "TASK COMPLETED",
    tagBg: "#dcfce7",
    tagColor: "#15803d",
    accentColor: "#16a34a",
    recipientName: userName || "Team Member",
    headline: `Task Completed: ${taskTitle}`,
    leadText: "Great news! A task you are watching has been marked as <strong>Completed</strong>.",
    contentHtml,
    ctaText: "View Completed Task →",
    ctaUrl: taskUrl || FRONTEND_URL,
  });
};

/**
 * 4. Task Updated Notification
 */
const taskUpdatedTemplate = ({
  userName,
  taskTitle,
  projectName = "General",
  taskDescription = "",
  updatedBy = "A user",
  status = "todo",
  priority = "medium",
  dueDate = null,
  changes = [],
  taskUrl,
}) => {
  const statusStyles = {
    todo: { bg: "#eef2ff", text: "#4338ca", label: "To Do" },
    "in-progress": { bg: "#fef3c7", text: "#b45309", label: "In Progress" },
    completed: { bg: "#dcfce7", text: "#15803d", label: "Completed" },
  };

  const sStyle = statusStyles[status] || statusStyles.todo;

  const contentHtml = `
    <div class="inner-box" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin:16px 0;">
      <div style="margin-bottom:12px;">
        <span style="display:block;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">PROJECT: ${projectName}</span>
        <h3 style="margin:0;font-size:18px;font-weight:800;color:#0f172a;line-height:1.35;">
          ${taskTitle}
        </h3>
      </div>

      <!-- Current Meta Pills with wrapping spacing -->
      <div class="meta-pills-row" style="margin:12px 0 16px 0;line-height:2.0;">
        <span class="meta-pill" style="background-color:${sStyle.bg};color:${sStyle.text};font-size:12px;font-weight:700;padding:5px 11px;border-radius:12px;display:inline-block;margin-right:8px;margin-bottom:10px;vertical-align:middle;line-height:1.4;">
          ${sStyle.label}
        </span>
        <span class="meta-pill" style="background-color:#f1f5f9;color:#475569;font-size:12px;font-weight:600;padding:5px 11px;border-radius:12px;display:inline-block;margin-right:8px;margin-bottom:10px;vertical-align:middle;text-transform:capitalize;line-height:1.4;">
          Priority: ${priority}
        </span>
        ${dueDate ? `
          <span class="meta-pill" style="background-color:#f1f5f9;color:#475569;font-size:12px;font-weight:600;padding:5px 11px;border-radius:12px;display:inline-block;margin-right:8px;margin-bottom:10px;vertical-align:middle;line-height:1.4;">
            📅 ${dueDate}
          </span>
        ` : ""}
      </div>

      ${taskDescription ? `
        <div class="desc-box" style="background-color:#ffffff;border:1px solid #e2e8f0;border-left:3px solid #6366f1;border-radius:6px;padding:14px 16px;margin-bottom:14px;">
          <div class="desc-title" style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Task Description</div>
          <p class="desc-text" style="margin:0;font-size:14px;color:#334155;line-height:1.75;word-break:break-word;">${taskDescription}</p>
        </div>
      ` : ""}

      ${changes && changes.length > 0 ? `
        <div class="desc-box" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;">
          <strong style="font-size:12px;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:8px;">
            Audit Changes Made:
          </strong>
          <ul style="margin:0;padding-left:18px;font-size:13.5px;color:#334155;line-height:1.7;">
            ${changes.map(c => `<li>${c}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </div>
  `;

  return buildEmailWrapper({
    headerTag: "TASK UPDATED",
    tagBg: "#e0e7ff",
    tagColor: "#4338ca",
    accentColor: "#4f46e5",
    recipientName: userName || "Team Member",
    headline: `Task Updated: ${taskTitle}`,
    leadText: `<strong>${updatedBy}</strong> made changes to this task.`,
    contentHtml,
    ctaText: "Review Changes in TaskFlow →",
    ctaUrl: taskUrl || FRONTEND_URL,
  });
};

/**
 * 5. Task Due Today Reminder
 */
const taskDueTodayTemplate = ({
  userName,
  taskTitle,
  projectName = "General",
  taskDescription = "",
  dueDate,
  daysUntilDue = 0,
  taskUrl,
}) => {
  let badgeLabel = `⏰ Due Today (${dueDate})`;
  let headerTag = "DEADLINE TODAY";
  let headline = `Due Today: ${taskTitle}`;
  let leadText = "This is a friendly reminder that your assigned task reaches its deadline <strong>Today</strong>.";

  if (daysUntilDue === 1) {
    badgeLabel = `📅 Due Tomorrow (${dueDate})`;
    headerTag = "DUE TOMORROW";
    headline = `Due Tomorrow: ${taskTitle}`;
    leadText = `This is a friendly reminder that your assigned task is due <strong>Tomorrow (${dueDate})</strong>.`;
  } else if (daysUntilDue > 1) {
    badgeLabel = `📅 Due in ${daysUntilDue} Days (${dueDate})`;
    headerTag = "UPCOMING DEADLINE";
    headline = `Upcoming Deadline: ${taskTitle}`;
    leadText = `This is a friendly reminder that your assigned task is due on <strong>${dueDate}</strong> (in ${daysUntilDue} days).`;
  }

  const contentHtml = `
    <div class="inner-box" style="background-color:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:10px;padding:18px 20px;margin:16px 0;">
      <div style="margin-bottom:12px;">
        <span class="meta-pill" style="background-color:#fef3c7;color:#b45309;font-size:11px;font-weight:700;padding:4px 9px;border-radius:10px;text-transform:uppercase;display:inline-block;margin-bottom:8px;">
          ${badgeLabel}
        </span>
        <h3 style="margin:4px 0 6px 0;font-size:18px;font-weight:800;color:#92400e;line-height:1.35;">
          ${taskTitle}
        </h3>
        <span style="display:block;font-size:12px;color:#b45309;font-weight:600;margin-top:4px;">Project: ${projectName}</span>
      </div>

      ${taskDescription ? `
        <div class="desc-box" style="background-color:#ffffff;border:1px solid #fde68a;border-radius:6px;padding:12px 14px;margin-top:10px;">
          <div style="font-size:11px;font-weight:700;color:#b45309;text-transform:uppercase;margin-bottom:4px;">Description</div>
          <p class="desc-text" style="margin:0;font-size:13.5px;color:#78350f;line-height:1.6;word-break:break-word;">${taskDescription}</p>
        </div>
      ` : ""}

      <p style="margin:14px 0 0 0;font-size:13px;color:#92400e;line-height:1.6;">
        💡 Please make sure to submit or update your task status in TaskFlow.
      </p>
    </div>
  `;

  return buildEmailWrapper({
    headerTag,
    tagBg: "#fef3c7",
    tagColor: "#b45309",
    accentColor: "#f59e0b",
    recipientName: userName || "Team Member",
    headline,
    leadText,
    contentHtml,
    ctaText: "Open Task in TaskFlow →",
    ctaUrl: taskUrl || FRONTEND_URL,
  });
};

/**
 * 6. Task Overdue Escalation (Optional / Manual)
 */
const taskOverdueTemplate = ({
  userName,
  role = "assignee",
  taskTitle,
  projectName = "General",
  taskDescription = "",
  dueDate,
  daysOverdue = 1,
  assigneeName = "Unassigned",
}) => {
  const isCreator = role === "creator";

  const contentHtml = `
    <div class="inner-box" style="background-color:#fff1f2;border:1px solid #fecdd3;border-left:4px solid #ef4444;border-radius:10px;padding:18px 20px;margin:16px 0;">
      <div style="margin-bottom:12px;">
        <span class="meta-pill" style="background-color:#fee2e2;color:#b91c1c;font-size:11px;font-weight:700;padding:4px 9px;border-radius:10px;text-transform:uppercase;display:inline-block;margin-bottom:8px;">
          ⚠️ ${daysOverdue} Day${daysOverdue === 1 ? "" : "s"} Overdue
        </span>
        <h3 style="margin:4px 0 6px 0;font-size:18px;font-weight:800;color:#9f1239;line-height:1.35;">
          ${taskTitle}
        </h3>
        <div style="font-size:12px;color:#9f1239;margin-top:6px;line-height:1.5;">
          Project: <strong>${projectName}</strong> • Assignee: <strong>${assigneeName}</strong> • Original Due: <strong>${dueDate}</strong>
        </div>
      </div>

      ${taskDescription ? `
        <div class="desc-box" style="background-color:#ffffff;border:1px solid #fecdd3;border-radius:6px;padding:12px 14px;margin-top:10px;">
          <p class="desc-text" style="margin:0;font-size:13.5px;color:#881337;line-height:1.6;word-break:break-word;">${taskDescription}</p>
        </div>
      ` : ""}
    </div>
  `;

  return buildEmailWrapper({
    headerTag: "OVERDUE ALERT",
    tagBg: "#fee2e2",
    tagColor: "#b91c1c",
    accentColor: "#ef4444",
    recipientName: userName || "Team Member",
    headline: `Overdue Task: ${taskTitle}`,
    leadText: isCreator
      ? `A task you created has missed its deadline by <strong>${daysOverdue} day${daysOverdue === 1 ? "" : "s"}</strong>.`
      : `Your assigned task missed its deadline by <strong>${daysOverdue} day${daysOverdue === 1 ? "" : "s"}</strong>. Please submit your update immediately.`,
    contentHtml,
    ctaText: "Review Overdue Task →",
  });
};

/**
 * 7. New Attachment Uploaded Notification
 */
const attachmentUploadedTemplate = ({
  userName,
  taskTitle,
  projectName = "General",
  fileName,
  fileSize = "",
  uploadedBy = "A team member",
  downloadUrl,
  taskUrl,
}) => {
  const contentHtml = `
    <div class="inner-box" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #6366f1;border-radius:10px;padding:18px 20px;margin:16px 0;">
      <div style="margin-bottom:12px;">
        <span style="display:block;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">PROJECT: ${projectName}</span>
        <h3 style="margin:0;font-size:18px;font-weight:800;color:#0f172a;line-height:1.35;">
          ${taskTitle}
        </h3>
      </div>

      <div class="desc-box" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;margin:14px 0;">
        <div style="font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
          ATTACHED FILE DETAILS
        </div>
        <p style="margin:0 0 6px 0;font-size:15px;font-weight:700;color:#0f172a;word-break:break-all;">
          📎 ${fileName}
        </p>
        <div style="font-size:12.5px;color:#64748b;line-height:1.5;">
          Uploaded by: <strong>${uploadedBy}</strong> ${fileSize ? `• Size: <strong>${fileSize}</strong>` : ""}
        </div>
      </div>

      <p style="margin:12px 0 0 0;font-size:13px;color:#475569;line-height:1.6;">
        💡 You can directly download the file below or view it inside your TaskFlow workspace.
      </p>
    </div>
  `;

  return buildEmailWrapper({
    headerTag: "ATTACHMENT UPLOADED",
    tagBg: "#e0e7ff",
    tagColor: "#4338ca",
    accentColor: "#6366f1",
    recipientName: userName || "Team Member",
    headline: `New Attachment on: ${taskTitle}`,
    leadText: `<strong>${uploadedBy}</strong> uploaded a new file to this task.`,
    contentHtml,
    ctaText: "View & Download File →",
    ctaUrl: downloadUrl || FRONTEND_URL,
    secondaryCtaText: "Open Task in TaskFlow →",
    secondaryCtaUrl: taskUrl || FRONTEND_URL,
  });
};

module.exports = {
  taskAssignedTemplate,
  commentNotificationTemplate,
  taskCompletedTemplate,
  taskUpdatedTemplate,
  taskDueTodayTemplate,
  taskOverdueTemplate,
  attachmentUploadedTemplate,
};
