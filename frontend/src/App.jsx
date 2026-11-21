import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
    LayoutDashboard,
    FolderKanban,
    ListTodo,
    Plus,
    LogOut,
    Trash2,
    MessageSquare,
    History,
    X,
    Send,
    Clock,
    Paperclip,
    Download,
    FileText,
    Upload,
    UserPlus,
    Mail,
    Users,
    ShieldCheck,
    Briefcase,
    Search,
    CheckCircle2,
    ArrowRight,
    Pencil,
    Kanban,
    GripVertical,
    Calendar,
    Filter,
    UserCheck,
    AlertTriangle,
    SlidersHorizontal,
    Bell,
    BellRing,
    ArrowLeft,
    Folder,
    BarChart3,
    Layers,
    ExternalLink,
    TrendingUp,
    PieChart,
    Activity,
    Table
} from "lucide-react";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://taskflow-xyek.onrender.com/api"
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

const ALLOWED_EMAILS = [
    "shaikhbashiruddinmohdhajishaik@gmail.com",
    "bashir.runtime@gmail.com"
];

export default function App() {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("user");
            if (!saved || saved === "undefined" || saved === "null") return null;
            const parsed = JSON.parse(saved);
            const userEmail = parsed?.email?.toLowerCase();
            if (userEmail && !ALLOWED_EMAILS.includes(userEmail)) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                return null;
            }
            return parsed;
        } catch (e) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            return null;
        }
    });

    const [mode, setMode] = useState("login");
    const [activeTab, setActiveTab] = useState("dashboard");

    const [auth, setAuth] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);

    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");

    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskProject, setTaskProject] = useState("");
    const [taskPriority, setTaskPriority] = useState("medium");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [taskAssignedTo, setTaskAssignedTo] = useState("");

    // Enter new email states
    const [isAddingNewEmail, setIsAddingNewEmail] = useState(false);
    const [newAssigneeName, setNewAssigneeName] = useState("");
    const [newAssigneeEmail, setNewAssigneeEmail] = useState("");

    // Team directory states
    const [teamFilter, setTeamFilter] = useState("all"); // "all" | "admin" | "owner" | "member"
    const [teamSearch, setTeamSearch] = useState("");

    // Task Filters & Search states (Step 3)
    const [taskProjectFilter, setTaskProjectFilter] = useState("all");
    const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");
    const [taskAssigneeFilter, setTaskAssigneeFilter] = useState("all"); // "all" | "me" | "unassigned" | userId
    const [taskStatusFilter, setTaskStatusFilter] = useState("all"); // "all" | "todo" | "in-progress" | "completed"
    const [taskQuickFilter, setTaskQuickFilter] = useState("all"); // "all" | "my-tasks" | "high-priority" | "overdue"
    const [taskSearch, setTaskSearch] = useState("");
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [dragOverCol, setDragOverCol] = useState(null); // "todo" | "in-progress" | "completed" | null

    // Quick Member modal states
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [quickUserName, setQuickUserName] = useState("");
    const [quickUserEmail, setQuickUserEmail] = useState("");

    // Pivot Table & Analytics Graph View States
    const [pivotDimension, setPivotDimension] = useState("project"); // "project" | "assignee" | "priority"
    const [analyticsTab, setAnalyticsTab] = useState("donut"); // "donut" | "barchart"

    // Task Editing states
    const [editingTask, setEditingTask] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPriority, setEditPriority] = useState("medium");
    const [editStatus, setEditStatus] = useState("todo");
    const [editDueDate, setEditDueDate] = useState("");
    const [editAssignedTo, setEditAssignedTo] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);

    const [message, setMessage] = useState("");

    // Task details modal state
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskComments, setTaskComments] = useState([]);
    const [taskActivities, setTaskActivities] = useState([]);
    const [taskAttachments, setTaskAttachments] = useState([]);
    const [newCommentText, setNewCommentText] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [sendingReminderId, setSendingReminderId] = useState(null);

    // Project Detail View states (Step 5)
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [projectDetailViewMode, setProjectDetailViewMode] = useState("list"); // "list" | "kanban"
    const [projectTaskFilterStatus, setProjectTaskFilterStatus] = useState("all");
    const [projectTaskFilterPriority, setProjectTaskFilterPriority] = useState("all");
    const [projectTaskSearch, setProjectTaskSearch] = useState("");
    const [showAddProjectTaskModal, setShowAddProjectTaskModal] = useState(false);
    const [newProjectTaskTitle, setNewProjectTaskTitle] = useState("");
    const [newProjectTaskDesc, setNewProjectTaskDesc] = useState("");
    const [newProjectTaskPriority, setNewProjectTaskPriority] = useState("medium");
    const [newProjectTaskAssignee, setNewProjectTaskAssignee] = useState("");
    const [newProjectTaskDueDate, setNewProjectTaskDueDate] = useState("");
    const [creatingProjectTask, setCreatingProjectTask] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [editProjectName, setEditProjectName] = useState("");
    const [editProjectDescription, setEditProjectDescription] = useState("");
    const [savingProjectEdit, setSavingProjectEdit] = useState(false);
    const [modalTab, setModalTab] = useState("activity"); // "activity" | "comments" | "attachments"

    const fileInputRef = useRef(null);

    const loadData = async () => {
        try {
            const projectResponse = await api.get("/projects");
            if (Array.isArray(projectResponse.data)) {
                setProjects(projectResponse.data);
            }
        } catch (error) {
            console.error("Failed to load projects:", error);
        }

        try {
            const taskResponse = await api.get("/tasks");
            if (Array.isArray(taskResponse.data)) {
                setTasks(taskResponse.data);
            }
        } catch (error) {
            console.error("Failed to load tasks:", error);
        }

        try {
            const userResponse = await api.get("/user");
            if (Array.isArray(userResponse.data)) {
                setUsers(userResponse.data);
            }
        } catch (error) {
            console.error("Failed to load users:", error);
        }
    };

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage("");
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleAuth = async (e) => {
        e.preventDefault();

        const inputEmail = auth.email.trim().toLowerCase();
        if (mode === "login" && !ALLOWED_EMAILS.includes(inputEmail)) {
            setMessage("Access restricted: Only authorized accounts (shaikhbashiruddinmohdhajishaik@gmail.com or bashir.runtime@gmail.com) can log in to the portal.");
            return;
        }

        try {
            const response = await api.post(
                `/auth/${mode}`,
                {
                    ...auth,
                    email: inputEmail
                }
            );

            const loggedInUser = response.data.user || response.data.response;
            const userEmail = loggedInUser?.email?.toLowerCase();
            if (mode === "login" && (!userEmail || !ALLOWED_EMAILS.includes(userEmail))) {
                setMessage("Access restricted: This account is not authorized for portal login.");
                return;
            }

            localStorage.setItem("token", response.data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(loggedInUser)
            );

            setUser(loggedInUser);
            setMessage("");

        } catch (error) {
            setMessage(error.response?.data?.message || "Auth failed");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setProjects([]);
        setTasks([]);
        setUsers([]);
        setSelectedTask(null);
    };

    const createProject = async (e) => {
        e.preventDefault();

        try {
            await api.post("/projects", {
                name: projectName,
                description: projectDescription
            });

            setProjectName("");
            setProjectDescription("");

            await loadData();

            setMessage("Project created successfully");

        } catch (error) {
            setMessage(error.response?.data?.message || "Project creation failed");
        }
    };

    const createTask = async (e) => {
        e.preventDefault();

        try {
            let assigneePayload = taskAssignedTo || null;
            let assigneeNamePayload = "";

            if (isAddingNewEmail && newAssigneeEmail.trim()) {
                assigneePayload = newAssigneeEmail.trim().toLowerCase();
                assigneeNamePayload = newAssigneeName.trim();
            }

            await api.post("/tasks", {
                title: taskTitle,
                description: taskDescription,
                project: taskProject,
                priority: taskPriority,
                dueDate: taskDueDate || null,
                assignedTo: assigneePayload,
                assignedToName: assigneeNamePayload
            });

            setTaskTitle("");
            setTaskDescription("");
            setTaskDueDate("");
            setTaskAssignedTo("");
            setNewAssigneeName("");
            setNewAssigneeEmail("");
            setIsAddingNewEmail(false);

            await loadData();

            setMessage("Task created successfully & email sent!");

        } catch (error) {
            setMessage(error.response?.data?.message || "Task creation failed");
        }
    };

    const handleQuickAddUser = async (e) => {
        e.preventDefault();
        if (!quickUserEmail.trim()) return;

        try {
            const res = await api.post("/user/add", {
                name: quickUserName.trim(),
                email: quickUserEmail.trim().toLowerCase()
            });

            await loadData();
            setMessage(res.data?.message || "Member added successfully!");
            setQuickUserName("");
            setQuickUserEmail("");
            setShowAddUserModal(false);
            if (res.data?.user?._id) {
                setTaskAssignedTo(res.data.user._id);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to add member");
        }
    };

    const getOwnedProjects = (userId) => {
        return projects.filter(p => {
            if (!p.owner) return false;
            if (typeof p.owner === "object") {
                return String(p.owner._id) === String(userId);
            }
            return String(p.owner) === String(userId);
        });
    };

    const getUserTasks = (userId, userEmail) => {
        return tasks.filter(t => {
            if (!t.assignedTo) return false;
            if (typeof t.assignedTo === "object") {
                return String(t.assignedTo._id) === String(userId) || (userEmail && t.assignedTo.email === userEmail);
            }
            return String(t.assignedTo) === String(userId);
        });
    };

    const handleAssignTaskToUser = (userId) => {
        setTaskAssignedTo(userId);
        setActiveTab("tasks");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteMember = async (targetUser) => {
        if (targetUser._id === user._id || targetUser.email === user.email) {
            alert("You cannot remove your own logged-in account.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to remove ${targetUser.name} (${targetUser.email}) from the team?`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/user/${targetUser._id}`);
            await loadData();
            setMessage(`Member "${targetUser.name}" removed successfully.`);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to remove member.");
        }
    };

    const openEditTaskModal = (task) => {
        setEditingTask(task);
        setEditTitle(task.title || "");
        setEditDescription(task.description || "");
        setEditPriority(task.priority || "medium");
        setEditStatus(task.status || "todo");
        setEditDueDate(task.dueDate ? task.dueDate.substring(0, 10) : "");
        setEditAssignedTo(task.assignedTo?._id || task.assignedTo || "");
    };

    const closeEditTaskModal = () => {
        setEditingTask(null);
        setSavingEdit(false);
    };

    const handleSaveTaskEdit = async (e) => {
        e.preventDefault();
        if (!editingTask) return;

        setSavingEdit(true);
        try {
            await api.put(`/tasks/${editingTask._id}`, {
                title: editTitle,
                description: editDescription,
                priority: editPriority,
                status: editStatus,
                dueDate: editDueDate || null,
                assignedTo: editAssignedTo || null
            });

            await loadData();
            setMessage(`Task "${editTitle}" updated successfully!`);
            closeEditTaskModal();

            if (selectedTask && selectedTask._id === editingTask._id) {
                const taskRes = await api.get(`/tasks`);
                const refreshed = taskRes.data.find(t => t._id === editingTask._id);
                if (refreshed) setSelectedTask(refreshed);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to update task.");
        } finally {
            setSavingEdit(false);
        }
    };

    const updateTask = async (id, status) => {
        try {
            await api.put(`/tasks/${id}`, {
                status
            });

            await loadData();

            if (selectedTask && selectedTask._id === id) {
                const actRes = await api.get(`/activities/${id}`).catch(() => ({ data: [] }));
                setTaskActivities(actRes.data || []);
            }

        } catch (error) {
            setMessage(error.response?.data?.message || "Update failed");
        }
    };

    const STATUS_LABELS = {
        "todo": "To Do",
        "in-progress": "In Progress",
        "completed": "Completed"
    };

    const handleDragStart = (e, task) => {
        e.dataTransfer.setData("text/plain", task._id);
        e.dataTransfer.effectAllowed = "move";
        setDraggedTaskId(task._id);
    };

    const handleDragEnd = () => {
        setDraggedTaskId(null);
        setDragOverCol(null);
    };

    const handleDragOver = (e, colKey) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverCol !== colKey) {
            setDragOverCol(colKey);
        }
    };

    const handleDragLeave = (e, colKey) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setDragOverCol(null);
    };

    const handleDrop = async (e, targetStatus) => {
        e.preventDefault();
        setDragOverCol(null);
        const taskId = e.dataTransfer?.getData("text/plain") || draggedTaskId;
        setDraggedTaskId(null);

        if (!taskId) return;

        const currentTask = tasks.find(t => t._id === taskId);
        if (!currentTask || currentTask.status === targetStatus) return;

        // Optimistic UI update
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: targetStatus } : t));

        try {
            await api.put(`/tasks/${taskId}`, { status: targetStatus });
            setMessage(`Task "${currentTask.title}" moved to ${STATUS_LABELS[targetStatus] || targetStatus}!`);
            await loadData();
            if (selectedTask && selectedTask._id === taskId) {
                const actRes = await api.get(`/activities/${taskId}`).catch(() => ({ data: [] }));
                setTaskActivities(actRes.data || []);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to update task status.");
            await loadData();
        }
    };

    const quickMoveTask = async (task, targetStatus) => {
        if (!task || task.status === targetStatus) return;

        setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: targetStatus } : t));

        try {
            await api.put(`/tasks/${task._id}`, { status: targetStatus });
            setMessage(`Task "${task.title}" moved to ${STATUS_LABELS[targetStatus] || targetStatus}!`);
            await loadData();
            if (selectedTask && selectedTask._id === task._id) {
                const actRes = await api.get(`/activities/${task._id}`).catch(() => ({ data: [] }));
                setTaskActivities(actRes.data || []);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to move task.");
            await loadData();
        }
    };

    const getDueDateStatus = (dateStr, status) => {
        if (!dateStr) return { type: "none", label: "No deadline", shortLabel: "No date", badgeClass: "due-none", isOverdue: false };

        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return { type: "none", label: "No deadline", shortLabel: "No date", badgeClass: "due-none", isOverdue: false };

        const formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        if (status === "completed") {
            return {
                type: "completed",
                label: `Completed (${formattedDate})`,
                shortLabel: formattedDate,
                badgeClass: "due-completed",
                isOverdue: false,
                diffDays: null
            };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diffMs = target.getTime() - today.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            const daysAgo = Math.abs(diffDays);
            return {
                type: "overdue",
                label: `Overdue by ${daysAgo} ${daysAgo === 1 ? "day" : "days"} (${formattedDate})`,
                shortLabel: `${daysAgo}d overdue`,
                badgeClass: "due-overdue",
                isOverdue: true,
                diffDays
            };
        } else if (diffDays === 0) {
            return {
                type: "today",
                label: `Due Today! (${formattedDate})`,
                shortLabel: "Due Today",
                badgeClass: "due-today",
                isOverdue: false,
                diffDays: 0
            };
        } else if (diffDays === 1) {
            return {
                type: "tomorrow",
                label: `Due Tomorrow (${formattedDate})`,
                shortLabel: "Tomorrow",
                badgeClass: "due-soon",
                isOverdue: false,
                diffDays: 1
            };
        } else if (diffDays <= 3) {
            return {
                type: "soon",
                label: `Due in ${diffDays} days (${formattedDate})`,
                shortLabel: `In ${diffDays}d`,
                badgeClass: "due-soon",
                isOverdue: false,
                diffDays
            };
        } else {
            return {
                type: "future",
                label: `Due ${formattedDate}`,
                shortLabel: formattedDate,
                badgeClass: "due-normal",
                isOverdue: false,
                diffDays
            };
        }
    };

    const formatDueDate = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const isTaskOverdue = (dateStr, status) => {
        return getDueDateStatus(dateStr, status).isOverdue;
    };

    const deleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);

            if (selectedTask && selectedTask._id === id) {
                closeTaskModal();
            }

            await loadData();

        } catch (error) {
            setMessage(error.response?.data?.message || "Delete failed");
        }
    };

    const deleteProject = async (id) => {
        try {
            await api.delete(`/projects/${id}`);
            if (selectedProjectId === id) {
                setSelectedProjectId(null);
            }
            await loadData();
            setMessage("Project and its tasks deleted successfully");
        } catch (error) {
            setMessage(error.response?.data?.message || "Delete failed");
        }
    };

    const handleOpenEditProjectModal = (proj) => {
        setEditingProject(proj);
        setEditProjectName(proj.name);
        setEditProjectDescription(proj.description || "");
    };

    const handleSaveProjectEdit = async (e) => {
        e.preventDefault();
        if (!editingProject || !editProjectName.trim()) return;

        try {
            setSavingProjectEdit(true);
            await api.put(`/projects/${editingProject._id}`, {
                name: editProjectName.trim(),
                description: editProjectDescription.trim()
            });

            await loadData();
            setEditingProject(null);
            setMessage("Project updated successfully!");
        } catch (error) {
            setMessage(error.response?.data?.message || "Project update failed");
        } finally {
            setSavingProjectEdit(false);
        }
    };

    const canManageProject = (proj) => {
        if (!user || !proj) return false;
        const currentUserId = (user._id || user.id)?.toString();
        const ownerId = (proj.owner?._id || proj.owner)?.toString();
        return user.role === "admin" || (ownerId && ownerId === currentUserId);
    };

    const handleCreateTaskForProject = async (e) => {
        e.preventDefault();
        if (!newProjectTaskTitle.trim() || !selectedProjectId) return;

        try {
            setCreatingProjectTask(true);
            await api.post("/tasks", {
                title: newProjectTaskTitle.trim(),
                description: newProjectTaskDesc.trim(),
                project: selectedProjectId,
                priority: newProjectTaskPriority,
                dueDate: newProjectTaskDueDate || null,
                assignedTo: newProjectTaskAssignee || null
            });

            setNewProjectTaskTitle("");
            setNewProjectTaskDesc("");
            setNewProjectTaskPriority("medium");
            setNewProjectTaskAssignee("");
            setNewProjectTaskDueDate("");
            setShowAddProjectTaskModal(false);
            await loadData();
            setMessage("Task added to project successfully!");
        } catch (err) {
            setMessage(err.response?.data?.message || "Failed to create task");
        } finally {
            setCreatingProjectTask(false);
        }
    };

    const openTaskModal = async (task) => {
        setSelectedTask(task);
        setModalTab("activity");
        setLoadingDetails(true);

        try {
            const [commRes, actRes, attRes] = await Promise.all([
                api.get(`/comments/${task._id}`).catch(() => ({ data: [] })),
                api.get(`/activities/${task._id}`).catch(() => ({ data: [] })),
                api.get(`/attachments/${task._id}`).catch(() => ({ data: [] }))
            ]);

            setTaskComments(commRes.data || []);
            setTaskActivities(actRes.data || []);
            setTaskAttachments(attRes.data || []);
        } catch (err) {
            console.error("Failed to load details:", err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeTaskModal = () => {
        setSelectedTask(null);
        setTaskComments([]);
        setTaskActivities([]);
        setTaskAttachments([]);
        setNewCommentText("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendDueReminder = async (taskId) => {
        try {
            setSendingReminderId(taskId);
            const res = await api.post(`/tasks/${taskId}/remind`);
            setMessage(res.data?.message || "Reminder email sent successfully!");
            if (selectedTask && selectedTask._id === taskId) {
                const actRes = await api.get(`/activities/${taskId}`).catch(() => ({ data: [] }));
                setTaskActivities(actRes.data || []);
            }
        } catch (err) {
            setMessage(err.response?.data?.message || "Failed to send due date reminder.");
        } finally {
            setSendingReminderId(null);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || !selectedTask) return;

        try {
            const res = await api.post(`/comments/${selectedTask._id}`, {
                text: newCommentText.trim()
            });

            if (res.data?.comment) {
                setTaskComments(prev => [...prev, res.data.comment]);
                setNewCommentText("");
            }
        } catch (err) {
            console.error("Failed to add comment:", err);
            setMessage(err.response?.data?.message || "Failed to add comment");
        }
    };

    const handleUploadAttachment = async (e) => {
        e.preventDefault();
        if (!selectedFile || !selectedTask) return;

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await api.post(`/attachment/${selectedTask._id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.data?.attachment) {
                setTaskAttachments(prev => [res.data.attachment, ...prev]);
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        } catch (err) {
            console.error("Upload failed:", err);
            alert(err.response?.data?.message || "File upload failed");
        } finally {
            setUploadingFile(false);
        }
    };

    const handleDownloadAttachment = async (attachment) => {
        try {
            const res = await api.get(`/attachment/download/${attachment._id}`, {
                responseType: "blob"
            });
            const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = attachment.originalName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Download failed:", err);
            alert("Failed to download attachment");
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!window.confirm("Are you sure you want to delete this attachment?")) return;

        try {
            await api.delete(`/attachment/${attachmentId}`);
            setTaskAttachments(prev => prev.filter(a => a._id !== attachmentId));
        } catch (err) {
            console.error("Delete failed:", err);
            alert(err.response?.data?.message || "Failed to delete attachment");
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const resetAllFilters = () => {
        setTaskProjectFilter("all");
        setTaskPriorityFilter("all");
        setTaskAssigneeFilter("all");
        setTaskStatusFilter("all");
        setTaskQuickFilter("all");
        setTaskSearch("");
    };

    const isAnyFilterActive = 
        taskProjectFilter !== "all" ||
        taskPriorityFilter !== "all" ||
        taskAssigneeFilter !== "all" ||
        taskStatusFilter !== "all" ||
        taskQuickFilter !== "all" ||
        taskSearch.trim() !== "";

    const myTasksCount = tasks.filter(t => {
        const assignedId = typeof t.assignedTo === "object" ? t.assignedTo?._id : t.assignedTo;
        const assignedEmail = typeof t.assignedTo === "object" ? t.assignedTo?.email : null;
        return String(assignedId) === String(user?._id) || (assignedEmail && assignedEmail.toLowerCase() === user?.email?.toLowerCase());
    }).length;

    const highPriorityCount = tasks.filter(t => t.priority === "high").length;

    const overdueCount = tasks.filter(t => isTaskOverdue(t.dueDate, t.status)).length;

    const filteredTasks = tasks.filter(task => {
        // Project filter
        if (taskProjectFilter !== "all") {
            const projId = typeof task.project === "object" ? task.project?._id : task.project;
            if (projId !== taskProjectFilter) return false;
        }

        // Priority filter
        if (taskPriorityFilter !== "all" && task.priority !== taskPriorityFilter) {
            return false;
        }

        // Status filter (in Tasks list view)
        if (activeTab === "tasks" && taskStatusFilter !== "all" && task.status !== taskStatusFilter) {
            return false;
        }

        // Assignee filter
        if (taskAssigneeFilter !== "all") {
            if (taskAssigneeFilter === "me") {
                const assignedId = typeof task.assignedTo === "object" ? task.assignedTo?._id : task.assignedTo;
                const assignedEmail = typeof task.assignedTo === "object" ? task.assignedTo?.email : null;
                const isMe = String(assignedId) === String(user?._id) || (assignedEmail && assignedEmail.toLowerCase() === user?.email?.toLowerCase());
                if (!isMe) return false;
            } else if (taskAssigneeFilter === "unassigned") {
                if (task.assignedTo) return false;
            } else {
                const assignedId = typeof task.assignedTo === "object" ? task.assignedTo?._id : task.assignedTo;
                if (String(assignedId) !== String(taskAssigneeFilter)) return false;
            }
        }

        // Quick Filter Chips
        if (taskQuickFilter === "my-tasks") {
            const assignedId = typeof task.assignedTo === "object" ? task.assignedTo?._id : task.assignedTo;
            const assignedEmail = typeof task.assignedTo === "object" ? task.assignedTo?.email : null;
            const isMe = String(assignedId) === String(user?._id) || (assignedEmail && assignedEmail.toLowerCase() === user?.email?.toLowerCase());
            if (!isMe) return false;
        } else if (taskQuickFilter === "high-priority") {
            if (task.priority !== "high") return false;
        } else if (taskQuickFilter === "overdue") {
            if (!isTaskOverdue(task.dueDate, task.status)) return false;
        }

        // Keyword Search Filter
        if (taskSearch.trim()) {
            const q = taskSearch.toLowerCase();
            const matchTitle = task.title?.toLowerCase().includes(q);
            const matchDesc = task.description?.toLowerCase().includes(q);
            const matchAssignee = task.assignedTo?.name?.toLowerCase().includes(q) || task.assignedTo?.email?.toLowerCase().includes(q);
            const matchCreator = task.createdBy?.name?.toLowerCase().includes(q) || task.createdBy?.email?.toLowerCase().includes(q);
            const matchProject = task.project?.name?.toLowerCase().includes(q);
            if (!matchTitle && !matchDesc && !matchAssignee && !matchCreator && !matchProject) return false;
        }

        return true;
    });

    const renderFilterToolbar = (showStatusFilter = false) => (
        <div className="task-filter-panel">
            {/* Row 1: Quick Filter Chips */}
            <div className="filter-chips-row">
                <button
                    type="button"
                    className={`filter-chip ${taskQuickFilter === "all" ? "active" : ""}`}
                    onClick={() => setTaskQuickFilter("all")}
                >
                    🌐 All Tasks <span className="chip-count">{tasks.length}</span>
                </button>
                <button
                    type="button"
                    className={`filter-chip chip-me ${taskQuickFilter === "my-tasks" ? "active" : ""}`}
                    onClick={() => setTaskQuickFilter(taskQuickFilter === "my-tasks" ? "all" : "my-tasks")}
                    title="Show tasks assigned to you"
                >
                    <UserCheck size={13} /> Assigned to Me <span className="chip-count">{myTasksCount}</span>
                </button>
                <button
                    type="button"
                    className={`filter-chip chip-high ${taskQuickFilter === "high-priority" ? "active" : ""}`}
                    onClick={() => setTaskQuickFilter(taskQuickFilter === "high-priority" ? "all" : "high-priority")}
                    title="Show high priority tasks"
                >
                    🔴 High Priority <span className="chip-count">{highPriorityCount}</span>
                </button>
                <button
                    type="button"
                    className={`filter-chip chip-overdue ${taskQuickFilter === "overdue" ? "active" : ""} ${overdueCount > 0 ? "has-overdue" : ""}`}
                    onClick={() => setTaskQuickFilter(taskQuickFilter === "overdue" ? "all" : "overdue")}
                    title="Show overdue unfinished tasks"
                >
                    <AlertTriangle size={13} /> Overdue <span className="chip-count">{overdueCount}</span>
                </button>
            </div>

            {/* Row 2: Search Input & Dropdowns */}
            <div className="filter-controls-row">
                <div className="filter-search-box">
                    <Search size={15} className="filter-search-icon" />
                    <input
                        type="text"
                        placeholder="Search tasks, descriptions, assignees, projects..."
                        value={taskSearch}
                        onChange={e => setTaskSearch(e.target.value)}
                        className="filter-search-input"
                    />
                    {taskSearch && (
                        <button
                            type="button"
                            className="btn-clear-search"
                            onClick={() => setTaskSearch("")}
                            title="Clear search"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                <div className="filter-dropdowns-group">
                    {/* Project Filter */}
                    <select
                        value={taskProjectFilter}
                        onChange={e => setTaskProjectFilter(e.target.value)}
                        className="filter-select"
                        title="Filter by Project"
                    >
                        <option value="all">📁 All Projects ({projects.length})</option>
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>
                                📁 {p.name}
                            </option>
                        ))}
                    </select>

                    {/* Assignee Filter */}
                    <select
                        value={taskAssigneeFilter}
                        onChange={e => setTaskAssigneeFilter(e.target.value)}
                        className="filter-select"
                        title="Filter by Assignee"
                    >
                        <option value="all">👥 All Assignees</option>
                        <option value="me">👤 Assigned to Me ({user.name})</option>
                        <option value="unassigned">⚪ Unassigned</option>
                        {users.map(u => (
                            <option key={u._id} value={u._id}>
                                👤 {u.name} ({u.email})
                            </option>
                        ))}
                    </select>

                    {/* Priority Filter */}
                    <select
                        value={taskPriorityFilter}
                        onChange={e => setTaskPriorityFilter(e.target.value)}
                        className="filter-select"
                        title="Filter by Priority"
                    >
                        <option value="all">⚡ All Priorities</option>
                        <option value="high">🔴 High Priority</option>
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="low">🟢 Low Priority</option>
                    </select>

                    {/* Status Filter (Optional, e.g. for list view) */}
                    {showStatusFilter && (
                        <select
                            value={taskStatusFilter}
                            onChange={e => setTaskStatusFilter(e.target.value)}
                            className="filter-select"
                            title="Filter by Status"
                        >
                            <option value="all">📌 All Statuses</option>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    )}
                </div>
            </div>

            {/* Row 3: Active Filter Status & Reset */}
            <div className="filter-status-row">
                <div className="filter-count-info">
                    Showing <strong>{filteredTasks.length}</strong> of <strong>{tasks.length}</strong> tasks
                </div>

                {isAnyFilterActive && (
                    <div className="active-pills-list">
                        {taskSearch && (
                            <span className="active-pill" onClick={() => setTaskSearch("")}>
                                Search: "{taskSearch}" <X size={11} />
                            </span>
                        )}
                        {taskProjectFilter !== "all" && (
                            <span className="active-pill" onClick={() => setTaskProjectFilter("all")}>
                                Project: {projects.find(p => p._id === taskProjectFilter)?.name || "Selected"} <X size={11} />
                            </span>
                        )}
                        {taskAssigneeFilter !== "all" && (
                            <span className="active-pill" onClick={() => setTaskAssigneeFilter("all")}>
                                Assignee: {taskAssigneeFilter === "me" ? "Me" : taskAssigneeFilter === "unassigned" ? "Unassigned" : users.find(u => u._id === taskAssigneeFilter)?.name || "User"} <X size={11} />
                            </span>
                        )}
                        {taskPriorityFilter !== "all" && (
                            <span className="active-pill" onClick={() => setTaskPriorityFilter("all")}>
                                Priority: {taskPriorityFilter} <X size={11} />
                            </span>
                        )}
                        {showStatusFilter && taskStatusFilter !== "all" && (
                            <span className="active-pill" onClick={() => setTaskStatusFilter("all")}>
                                Status: {taskStatusFilter} <X size={11} />
                            </span>
                        )}
                        {taskQuickFilter !== "all" && (
                            <span className="active-pill" onClick={() => setTaskQuickFilter("all")}>
                                Quick: {taskQuickFilter === "my-tasks" ? "Assigned to Me" : taskQuickFilter === "high-priority" ? "High Priority" : "Overdue"} <X size={11} />
                            </span>
                        )}

                        <button
                            type="button"
                            className="btn-clear-all"
                            onClick={resetAllFilters}
                        >
                            Clear All Filters ✕
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    if (!user) {
        return (
            <div className="auth-page">
                <form className="auth-card" onSubmit={handleAuth}>
                    <h1>TaskFlow</h1>

                    <p>Manage your projects and tasks</p>

                    {mode === "register" && (
                        <input
                            placeholder="Name"
                            value={auth.name}
                            onChange={e =>
                                setAuth({
                                    ...auth,
                                    name: e.target.value
                                })
                            }
                            required
                        />
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={auth.email}
                        onChange={e =>
                            setAuth({
                                ...auth,
                                email: e.target.value
                            })
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={auth.password}
                        onChange={e =>
                            setAuth({
                                ...auth,
                                password: e.target.value
                            })
                        }
                        required
                    />

                    <button type="submit">
                        {mode === "login" ? "Login" : "Register"}
                    </button>

                    <button
                        type="button"
                        className="switch"
                        onClick={() =>
                            setMode(mode === "login" ? "register" : "login")
                        }
                    >
                        {mode === "login"
                            ? "Need an account? Register"
                            : "Already have an account? Login"}
                    </button>

                    {message && <p className="message">{message}</p>}

                    <div style={{ marginTop: "16px", padding: "10px 12px", background: "#f8fafc", borderRadius: "8px", fontSize: "12px", color: "#64748b", textAlign: "left", border: "1px solid #e2e8f0" }}>
                        <strong style={{ color: "#334155" }}>🔒 Authorized Portal Logins:</strong>
                        <div style={{ marginTop: "4px" }}>• <strong>Admin:</strong> <code>shaikhbashiruddinmohdhajishaik@gmail.com</code></div>
                        <div style={{ marginTop: "2px" }}>• <strong>Member:</strong> <code>bashir.runtime@gmail.com</code></div>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="layout">

            <aside className="sidebar">
                <div className="sidebar-brand-wrapper">
                    <div className="sidebar-brand-logo">
                        <span className="brand-bolt">⚡</span>
                    </div>
                    <div className="sidebar-brand-text">
                        <span className="brand-name">TaskFlow</span>
                        <span className="brand-plan">WORKSPACE</span>
                    </div>
                </div>

                <div className="sidebar-section-label">MAIN WORKSPACE</div>

                <div 
                    className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                    onClick={() => setActiveTab("dashboard")}
                >
                    <LayoutDashboard size={17} /> 
                    <span>Dashboard</span>
                    <span className="nav-shortcut-key">⌘1</span>
                </div>

                <div 
                    className={`nav-item ${activeTab === "projects" ? "active" : ""}`}
                    onClick={() => setActiveTab("projects")}
                >
                    <FolderKanban size={17} /> 
                    <span>Projects</span>
                    <span className="nav-count-badge">{projects.length}</span>
                </div>

                <div 
                    className={`nav-item ${activeTab === "tasks" ? "active" : ""}`}
                    onClick={() => setActiveTab("tasks")}
                >
                    <ListTodo size={17} /> 
                    <span>Tasks</span>
                    <span className="nav-count-badge">{tasks.length}</span>
                </div>

                <div 
                    className={`nav-item ${activeTab === "kanban" ? "active" : ""}`}
                    onClick={() => setActiveTab("kanban")}
                >
                    <Kanban size={17} /> 
                    <span>Kanban Board</span>
                </div>

                <div className="sidebar-section-label">MANAGEMENT</div>

                <div 
                    className={`nav-item ${activeTab === "team" ? "active" : ""}`}
                    onClick={() => setActiveTab("team")}
                >
                    <Users size={17} /> 
                    <span>Team</span>
                    <span className="nav-count-badge">{users.length}</span>
                </div>

                <div className="sidebar-user-card">
                    <div className={`sidebar-user-avatar ${user.role === "admin" ? "admin" : ""}`}>
                        {(user.name ? user.name.substring(0, 2) : "U").toUpperCase()}
                        <span className="user-online-dot" />
                    </div>
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">{user.name}</span>
                        <span className="sidebar-user-email" title={user.email}>{user.email}</span>
                        <div className="sidebar-user-role-badge">
                            {user.role === "admin" && "👑 Admin"}
                            {user.role === "manager" && "👔 Manager"}
                            {getOwnedProjects(user._id).length > 0 && user.role !== "admin" && "📁 Project Owner"}
                            {user.role === "member" && getOwnedProjects(user._id).length === 0 && "👤 Member"}
                        </div>
                    </div>
                </div>

                <button className="btn-logout" onClick={logout}>
                    <LogOut size={16} /> Logout
                </button>
            </aside>

            <main className="main">

                <header>
                    <div>
                        <div className="header-breadcrumbs">
                            <span className="crumb-root">⚡ TaskFlow</span>
                            <span className="crumb-sep">/</span>
                            <span className="crumb-current">
                                {activeTab === "dashboard" && "Dashboard Overview"}
                                {activeTab === "projects" && "Projects"}
                                {activeTab === "tasks" && "Tasks"}
                                {activeTab === "kanban" && "Kanban Board"}
                                {activeTab === "team" && "Team Directory"}
                            </span>
                        </div>
                        <h1 className="page-heading">
                            {activeTab === "dashboard" && "Dashboard"}
                            {activeTab === "projects" && "Projects"}
                            {activeTab === "tasks" && "Tasks"}
                            {activeTab === "kanban" && "Kanban Board"}
                            {activeTab === "team" && "Team Directory"}
                        </h1>
                        <p className="page-subheading">
                            {activeTab === "dashboard" && `Welcome back, ${user.name} • Here's your workspace performance.`}
                            {activeTab === "projects" && "Create, organize and track project milestones"}
                            {activeTab === "tasks" && "Manage tasks, assignments, deadlines, and live status"}
                            {activeTab === "kanban" && "Visual drag-and-drop workflow across project lifecycle"}
                            {activeTab === "team" && "Team members, roles, project ownership & assignments"}
                        </p>
                    </div>

                    <div className="header-action-group">
                        <button
                            type="button"
                            className="btn-quick-new-task"
                            onClick={() => {
                                setSelectedProjectId(null);
                                setActiveTab("tasks");
                            }}
                            title="Go to Tasks & create new item"
                        >
                            <Plus size={15} /> New Task
                        </button>
                        <button
                            type="button"
                            className="btn-add-member"
                            onClick={() => setShowAddUserModal(true)}
                            title="Add anyone's email to assign tasks and send them notifications"
                        >
                            <UserPlus size={15} /> Add Member
                        </button>
                    </div>
                </header>

                {activeTab === "dashboard" && (
                    <>
                        {/* Linear Style Quick Navigation Jump Bar */}
                        <div className="dashboard-quick-nav">
                            <span className="quick-nav-label">QUICK VIEW:</span>
                            <button
                                type="button"
                                className="quick-nav-pill"
                                onClick={() => document.getElementById("stats-section")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                📈 5 Key Metrics
                            </button>
                            <button
                                type="button"
                                className="quick-nav-pill"
                                onClick={() => document.getElementById("donut-section")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                🍩 Status Donut
                            </button>
                            <button
                                type="button"
                                className="quick-nav-pill"
                                onClick={() => document.getElementById("barchart-section")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                📊 Velocity Bar Graph
                            </button>
                            <button
                                type="button"
                                className="quick-nav-pill"
                                onClick={() => document.getElementById("pivot-section")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                🗂️ Pivot Matrix Table
                            </button>
                            <button
                                type="button"
                                className="quick-nav-pill"
                                onClick={() => document.getElementById("projects-section")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                📁 Projects Directory
                            </button>
                        </div>

                        <div className="stats-grid-linear" id="stats-section">
                            <div className="stat-card-linear stat-total">
                                <div className="stat-card-top">
                                    <span className="stat-label">TOTAL TASKS</span>
                                    <div className="stat-icon-bubble bubble-purple">
                                        <ListTodo size={18} />
                                    </div>
                                </div>
                                <div className="stat-main-num">{tasks.length}</div>
                                <div className="stat-progress-bar">
                                    <div className="stat-progress-fill fill-purple" style={{ width: "100%" }}></div>
                                </div>
                                <div className="stat-footer-text">Across all workspace projects</div>
                            </div>

                            <div className="stat-card-linear stat-todo">
                                <div className="stat-card-top">
                                    <span className="stat-label">TO DO</span>
                                    <div className="stat-icon-bubble bubble-slate">
                                        <Clock size={18} />
                                    </div>
                                </div>
                                <div className="stat-main-num">
                                    {tasks.filter(t => t.status === "todo").length}
                                </div>
                                <div className="stat-progress-bar">
                                    <div className="stat-progress-fill fill-slate" style={{ width: `${tasks.length ? Math.round((tasks.filter(t => t.status === "todo").length / tasks.length) * 100) : 0}%` }}></div>
                                </div>
                                <div className="stat-footer-text">{tasks.length ? Math.round((tasks.filter(t => t.status === "todo").length / tasks.length) * 100) : 0}% of total backlog</div>
                            </div>

                            <div className="stat-card-linear stat-progress">
                                <div className="stat-card-top">
                                    <span className="stat-label">IN PROGRESS</span>
                                    <div className="stat-icon-bubble bubble-amber">
                                        <TrendingUp size={18} />
                                    </div>
                                </div>
                                <div className="stat-main-num">
                                    {tasks.filter(t => t.status === "in-progress").length}
                                </div>
                                <div className="stat-progress-bar">
                                    <div className="stat-progress-fill fill-amber" style={{ width: `${tasks.length ? Math.round((tasks.filter(t => t.status === "in-progress").length / tasks.length) * 100) : 0}%` }}></div>
                                </div>
                                <div className="stat-footer-text">{tasks.length ? Math.round((tasks.filter(t => t.status === "in-progress").length / tasks.length) * 100) : 0}% in active sprint</div>
                            </div>

                            <div className="stat-card-linear stat-completed">
                                <div className="stat-card-top">
                                    <span className="stat-label">COMPLETED</span>
                                    <div className="stat-icon-bubble bubble-green">
                                        <CheckCircle2 size={18} />
                                    </div>
                                </div>
                                <div className="stat-main-num">
                                    {tasks.filter(t => t.status === "completed").length}
                                </div>
                                <div className="stat-progress-bar">
                                    <div className="stat-progress-fill fill-green" style={{ width: `${tasks.length ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) : 0}%` }}></div>
                                </div>
                                <div className="stat-footer-text">{tasks.length ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) : 0}% completion rate</div>
                            </div>

                            <div
                                className={`stat-card-linear stat-overdue ${overdueCount > 0 ? "has-overdue" : ""}`}
                                onClick={() => {
                                    setActiveTab("tasks");
                                    setTaskQuickFilter("overdue");
                                }}
                                style={{ cursor: "pointer" }}
                                title="Click to view and filter overdue tasks"
                            >
                                <div className="stat-card-top">
                                    <span className="stat-label">OVERDUE</span>
                                    <div className="stat-icon-bubble bubble-rose">
                                        <AlertTriangle size={18} />
                                    </div>
                                </div>
                                <div className="stat-main-num">{overdueCount}</div>
                                <div className="stat-progress-bar">
                                    <div className="stat-progress-fill fill-rose" style={{ width: overdueCount > 0 ? "100%" : "0%" }}></div>
                                </div>
                                <div className="stat-footer-text">{overdueCount > 0 ? "⚠️ Immediate attention needed" : "✓ Zero overdue tasks"}</div>
                            </div>
                        </div>

                        {/* Jira & Linear Style Visual Analytics Grid */}
                        <div className="dashboard-analytics-grid" id="donut-section">
                            
                            {/* Widget 1: Task Status Donut & Velocity Bar Graph */}
                            <div className="analytics-card status-donut-widget">
                                <div className="analytics-card-header">
                                    <div className="card-title-group">
                                        <div className="analytics-icon-wrap icon-purple">
                                            {analyticsTab === "donut" ? <PieChart size={17} /> : <BarChart3 size={17} />}
                                        </div>
                                        <div>
                                            <h3>{analyticsTab === "donut" ? "Status & Velocity Breakdown" : "Project Velocity Comparison"}</h3>
                                            <span className="card-subtitle">
                                                {analyticsTab === "donut" ? "Real-time task distribution across stages" : "Completed vs In-Progress vs Backlog per project"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="analytics-tab-toggle">
                                        <button
                                            type="button"
                                            className={`btn-analytics-toggle ${analyticsTab === "donut" ? "active" : ""}`}
                                            onClick={() => setAnalyticsTab("donut")}
                                            title="View Donut Chart"
                                        >
                                            <PieChart size={13} /> Donut
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn-analytics-toggle ${analyticsTab === "barchart" ? "active" : ""}`}
                                            onClick={() => setAnalyticsTab("barchart")}
                                            title="View Project Bar Graph"
                                        >
                                            <BarChart3 size={13} /> Bar Graph
                                        </button>
                                    </div>
                                </div>

                                {analyticsTab === "donut" && (() => {
                                    const total = tasks.length;
                                    const todoC = tasks.filter(t => t.status === "todo").length;
                                    const progC = tasks.filter(t => t.status === "in-progress").length;
                                    const doneC = tasks.filter(t => t.status === "completed").length;
                                    const donePct = total ? Math.round((doneC / total) * 100) : 0;
                                    const circ = 251.327; // 2 * pi * 40
                                    const todoLen = total ? (todoC / total) * circ : 0;
                                    const progLen = total ? (progC / total) * circ : 0;
                                    const doneLen = total ? (doneC / total) * circ : 0;

                                    const highC = tasks.filter(t => t.priority === "high").length;
                                    const medC = tasks.filter(t => t.priority === "medium").length;
                                    const lowC = tasks.filter(t => t.priority === "low").length;

                                    return (
                                        <div className="analytics-card-body">
                                            <div className="donut-chart-container">
                                                <div className="donut-svg-wrapper">
                                                    <svg viewBox="0 0 100 100" className="donut-svg">
                                                        {/* Base track */}
                                                        <circle
                                                            cx="50"
                                                            cy="50"
                                                            r="40"
                                                            className="donut-bg-track"
                                                        />
                                                        {total > 0 ? (
                                                            <>
                                                                {/* To Do Segment (Indigo) */}
                                                                {todoC > 0 && (
                                                                    <circle
                                                                        cx="50"
                                                                        cy="50"
                                                                        r="40"
                                                                        className="donut-segment segment-todo"
                                                                        strokeDasharray={`${todoLen} ${circ}`}
                                                                        strokeDashoffset="0"
                                                                    />
                                                                )}
                                                                {/* In Progress Segment (Amber) */}
                                                                {progC > 0 && (
                                                                    <circle
                                                                        cx="50"
                                                                        cy="50"
                                                                        r="40"
                                                                        className="donut-segment segment-prog"
                                                                        strokeDasharray={`${progLen} ${circ}`}
                                                                        strokeDashoffset={`-${todoLen}`}
                                                                    />
                                                                )}
                                                                {/* Done Segment (Emerald) */}
                                                                {doneC > 0 && (
                                                                    <circle
                                                                        cx="50"
                                                                        cy="50"
                                                                        r="40"
                                                                        className="donut-segment segment-done"
                                                                        strokeDasharray={`${doneLen} ${circ}`}
                                                                        strokeDashoffset={`-${todoLen + progLen}`}
                                                                    />
                                                                )}
                                                            </>
                                                        ) : (
                                                            <circle
                                                                cx="50"
                                                                cy="50"
                                                                r="40"
                                                                className="donut-empty-circle"
                                                            />
                                                        )}
                                                    </svg>
                                                    <div className="donut-center-info">
                                                        <span className="donut-center-pct">{donePct}%</span>
                                                        <span className="donut-center-label">Completed</span>
                                                    </div>
                                                </div>

                                                <div className="donut-legend-list">
                                                    <div 
                                                        className="legend-item cursor-pointer"
                                                        onClick={() => {
                                                            setActiveTab("tasks");
                                                            setTaskQuickFilter("todo");
                                                        }}
                                                        title="Click to view To Do tasks"
                                                    >
                                                        <div className="legend-indicator dot-todo" />
                                                        <span className="legend-name">To Do</span>
                                                        <span className="legend-count">{todoC}</span>
                                                        <span className="legend-pct">({total ? Math.round((todoC / total) * 100) : 0}%)</span>
                                                    </div>
                                                    <div 
                                                        className="legend-item cursor-pointer"
                                                        onClick={() => {
                                                            setActiveTab("tasks");
                                                            setTaskQuickFilter("in-progress");
                                                        }}
                                                        title="Click to view In Progress tasks"
                                                    >
                                                        <div className="legend-indicator dot-prog" />
                                                        <span className="legend-name">In Progress</span>
                                                        <span className="legend-count">{progC}</span>
                                                        <span className="legend-pct">({total ? Math.round((progC / total) * 100) : 0}%)</span>
                                                    </div>
                                                    <div 
                                                        className="legend-item cursor-pointer"
                                                        onClick={() => {
                                                            setActiveTab("tasks");
                                                            setTaskQuickFilter("completed");
                                                        }}
                                                        title="Click to view Completed tasks"
                                                    >
                                                        <div className="legend-indicator dot-done" />
                                                        <span className="legend-name">Done</span>
                                                        <span className="legend-count">{doneC}</span>
                                                        <span className="legend-pct">({donePct}%)</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Priority Urgency Stack Bar */}
                                            <div className="priority-breakdown-box">
                                                <div className="priority-breakdown-header">
                                                    <span className="priority-box-title">PRIORITY URGENCY</span>
                                                    <span className="priority-box-counts">
                                                        <span style={{ color: '#ef4444' }}>● High: {highC}</span>
                                                        <span style={{ color: '#f59e0b', margin: '0 8px' }}>● Med: {medC}</span>
                                                        <span style={{ color: '#10b981' }}>● Low: {lowC}</span>
                                                    </span>
                                                </div>
                                                <div className="priority-stacked-track">
                                                    <div 
                                                        className="priority-segment seg-high" 
                                                        style={{ width: `${total ? (highC / total) * 100 : 0}%` }}
                                                        title={`High: ${highC} tasks`}
                                                    />
                                                    <div 
                                                        className="priority-segment seg-med" 
                                                        style={{ width: `${total ? (medC / total) * 100 : 0}%` }}
                                                        title={`Medium: ${medC} tasks`}
                                                    />
                                                    <div 
                                                        className="priority-segment seg-low" 
                                                        style={{ width: `${total ? (lowC / total) * 100 : 0}%` }}
                                                        title={`Low: ${lowC} tasks`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {analyticsTab === "barchart" && (
                                    <div className="barchart-container">
                                        {projects.length === 0 ? (
                                            <div className="workload-empty"><p>No projects created yet.</p></div>
                                        ) : (
                                            projects.map(proj => {
                                                const projTasks = tasks.filter(t => (t.project?._id || t.project) === proj._id);
                                                const todoCount = projTasks.filter(t => t.status === "todo").length;
                                                const progCount = projTasks.filter(t => t.status === "in-progress").length;
                                                const doneCount = projTasks.filter(t => t.status === "completed").length;
                                                const maxCount = Math.max(...projects.map(p => tasks.filter(t => (t.project?._id || t.project) === p._id).length), 1);
                                                const pct = projTasks.length ? Math.round((doneCount / projTasks.length) * 100) : 0;

                                                return (
                                                    <div className="barchart-project-row" key={proj._id} onClick={() => { setSelectedProjectId(proj._id); setActiveTab("projects"); }} title="Click to view project details">
                                                        <div className="barchart-proj-header">
                                                            <span className="barchart-proj-name">📁 {proj.name}</span>
                                                            <div className="barchart-proj-stats">
                                                                <span className="barchart-pill pill-todo">{todoCount} to do</span>
                                                                <span className="barchart-pill pill-prog">{progCount} in dev</span>
                                                                <span className="barchart-pill pill-done">{doneCount} done</span>
                                                                <span className="barchart-pct-badge">{pct}% done</span>
                                                            </div>
                                                        </div>
                                                        <div className="barchart-track">
                                                            <div className="barchart-segment seg-done" style={{ width: `${projTasks.length ? (doneCount / maxCount) * 100 : 0}%` }} title={`Completed: ${doneCount}`} />
                                                            <div className="barchart-segment seg-prog" style={{ width: `${projTasks.length ? (progCount / maxCount) * 100 : 0}%` }} title={`In Progress: ${progCount}`} />
                                                            <div className="barchart-segment seg-todo" style={{ width: `${projTasks.length ? (todoCount / maxCount) * 100 : 0}%` }} title={`To Do: ${todoCount}`} />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Widget 2: Team Workload & Resource Capacity */}
                            <div className="analytics-card workload-widget">
                                <div className="analytics-card-header">
                                    <div className="card-title-group">
                                        <div className="analytics-icon-wrap icon-blue">
                                            <Users size={17} />
                                        </div>
                                        <div>
                                            <h3>Team Workload & Capacity</h3>
                                            <span className="card-subtitle">Active task assignments per engineer</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-widget-link"
                                        onClick={() => setActiveTab("team")}
                                        title="View Team Directory"
                                    >
                                        Team Directory →
                                    </button>
                                </div>

                                {(() => {
                                    const workloadList = users.map(u => {
                                        const userTasks = tasks.filter(t => (t.assignedTo?._id || t.assignedTo) === u._id);
                                        const active = userTasks.filter(t => t.status !== "completed").length;
                                        const done = userTasks.filter(t => t.status === "completed").length;
                                        return { user: u, total: userTasks.length, active, done };
                                    }).sort((a, b) => b.active - a.active);

                                    const unassignedActive = tasks.filter(t => !t.assignedTo && t.status !== "completed").length;
                                    const maxVal = Math.max(...workloadList.map(w => w.active), unassignedActive, 1);

                                    return (
                                        <div className="workload-list">
                                            {workloadList.slice(0, 5).map(item => {
                                                const fillPct = Math.min(Math.round((item.active / maxVal) * 100), 100);
                                                return (
                                                    <div className="workload-member-row" key={item.user._id}>
                                                        <div className="member-avatar-chip">
                                                            {(item.user.name ? item.user.name.substring(0, 2) : "U").toUpperCase()}
                                                        </div>
                                                        <div className="member-info-col">
                                                            <div className="member-meta-row">
                                                                <span className="member-name-label">{item.user.name}</span>
                                                                <div className="member-counts-group">
                                                                    <span className="member-active-count">{item.active} active</span>
                                                                    <span className="member-done-count">({item.done} done)</span>
                                                                </div>
                                                            </div>
                                                            <div className="workload-bar-track">
                                                                <div 
                                                                    className={`workload-bar-fill ${item.active >= 4 ? "fill-heavy" : item.active > 0 ? "fill-normal" : "fill-idle"}`}
                                                                    style={{ width: `${item.active > 0 ? fillPct : 0}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className={`member-capacity-badge ${item.active >= 4 ? "cap-high" : item.active > 0 ? "cap-optimal" : "cap-free"}`}>
                                                            {item.active >= 4 ? "⚠️ High Load" : item.active > 0 ? "Optimal" : "Available"}
                                                        </span>
                                                    </div>
                                                );
                                            })}

                                            {unassignedActive > 0 && (
                                                <div className="workload-member-row row-unassigned">
                                                    <div className="member-avatar-chip avatar-unassigned">?</div>
                                                    <div className="member-info-col">
                                                        <div className="member-meta-row">
                                                            <span className="member-name-label" style={{ color: "#b45309" }}>Unassigned Tasks</span>
                                                            <span className="member-active-count" style={{ color: "#b45309" }}>{unassignedActive} open</span>
                                                        </div>
                                                        <div className="workload-bar-track">
                                                            <div 
                                                                className="workload-bar-fill fill-unassigned"
                                                                style={{ width: `${Math.min(Math.round((unassignedActive / maxVal) * 100), 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <span className="member-capacity-badge cap-unassigned">Needs Assignee</span>
                                                </div>
                                            )}

                                            {users.length === 0 && (
                                                <div className="workload-empty">
                                                    <p>No team members added yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                        </div>

                        {/* Project Velocity Bar Graph Panel */}
                        <section className="panel velocity-barchart-panel" id="barchart-section">
                            <div className="section-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div className="analytics-icon-wrap icon-purple">
                                        <BarChart3 size={18} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Project Velocity & Sprint Bar Graph</h3>
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>Multi-project sprint progress: Completed vs In-Progress vs Backlog</span>
                                    </div>
                                </div>
                                <div className="barchart-legend-pills" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <span className="barchart-pill pill-done">● Completed</span>
                                    <span className="barchart-pill pill-prog">● In Dev</span>
                                    <span className="barchart-pill pill-todo">● To Do</span>
                                </div>
                            </div>
                            <div className="barchart-container">
                                {projects.length === 0 ? (
                                    <div className="workload-empty"><p>No projects created yet.</p></div>
                                ) : (
                                    projects.map(proj => {
                                        const projTasks = tasks.filter(t => (t.project?._id || t.project) === proj._id);
                                        const todoCount = projTasks.filter(t => t.status === "todo").length;
                                        const progCount = projTasks.filter(t => t.status === "in-progress").length;
                                        const doneCount = projTasks.filter(t => t.status === "completed").length;
                                        const maxCount = Math.max(...projects.map(p => tasks.filter(t => (t.project?._id || t.project) === p._id).length), 1);
                                        const pct = projTasks.length ? Math.round((doneCount / projTasks.length) * 100) : 0;

                                        return (
                                            <div className="barchart-project-row" key={proj._id} onClick={() => { setSelectedProjectId(proj._id); setActiveTab("projects"); }} title="Click to view project details">
                                                <div className="barchart-proj-header">
                                                    <span className="barchart-proj-name">📁 {proj.name}</span>
                                                    <div className="barchart-proj-stats">
                                                        <span className="barchart-pill pill-todo">{todoCount} to do</span>
                                                        <span className="barchart-pill pill-prog">{progCount} in dev</span>
                                                        <span className="barchart-pill pill-done">{doneCount} done</span>
                                                        <span className="barchart-pct-badge">{pct}% done</span>
                                                    </div>
                                                </div>
                                                <div className="barchart-track">
                                                    <div className="barchart-segment seg-done" style={{ width: `${projTasks.length ? (doneCount / maxCount) * 100 : 0}%` }} title={`Completed: ${doneCount}`} />
                                                    <div className="barchart-segment seg-prog" style={{ width: `${projTasks.length ? (progCount / maxCount) * 100 : 0}%` }} title={`In Progress: ${progCount}`} />
                                                    <div className="barchart-segment seg-todo" style={{ width: `${projTasks.length ? (todoCount / maxCount) * 100 : 0}%` }} title={`To Do: ${todoCount}`} />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {/* Jira & Linear Matrix Report: 2D Pivot Analytics Table */}
                        <section className="panel pivot-matrix-panel" id="pivot-section">
                            <div className="pivot-header-row">
                                <div className="pivot-title-group">
                                    <div className="pivot-icon-box">
                                        <Table size={18} />
                                    </div>
                                    <div>
                                        <h3 className="pivot-heading">Cross-Dimensional Matrix Report</h3>
                                        <p className="pivot-subtitle">
                                            Interactive 2D multi-axis breakdown of sprint velocity, overdue risk, and team capacity
                                        </p>
                                    </div>
                                </div>

                                <div className="pivot-dimension-controls">
                                    <span className="pivot-control-label">Group By:</span>
                                    <div className="pivot-pill-group">
                                        <button
                                            type="button"
                                            className={`pivot-pill-btn ${pivotDimension === "project" ? "active" : ""}`}
                                            onClick={() => setPivotDimension("project")}
                                            title="Group tasks by Project"
                                        >
                                            <FolderKanban size={13} /> By Project
                                        </button>
                                        <button
                                            type="button"
                                            className={`pivot-pill-btn ${pivotDimension === "assignee" ? "active" : ""}`}
                                            onClick={() => setPivotDimension("assignee")}
                                            title="Group tasks by Team Assignee"
                                        >
                                            <Users size={13} /> By Assignee
                                        </button>
                                        <button
                                            type="button"
                                            className={`pivot-pill-btn ${pivotDimension === "priority" ? "active" : ""}`}
                                            onClick={() => setPivotDimension("priority")}
                                            title="Group tasks by Priority"
                                        >
                                            <Layers size={13} /> By Priority
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pivot-table-responsive-wrapper">
                                <table className="pivot-table">
                                    <thead>
                                        <tr>
                                            <th className="pivot-th-dimension">
                                                {pivotDimension === "project" && "PROJECT / INITIATIVE"}
                                                {pivotDimension === "assignee" && "ENGINEER / ASSIGNEE"}
                                                {pivotDimension === "priority" && "PRIORITY TIER"}
                                            </th>
                                            <th className="pivot-th-stat text-center">TO DO</th>
                                            <th className="pivot-th-stat text-center">IN PROGRESS</th>
                                            <th className="pivot-th-stat text-center">COMPLETED</th>
                                            <th className="pivot-th-stat text-center">OVERDUE</th>
                                            <th className="pivot-th-stat text-center">TOTAL</th>
                                            <th className="pivot-th-progress">COMPLETION VELOCITY</th>
                                            <th className="pivot-th-health text-center">HEALTH STATUS</th>
                                            <th className="pivot-th-action text-right">DRILLDOWN</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            let rows = [];

                                            if (pivotDimension === "project") {
                                                rows = projects.map(proj => {
                                                    const rowTasks = tasks.filter(t => (t.project?._id || t.project) === proj._id);
                                                    const todoCount = rowTasks.filter(t => t.status === "todo").length;
                                                    const progCount = rowTasks.filter(t => t.status === "in-progress").length;
                                                    const doneCount = rowTasks.filter(t => t.status === "completed").length;
                                                    const overdueCount = rowTasks.filter(t => isTaskOverdue(t.dueDate, t.status)).length;
                                                    const total = rowTasks.length;
                                                    const pct = total ? Math.round((doneCount / total) * 100) : 0;

                                                    let healthBadge = { text: "On Track", cls: "health-green" };
                                                    if (overdueCount > 0) {
                                                        healthBadge = { text: `${overdueCount} Overdue`, cls: "health-red" };
                                                    } else if (total === 0) {
                                                        healthBadge = { text: "No Tasks", cls: "health-muted" };
                                                    } else if (pct === 100) {
                                                        healthBadge = { text: "Completed", cls: "health-emerald" };
                                                    } else if (pct < 30 && progCount > 0) {
                                                        healthBadge = { text: "Slow Velocity", cls: "health-amber" };
                                                    }

                                                    return {
                                                        id: proj._id,
                                                        title: proj.name,
                                                        sub: proj.description || "Active Workspace Project",
                                                        icon: "📁",
                                                        todoCount,
                                                        progCount,
                                                        doneCount,
                                                        overdueCount,
                                                        total,
                                                        pct,
                                                        healthBadge,
                                                        onClick: () => {
                                                            setSelectedProjectId(proj._id);
                                                            setActiveTab("projects");
                                                        }
                                                    };
                                                });
                                            } else if (pivotDimension === "assignee") {
                                                const assignedUserRows = users.map(u => {
                                                    const rowTasks = tasks.filter(t => (t.assignedTo?._id || t.assignedTo) === u._id);
                                                    const todoCount = rowTasks.filter(t => t.status === "todo").length;
                                                    const progCount = rowTasks.filter(t => t.status === "in-progress").length;
                                                    const doneCount = rowTasks.filter(t => t.status === "completed").length;
                                                    const overdueCount = rowTasks.filter(t => isTaskOverdue(t.dueDate, t.status)).length;
                                                    const total = rowTasks.length;
                                                    const pct = total ? Math.round((doneCount / total) * 100) : 0;

                                                    let healthBadge = { text: "Balanced", cls: "health-green" };
                                                    if (overdueCount > 0) {
                                                        healthBadge = { text: `${overdueCount} Overdue`, cls: "health-red" };
                                                    } else if (progCount >= 4) {
                                                        healthBadge = { text: "Heavy Load", cls: "health-amber" };
                                                    } else if (total === 0) {
                                                        healthBadge = { text: "Available", cls: "health-muted" };
                                                    }

                                                    return {
                                                        id: u._id,
                                                        title: u.name,
                                                        sub: u.email,
                                                        avatar: (u.name ? u.name.substring(0, 2) : "U").toUpperCase(),
                                                        todoCount,
                                                        progCount,
                                                        doneCount,
                                                        overdueCount,
                                                        total,
                                                        pct,
                                                        healthBadge,
                                                        onClick: () => {
                                                            setTaskAssigneeFilter(u._id);
                                                            setActiveTab("tasks");
                                                        }
                                                    };
                                                });

                                                const unassignedTasks = tasks.filter(t => !t.assignedTo);
                                                if (unassignedTasks.length > 0) {
                                                    const todoCount = unassignedTasks.filter(t => t.status === "todo").length;
                                                    const progCount = unassignedTasks.filter(t => t.status === "in-progress").length;
                                                    const doneCount = unassignedTasks.filter(t => t.status === "completed").length;
                                                    const overdueCount = unassignedTasks.filter(t => isTaskOverdue(t.dueDate, t.status)).length;
                                                    const total = unassignedTasks.length;
                                                    const pct = total ? Math.round((doneCount / total) * 100) : 0;

                                                    assignedUserRows.push({
                                                        id: "unassigned",
                                                        title: "Unassigned Tasks",
                                                        sub: "Needs engineer allocation",
                                                        icon: "❓",
                                                        todoCount,
                                                        progCount,
                                                        doneCount,
                                                        overdueCount,
                                                        total,
                                                        pct,
                                                        healthBadge: { text: "Needs Owner", cls: "health-amber" },
                                                        onClick: () => {
                                                            setTaskAssigneeFilter("unassigned");
                                                            setActiveTab("tasks");
                                                        }
                                                    });
                                                }
                                                rows = assignedUserRows;
                                            } else if (pivotDimension === "priority") {
                                                const priorities = [
                                                    { key: "high", name: "High Priority", sub: "P1 Urgent sprint milestones", icon: "🔥" },
                                                    { key: "medium", name: "Medium Priority", sub: "P2 Standard feature tasks", icon: "⚡" },
                                                    { key: "low", name: "Low Priority", sub: "P3 Backlog improvements", icon: "🌱" }
                                                ];

                                                rows = priorities.map(p => {
                                                    const rowTasks = tasks.filter(t => t.priority === p.key);
                                                    const todoCount = rowTasks.filter(t => t.status === "todo").length;
                                                    const progCount = rowTasks.filter(t => t.status === "in-progress").length;
                                                    const doneCount = rowTasks.filter(t => t.status === "completed").length;
                                                    const overdueCount = rowTasks.filter(t => isTaskOverdue(t.dueDate, t.status)).length;
                                                    const total = rowTasks.length;
                                                    const pct = total ? Math.round((doneCount / total) * 100) : 0;

                                                    let healthBadge = { text: "Healthy", cls: "health-green" };
                                                    if (overdueCount > 0) {
                                                        healthBadge = { text: `${overdueCount} Overdue`, cls: "health-red" };
                                                    } else if (p.key === "high" && (todoCount + progCount > 0)) {
                                                        healthBadge = { text: "Critical Focus", cls: "health-amber" };
                                                    }

                                                    return {
                                                        id: p.key,
                                                        title: p.name,
                                                        sub: p.sub,
                                                        icon: p.icon,
                                                        todoCount,
                                                        progCount,
                                                        doneCount,
                                                        overdueCount,
                                                        total,
                                                        pct,
                                                        healthBadge,
                                                        onClick: () => {
                                                            setTaskPriorityFilter(p.key);
                                                            setActiveTab("tasks");
                                                        }
                                                    };
                                                });
                                            }

                                            if (rows.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan="9" className="pivot-empty-cell">
                                                            No data available for this dimension.
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return rows.map(r => (
                                                <tr key={r.id} className="pivot-data-row" onClick={r.onClick} title="Click to drill down into filtered tasks">
                                                    <td className="pivot-cell-entity">
                                                        <div className="pivot-entity-flex">
                                                            {r.avatar ? (
                                                                <div className="pivot-avatar-chip">{r.avatar}</div>
                                                            ) : (
                                                                <span className="pivot-entity-icon">{r.icon}</span>
                                                            )}
                                                            <div className="pivot-entity-text">
                                                                <span className="pivot-entity-name">{r.title}</span>
                                                                <span className="pivot-entity-sub">{r.sub}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="pivot-cell-val text-center">
                                                        <span className="pivot-cell-pill pill-todo">{r.todoCount}</span>
                                                    </td>
                                                    <td className="pivot-cell-val text-center">
                                                        <span className="pivot-cell-pill pill-prog">{r.progCount}</span>
                                                    </td>
                                                    <td className="pivot-cell-val text-center">
                                                        <span className="pivot-cell-pill pill-done">{r.doneCount}</span>
                                                    </td>
                                                    <td className="pivot-cell-val text-center">
                                                        <span className={`pivot-cell-pill ${r.overdueCount > 0 ? "pill-overdue-alert" : "pill-overdue-zero"}`}>
                                                            {r.overdueCount}
                                                        </span>
                                                    </td>
                                                    <td className="pivot-cell-val text-center">
                                                        <strong className="pivot-total-num">{r.total}</strong>
                                                    </td>
                                                    <td className="pivot-cell-progress">
                                                        <div className="pivot-progress-container">
                                                            <div className="pivot-progress-bar-track">
                                                                <div
                                                                    className="pivot-progress-bar-fill"
                                                                    style={{ width: `${r.pct}%` }}
                                                                />
                                                            </div>
                                                            <span className="pivot-progress-label">{r.pct}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="pivot-cell-health text-center">
                                                        <span className={`pivot-health-badge ${r.healthBadge.cls}`}>
                                                            {r.healthBadge.text}
                                                        </span>
                                                    </td>
                                                    <td className="pivot-cell-action text-right">
                                                        <span className="pivot-drilldown-link">
                                                            View <ArrowRight size={12} />
                                                        </span>
                                                    </td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                    <tfoot>
                                        {(() => {
                                            const totalTasksCount = tasks.length;
                                            const grandTodo = tasks.filter(t => t.status === "todo").length;
                                            const grandProg = tasks.filter(t => t.status === "in-progress").length;
                                            const grandDone = tasks.filter(t => t.status === "completed").length;
                                            const grandOverdue = tasks.filter(t => isTaskOverdue(t.dueDate, t.status)).length;
                                            const grandPct = totalTasksCount ? Math.round((grandDone / totalTasksCount) * 100) : 0;

                                            return (
                                                <tr className="pivot-total-row">
                                                    <td className="pivot-total-title">
                                                        <strong>Grand Total Summary ({projects.length} Projects, {users.length} Members)</strong>
                                                    </td>
                                                    <td className="pivot-cell-val text-center">
                                                        <span className="pivot-cell-pill pill-todo-total">{grandTodo}</span>
                                                    </td>
                                                    <td className="pivot-cell-val text-center">
                                                        <span className="pivot-cell-pill pill-prog-total">{grandProg}</span>
                                                    </td>
                                                    <td className="pivot-cell-val text-center">
                                                        <span className="pivot-cell-pill pill-done-total">{grandDone}</span>
                                                    </td>
                                                    <td className="pivot-cell-val text-center">
                                                        <span className={`pivot-cell-pill ${grandOverdue > 0 ? "pill-overdue-alert" : "pill-overdue-zero"}`}>
                                                            {grandOverdue}
                                                        </span>
                                                    </td>
                                                    <td className="pivot-cell-val text-center">
                                                        <strong className="pivot-grand-total">{totalTasksCount}</strong>
                                                    </td>
                                                    <td className="pivot-cell-progress">
                                                        <div className="pivot-progress-container">
                                                            <div className="pivot-progress-bar-track track-total">
                                                                <div
                                                                    className="pivot-progress-bar-fill fill-grand"
                                                                    style={{ width: `${grandPct}%` }}
                                                                />
                                                            </div>
                                                            <span className="pivot-progress-label"><strong>{grandPct}%</strong></span>
                                                        </div>
                                                    </td>
                                                    <td className="pivot-cell-health text-center">
                                                        <span className={`pivot-health-badge ${grandOverdue > 0 ? "health-red" : "health-emerald"}`}>
                                                            {grandOverdue > 0 ? "⚠️ Overdue Risks" : "🟢 100% On Track"}
                                                        </span>
                                                    </td>
                                                    <td className="pivot-cell-action text-right">
                                                        <span className="pivot-grand-badge">WORKSPACE TOTAL</span>
                                                    </td>
                                                </tr>
                                            );
                                        })()}
                                    </tfoot>
                                </table>
                            </div>
                        </section>

                        <section className="panel" id="projects-section">
                            <div className="section-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                                <h2 style={{ margin: 0 }}>My Projects ({projects.length})</h2>
                                <button
                                    type="button"
                                    className="btn-switch-tab"
                                    onClick={() => {
                                        setSelectedProjectId(null);
                                        setActiveTab("projects");
                                    }}
                                    title="View all projects directory"
                                >
                                    View All Projects →
                                </button>
                            </div>
                            <div className="project-grid">
                                {projects.slice(0, 4).map(project => {
                                    const projTasks = tasks.filter(t => (t.project?._id || t.project) === project._id);
                                    const doneCount = projTasks.filter(t => t.status === "completed").length;
                                    const pct = projTasks.length === 0 ? 0 : Math.round((doneCount / projTasks.length) * 100);
                                    return (
                                        <div
                                            className="project-card-interactive"
                                            key={project._id}
                                            onClick={() => {
                                                setSelectedProjectId(project._id);
                                                setActiveTab("projects");
                                            }}
                                            title="Click to open full project details"
                                        >
                                            <div className="project-card-top-row">
                                                <div className="project-title-icon-group">
                                                    <span className="project-folder-icon">📁</span>
                                                    <h3>{project.name}</h3>
                                                </div>
                                                <span className="project-tasks-counter-pill">{projTasks.length} tasks</span>
                                            </div>
                                            <p className="project-card-desc">{project.description || "No description provided."}</p>
                                            <div className="project-card-footer-progress">
                                                <div className="project-progress-track">
                                                    <div className="project-progress-bar-fill" style={{ width: `${pct}%` }} />
                                                </div>
                                                <div className="project-progress-label-row">
                                                    <span>{pct}% complete</span>
                                                    <span>{doneCount}/{projTasks.length} done</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="panel">
                            <h2>Recent Tasks ({tasks.length})</h2>
                            <div className="task-list">
                                {tasks.slice(0, 4).map(task => {
                                    const dueInfo = getDueDateStatus(task.dueDate, task.status);
                                    return (
                                        <div className={`task-card status-border-${task.status} ${dueInfo.isOverdue ? "card-overdue" : ""} ${dueInfo.type === "today" ? "card-due-today" : ""}`} key={task._id}>
                                            <div className="task-main-info">
                                                <h3>{task.title}</h3>
                                                <p>{task.description}</p>
                                                <div className="task-meta-tags">
                                                    <span className={`tag priority-${task.priority}`}>
                                                        <span className={`priority-dot dot-${task.priority}`} />
                                                        {task.priority === "high" ? "High" : task.priority === "medium" ? "Medium" : "Low"}
                                                    </span>
                                                    {task.project && (
                                                        <span className="tag project-tag" title={task.project.name}>
                                                            📁 {task.project.name}
                                                        </span>
                                                    )}
                                                    <span className="tag user-tag" title={task.assignedTo?.email || "Unassigned"}>
                                                        {task.assignedTo ? (
                                                            <>
                                                                <span className="user-mini-avatar">
                                                                    {(task.assignedTo.name ? task.assignedTo.name.substring(0, 1) : "U").toUpperCase()}
                                                                </span>
                                                                <span className="user-mini-name">{task.assignedTo.name}</span>
                                                            </>
                                                        ) : (
                                                            <span style={{ color: "#94a3b8" }}>Unassigned</span>
                                                        )}
                                                    </span>
                                                    {task.createdBy && (
                                                        <span className="tag creator-tag" title={task.createdBy.email}>
                                                            ✍️ {task.createdBy.name}
                                                        </span>
                                                    )}
                                                    {task.dueDate && (
                                                        <span className={`tag date-tag ${dueInfo.badgeClass}`} title={dueInfo.label}>
                                                            {dueInfo.type === "overdue" && <AlertTriangle size={12} />}
                                                            {dueInfo.type === "today" && <Clock size={12} />}
                                                            {dueInfo.type !== "overdue" && dueInfo.type !== "today" && <Calendar size={12} />}
                                                            {dueInfo.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="task-actions">
                                                <button
                                                    type="button"
                                                    className="btn-details"
                                                    onClick={() => openTaskModal(task)}
                                                    title="View History, Comments & Files"
                                                >
                                                    <MessageSquare size={15} /> Details
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-edit-task"
                                                    onClick={() => openEditTaskModal(task)}
                                                    title="Edit Task Details"
                                                >
                                                    <Pencil size={14} /> Edit
                                                </button>
                                                <span className={`badge-status status-${task.status}`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </>
                )}

                {activeTab === "projects" && (() => {
                    const activeProject = selectedProjectId ? projects.find(p => p._id === selectedProjectId) : null;
                    if (activeProject) {
                        const activeProjectTasks = tasks.filter(t => (t.project?._id || t.project) === activeProject._id);
                        const totalCount = activeProjectTasks.length;
                        const doneCount = activeProjectTasks.filter(t => t.status === "completed").length;
                        const progCount = activeProjectTasks.filter(t => t.status === "in-progress").length;
                        const todoCount = activeProjectTasks.filter(t => t.status === "todo").length;
                        const overdueCountInProj = activeProjectTasks.filter(t => isTaskOverdue(t.dueDate, t.status)).length;
                        const completionPct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

                        const contributorMap = new Map();
                        activeProjectTasks.forEach(t => {
                            if (t.assignedTo && t.assignedTo._id) {
                                const id = t.assignedTo._id.toString();
                                if (!contributorMap.has(id)) {
                                    contributorMap.set(id, {
                                        user: t.assignedTo,
                                        total: 0,
                                        done: 0,
                                        prog: 0,
                                        todo: 0
                                    });
                                }
                                const data = contributorMap.get(id);
                                data.total++;
                                if (t.status === "completed") data.done++;
                                else if (t.status === "in-progress") data.prog++;
                                else data.todo++;
                            }
                        });
                        const contributors = Array.from(contributorMap.values());

                        const displayProjectTasks = activeProjectTasks.filter(t => {
                            if (projectTaskFilterStatus !== "all" && t.status !== projectTaskFilterStatus) return false;
                            if (projectTaskFilterPriority !== "all" && t.priority !== projectTaskFilterPriority) return false;
                            if (projectTaskSearch.trim()) {
                                const q = projectTaskSearch.toLowerCase().trim();
                                const inTitle = t.title?.toLowerCase().includes(q);
                                const inDesc = t.description?.toLowerCase().includes(q);
                                const inAssignee = t.assignedTo?.name?.toLowerCase().includes(q) || t.assignedTo?.email?.toLowerCase().includes(q);
                                if (!inTitle && !inDesc && !inAssignee) return false;
                            }
                            return true;
                        });

                        return (
                            <div className="project-detail-view-container">
                                {/* Navigation Breadcrumb & Action Bar */}
                                <div className="project-detail-nav">
                                    <button
                                        type="button"
                                        className="btn-back-projects"
                                        onClick={() => setSelectedProjectId(null)}
                                        title="Return to Projects List"
                                    >
                                        <ArrowLeft size={16} /> All Projects
                                    </button>

                                    <div className="project-header-actions">
                                        <button
                                            type="button"
                                            className="btn-add-project-task"
                                            onClick={() => setShowAddProjectTaskModal(true)}
                                            title="Create a new task specifically for this project"
                                        >
                                            <Plus size={15} /> Add Task to Project
                                        </button>

                                        {canManageProject(activeProject) && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn-edit-project"
                                                    onClick={() => handleOpenEditProjectModal(activeProject)}
                                                    title="Edit Project Name & Description"
                                                >
                                                    <Pencil size={14} /> Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn-delete-project"
                                                    onClick={() => {
                                                        if (window.confirm(`Are you sure you want to delete project "${activeProject.name}" and all its tasks?`)) {
                                                            deleteProject(activeProject._id);
                                                        }
                                                    }}
                                                    title="Delete this project"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Project Hero Header */}
                                <div className="project-hero-card">
                                    <div className="project-hero-main">
                                        <div className="project-hero-icon">
                                            <Folder size={32} />
                                        </div>
                                        <div>
                                            <h2>{activeProject.name}</h2>
                                            <p className="project-hero-desc">
                                                {activeProject.description || "No project description provided."}
                                            </p>
                                            <div className="project-hero-meta">
                                                <span className="hero-meta-item">
                                                    👑 <strong>Owner:</strong> {activeProject.owner?.name || "You"} ({activeProject.owner?.email || ""})
                                                </span>
                                                <span className="hero-meta-item">
                                                    📅 <strong>Created:</strong> {new Date(activeProject.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Big Progress Metric */}
                                    <div className="project-hero-completion">
                                        <div className="completion-number">{completionPct}%</div>
                                        <div className="completion-label">Completed</div>
                                        <div className="completion-subtext">{doneCount} of {totalCount} tasks</div>
                                    </div>
                                </div>

                                {/* Project Metrics Strip */}
                                <div className="project-metrics-grid">
                                    <div className="metric-card">
                                        <span className="metric-label">Total Tasks</span>
                                        <span className="metric-val">{totalCount}</span>
                                    </div>
                                    <div className="metric-card metric-todo">
                                        <span className="metric-label">To Do</span>
                                        <span className="metric-val">{todoCount}</span>
                                    </div>
                                    <div className="metric-card metric-prog">
                                        <span className="metric-label">In Progress</span>
                                        <span className="metric-val">{progCount}</span>
                                    </div>
                                    <div className="metric-card metric-done">
                                        <span className="metric-label">Completed</span>
                                        <span className="metric-val">{doneCount}</span>
                                    </div>
                                    <div className={`metric-card metric-overdue ${overdueCountInProj > 0 ? "has-overdue" : ""}`}>
                                        <span className="metric-label">⚠️ Overdue</span>
                                        <span className="metric-val">{overdueCountInProj}</span>
                                    </div>
                                </div>

                                {/* Visual Multi-Segment Progress Bar */}
                                <div className="project-visual-progress-wrapper">
                                    <div className="progress-bar-legend">
                                        <span className="legend-item"><span className="legend-dot dot-done" /> Completed ({doneCount})</span>
                                        <span className="legend-item"><span className="legend-dot dot-prog" /> In Progress ({progCount})</span>
                                        <span className="legend-item"><span className="legend-dot dot-todo" /> To Do ({todoCount})</span>
                                    </div>
                                    <div className="project-multi-segment-bar">
                                        <div className="segment segment-done" style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }} />
                                        <div className="segment segment-prog" style={{ width: `${totalCount > 0 ? (progCount / totalCount) * 100 : 0}%` }} />
                                        <div className="segment segment-todo" style={{ width: `${totalCount > 0 ? (todoCount / totalCount) * 100 : 0}%` }} />
                                    </div>
                                </div>

                                {/* Project Contributors Section */}
                                {contributors.length > 0 && (
                                    <div className="project-contributors-panel">
                                        <h3><Users size={16} /> Team Contributors on this Project ({contributors.length})</h3>
                                        <div className="contributors-list">
                                            {contributors.map(c => (
                                                <div className="contributor-card" key={c.user._id}>
                                                    <div className="contributor-avatar">
                                                        {(c.user.name ? c.user.name.substring(0, 1) : "U").toUpperCase()}
                                                    </div>
                                                    <div className="contributor-info">
                                                        <span className="contributor-name">{c.user.name}</span>
                                                        <span className="contributor-email">{c.user.email}</span>
                                                        <div className="contributor-stats">
                                                            <span className="stat-pill">{c.total} tasks</span>
                                                            <span className="stat-pill done">{c.done} done</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Project Tasks Panel with View Switcher */}
                                <div className="project-tasks-panel">
                                    <div className="project-tasks-header">
                                        <div className="project-tasks-title">
                                            <h3><ListTodo size={18} /> Tasks in {activeProject.name} ({displayProjectTasks.length})</h3>
                                        </div>

                                        <div className="project-view-modes">
                                            <button
                                                type="button"
                                                className={`btn-view-toggle ${projectDetailViewMode === "list" ? "active" : ""}`}
                                                onClick={() => setProjectDetailViewMode("list")}
                                            >
                                                <ListTodo size={14} /> List View
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn-view-toggle ${projectDetailViewMode === "kanban" ? "active" : ""}`}
                                                onClick={() => setProjectDetailViewMode("kanban")}
                                            >
                                                <Kanban size={14} /> Project Kanban
                                            </button>
                                        </div>
                                    </div>

                                    {/* Project Task Filters */}
                                    <div className="project-filters-bar">
                                        <div className="filter-search-box">
                                            <Search size={15} className="filter-search-icon" />
                                            <input
                                                type="text"
                                                className="filter-search-input"
                                                placeholder={`Search tasks in ${activeProject.name}...`}
                                                value={projectTaskSearch}
                                                onChange={e => setProjectTaskSearch(e.target.value)}
                                            />
                                        </div>

                                        <select
                                            className="filter-select"
                                            value={projectTaskFilterStatus}
                                            onChange={e => setProjectTaskFilterStatus(e.target.value)}
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="todo">To Do</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>

                                        <select
                                            className="filter-select"
                                            value={projectTaskFilterPriority}
                                            onChange={e => setProjectTaskFilterPriority(e.target.value)}
                                        >
                                            <option value="all">All Priorities</option>
                                            <option value="high">High Priority</option>
                                            <option value="medium">Medium Priority</option>
                                            <option value="low">Low Priority</option>
                                        </select>

                                        {(projectTaskSearch || projectTaskFilterStatus !== "all" || projectTaskFilterPriority !== "all") && (
                                            <button
                                                type="button"
                                                className="btn-clear-project-filters"
                                                onClick={() => {
                                                    setProjectTaskSearch("");
                                                    setProjectTaskFilterStatus("all");
                                                    setProjectTaskFilterPriority("all");
                                                }}
                                            >
                                                Reset Filters ✕
                                            </button>
                                        )}
                                    </div>

                                    {/* View Mode: LIST */}
                                    {projectDetailViewMode === "list" && (
                                        <div className="task-list">
                                            {displayProjectTasks.length === 0 ? (
                                                <div className="empty-tasks-state">
                                                    <p>No tasks found matching your filters.</p>
                                                    <button
                                                        type="button"
                                                        className="btn-add-project-task"
                                                        style={{ margin: "12px auto 0" }}
                                                        onClick={() => setShowAddProjectTaskModal(true)}
                                                    >
                                                        <Plus size={14} /> Add First Task to {activeProject.name}
                                                    </button>
                                                </div>
                                            ) : (
                                                displayProjectTasks.map(task => {
                                                    const dueInfo = getDueDateStatus(task.dueDate, task.status);
                                                    return (
                                                        <div className={`task-card status-border-${task.status} ${dueInfo.isOverdue ? "card-overdue" : ""} ${dueInfo.type === "today" ? "card-due-today" : ""}`} key={task._id}>
                                                            <div className="task-main-info">
                                                                <h3>{task.title}</h3>
                                                                <p>{task.description}</p>
                                                                <div className="task-meta-tags">
                                                                    <span className={`tag priority-${task.priority}`}>
                                                                        <span className={`priority-dot dot-${task.priority}`} />
                                                                        {task.priority === "high" ? "High" : task.priority === "medium" ? "Medium" : "Low"}
                                                                    </span>
                                                                    <span className="tag user-tag" title={task.assignedTo?.email || "Unassigned"}>
                                                                        {task.assignedTo ? (
                                                                            <>
                                                                                <span className="user-mini-avatar">
                                                                                    {(task.assignedTo.name ? task.assignedTo.name.substring(0, 1) : "U").toUpperCase()}
                                                                                </span>
                                                                                <span className="user-mini-name">{task.assignedTo.name}</span>
                                                                            </>
                                                                        ) : (
                                                                            <span style={{ color: "#94a3b8" }}>Unassigned</span>
                                                                        )}
                                                                    </span>
                                                                    {task.createdBy && (
                                                                        <span className="tag creator-tag" title={task.createdBy.email}>
                                                                            ✍️ {task.createdBy.name}
                                                                        </span>
                                                                    )}
                                                                    {task.dueDate && (
                                                                        <span className={`tag date-tag ${dueInfo.badgeClass}`} title={dueInfo.label}>
                                                                            {dueInfo.type === "overdue" && <AlertTriangle size={12} />}
                                                                            {dueInfo.type === "today" && <Clock size={12} />}
                                                                            {dueInfo.type !== "overdue" && dueInfo.type !== "today" && <Calendar size={12} />}
                                                                            {dueInfo.label}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="task-actions">
                                                                <button
                                                                    type="button"
                                                                    className="btn-details"
                                                                    onClick={() => openTaskModal(task)}
                                                                    title="View History, Comments & Files"
                                                                >
                                                                    <MessageSquare size={15} /> History & Comments
                                                                </button>

                                                                {task.status !== "completed" && task.assignedTo && !isTaskOverdue(task.dueDate, task.status) && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn-card-remind"
                                                                        onClick={() => handleSendDueReminder(task._id)}
                                                                        disabled={sendingReminderId === task._id}
                                                                        title={`Send due date reminder email to ${task.assignedTo?.name || 'assignee'}`}
                                                                    >
                                                                        <BellRing size={14} /> {sendingReminderId === task._id ? "Sending..." : "Remind"}
                                                                    </button>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    className="btn-edit-task"
                                                                    onClick={() => openEditTaskModal(task)}
                                                                    title="Edit Task Details"
                                                                >
                                                                    <Pencil size={14} /> Edit
                                                                </button>

                                                                <select
                                                                    value={task.status}
                                                                    onChange={e => updateTask(task._id, e.target.value)}
                                                                >
                                                                    <option value="todo">To Do</option>
                                                                    <option value="in-progress">In Progress</option>
                                                                    <option value="completed">Completed</option>
                                                                </select>

                                                                <button
                                                                    className="btn-delete"
                                                                    onClick={() => deleteTask(task._id)}
                                                                    title="Delete Task"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}

                                    {/* View Mode: KANBAN FOR THIS PROJECT */}
                                    {projectDetailViewMode === "kanban" && (
                                        <div className="kanban-board project-embedded-kanban">
                                            {[
                                                { id: "todo", title: "To Do", dotClass: "dot-todo", badgeClass: "badge-kanban-todo" },
                                                { id: "in-progress", title: "In Progress", dotClass: "dot-progress", badgeClass: "badge-kanban-prog" },
                                                { id: "completed", title: "Completed", dotClass: "dot-completed", badgeClass: "badge-kanban-done" }
                                            ].map(col => {
                                                const colTasks = displayProjectTasks.filter(t => t.status === col.id);
                                                return (
                                                    <div
                                                        key={col.id}
                                                        className={`kanban-column ${dragOverCol === col.id ? "drag-over" : ""}`}
                                                        onDragOver={e => handleDragOver(e, col.id)}
                                                        onDragLeave={e => handleDragLeave(e, col.id)}
                                                        onDrop={e => handleDrop(e, col.id)}
                                                    >
                                                        <div className="kanban-column-header">
                                                            <div className="kanban-col-title-area">
                                                                <span className={`kanban-status-dot ${col.dotClass}`} />
                                                                <h3>{col.title}</h3>
                                                            </div>
                                                            <span className={`kanban-col-badge ${col.badgeClass}`}>
                                                                {colTasks.length}
                                                            </span>
                                                        </div>

                                                        <div className="kanban-card-list">
                                                            {colTasks.length === 0 ? (
                                                                <div className="kanban-empty-col">
                                                                    <p>No tasks in {col.title}</p>
                                                                    <span>Drag cards here</span>
                                                                </div>
                                                            ) : (
                                                                colTasks.map(task => {
                                                                    const dueInfo = getDueDateStatus(task.dueDate, task.status);
                                                                    return (
                                                                        <div
                                                                            key={task._id}
                                                                            className={`kanban-card ${dueInfo.isOverdue ? "card-overdue" : ""} ${dueInfo.type === "today" ? "card-due-today" : ""} ${draggedTaskId === task._id ? "dragging" : ""}`}
                                                                            draggable="true"
                                                                            onDragStart={e => handleDragStart(e, task)}
                                                                            onDragEnd={handleDragEnd}
                                                                        >
                                                                            <div className="kanban-card-top">
                                                                                <div className="kanban-card-tags">
                                                                                    <span className={`tag priority-${task.priority}`}>
                                                                                        <span className={`priority-dot dot-${task.priority}`} />
                                                                                        {task.priority === "high" ? "High" : task.priority === "medium" ? "Medium" : "Low"}
                                                                                    </span>
                                                                                    {dueInfo.isOverdue && (
                                                                                        <span className="badge-overdue-chip" title={dueInfo.label}>
                                                                                            <AlertTriangle size={11} /> Overdue
                                                                                        </span>
                                                                                    )}
                                                                                    {dueInfo.type === "today" && (
                                                                                        <span className="badge-today-chip" title={dueInfo.label}>
                                                                                            <Clock size={11} /> Due Today
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="kanban-drag-handle">
                                                                                    <GripVertical size={14} />
                                                                                </div>
                                                                            </div>

                                                                            <h4 className="kanban-card-title">{task.title}</h4>
                                                                            {task.description && (
                                                                                <p className="kanban-card-desc">{task.description}</p>
                                                                            )}

                                                                            <div className="kanban-card-meta">
                                                                                {task.dueDate && (
                                                                                    <span className={`kanban-meta-item due-badge-pill ${dueInfo.badgeClass}`} title={dueInfo.label}>
                                                                                        {dueInfo.isOverdue ? <AlertTriangle size={12} /> : dueInfo.type === "today" ? <Clock size={12} /> : <Calendar size={12} />}
                                                                                        {dueInfo.shortLabel}
                                                                                    </span>
                                                                                )}
                                                                                <span className="kanban-meta-item assignee">
                                                                                    <span className="kanban-assignee-avatar">
                                                                                        {(task.assignedTo?.name ? task.assignedTo.name.substring(0, 1) : "U").toUpperCase()}
                                                                                    </span>
                                                                                    <span className="kanban-assignee-name">
                                                                                        {task.assignedTo?.name || "Unassigned"}
                                                                                    </span>
                                                                                </span>
                                                                            </div>

                                                                            <div className="kanban-card-footer">
                                                                                <div className="kanban-quick-actions">
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn-kanban-action"
                                                                                        onClick={() => openTaskModal(task)}
                                                                                        title="History & Comments"
                                                                                    >
                                                                                        <MessageSquare size={13} />
                                                                                    </button>
                                                                                    {task.status !== "completed" && task.assignedTo && !isTaskOverdue(task.dueDate, task.status) && (
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn-kanban-action remind"
                                                                                            onClick={() => handleSendDueReminder(task._id)}
                                                                                            disabled={sendingReminderId === task._id}
                                                                                            title={`Send due date reminder email to ${task.assignedTo?.name || 'assignee'}`}
                                                                                        >
                                                                                            <BellRing size={13} />
                                                                                        </button>
                                                                                    )}
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn-kanban-action"
                                                                                        onClick={() => openEditTaskModal(task)}
                                                                                        title="Edit Task"
                                                                                    >
                                                                                        <Pencil size={13} />
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn-kanban-action delete"
                                                                                        onClick={() => deleteTask(task._id)}
                                                                                        title="Delete Task"
                                                                                    >
                                                                                        <Trash2 size={13} />
                                                                                    </button>
                                                                                </div>

                                                                                <div className="kanban-move-buttons">
                                                                                    {col.id === "todo" && (
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn-kanban-move next"
                                                                                            onClick={() => quickMoveTask(task, "in-progress")}
                                                                                        >
                                                                                            Start <ArrowRight size={11} />
                                                                                        </button>
                                                                                    )}
                                                                                    {col.id === "in-progress" && (
                                                                                        <>
                                                                                            <button
                                                                                                type="button"
                                                                                                className="btn-kanban-move prev"
                                                                                                onClick={() => quickMoveTask(task, "todo")}
                                                                                            >
                                                                                                To Do
                                                                                            </button>
                                                                                            <button
                                                                                                type="button"
                                                                                                className="btn-kanban-move next done"
                                                                                                onClick={() => quickMoveTask(task, "completed")}
                                                                                            >
                                                                                                Done ✓
                                                                                            </button>
                                                                                        </>
                                                                                    )}
                                                                                    {col.id === "completed" && (
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn-kanban-move prev"
                                                                                            onClick={() => quickMoveTask(task, "in-progress")}
                                                                                        >
                                                                                            Reopen ↺
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div className="projects-directory-container">
                            <section className="panel">
                                <h2><Plus size={20} /> Create Project</h2>
                                <form onSubmit={createProject}>
                                    <input
                                        placeholder="Project name (e.g. Mobile App Redesign)"
                                        value={projectName}
                                        onChange={e => setProjectName(e.target.value)}
                                        required
                                    />
                                    <input
                                        placeholder="Description / Purpose of this project"
                                        value={projectDescription}
                                        onChange={e => setProjectDescription(e.target.value)}
                                    />
                                    <button type="submit">Create Project</button>
                                </form>
                            </section>

                            <section className="panel">
                                <div className="section-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                                    <div className="tasks-title-area">
                                        <h2 style={{ margin: 0 }}>
                                            <Folder size={20} /> Project Directory ({projects.length})
                                        </h2>
                                        <p className="tasks-subtitle">
                                            Select any project to explore its tasks, team contributors, progress, and embedded Kanban board
                                        </p>
                                    </div>
                                </div>

                                <div className="project-grid">
                                    {projects.length === 0 ? (
                                        <div className="empty-tasks-state">
                                            <p>No projects created yet.</p>
                                            <span>Use the form above to create your first project.</span>
                                        </div>
                                    ) : (
                                        projects.map(project => {
                                            const projTasks = tasks.filter(t => (t.project?._id || t.project) === project._id);
                                            const doneCount = projTasks.filter(t => t.status === "completed").length;
                                            const overdueCount = projTasks.filter(t => isTaskOverdue(t.dueDate, t.status)).length;
                                            const pct = projTasks.length === 0 ? 0 : Math.round((doneCount / projTasks.length) * 100);

                                            return (
                                                <div className="project-card-interactive" key={project._id}>
                                                    <div className="project-card-top-row">
                                                        <div className="project-title-icon-group">
                                                            <span className="project-folder-icon">📁</span>
                                                            <h3>{project.name}</h3>
                                                        </div>
                                                        <span className="project-tasks-counter-pill">
                                                            {projTasks.length} {projTasks.length === 1 ? "task" : "tasks"}
                                                        </span>
                                                    </div>

                                                    <p className="project-card-desc">
                                                        {project.description || "No description provided."}
                                                    </p>

                                                    <div className="project-card-owner-info">
                                                        <span>👑 <strong>Owner:</strong> {project.owner?.name || "You"}</span>
                                                        {overdueCount > 0 && (
                                                            <span className="overdue-tag-pill">⚠️ {overdueCount} overdue</span>
                                                        )}
                                                    </div>

                                                    <div className="project-card-footer-progress">
                                                        <div className="project-progress-track">
                                                            <div className="project-progress-bar-fill" style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <div className="project-progress-label-row">
                                                            <span>{pct}% complete</span>
                                                            <span>{doneCount}/{projTasks.length} done</span>
                                                        </div>
                                                    </div>

                                                    <div className="project-card-actions-bar">
                                                        <button
                                                            type="button"
                                                            className="btn-view-project"
                                                            onClick={() => setSelectedProjectId(project._id)}
                                                            title="Open Project Detail View"
                                                        >
                                                            Open Project Details <ArrowRight size={13} />
                                                        </button>

                                                        {canManageProject(project) && (
                                                            <div className="project-card-owner-actions">
                                                                <button
                                                                    type="button"
                                                                    className="btn-proj-icon-action"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOpenEditProjectModal(project);
                                                                    }}
                                                                    title="Edit Project"
                                                                >
                                                                    <Pencil size={13} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn-proj-icon-action delete"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (window.confirm(`Delete project "${project.name}" and all its tasks?`)) {
                                                                            deleteProject(project._id);
                                                                        }
                                                                    }}
                                                                    title="Delete Project"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </section>
                        </div>
                    );
                })()}

                {activeTab === "tasks" && (
                    <>
                        <section className="panel">
                            <h2><Plus size={20} /> Create Task</h2>

                            <form onSubmit={createTask}>
                                <input
                                    placeholder="Task title"
                                    value={taskTitle}
                                    onChange={e => setTaskTitle(e.target.value)}
                                    required
                                />

                                <input
                                    placeholder="Task description"
                                    value={taskDescription}
                                    onChange={e => setTaskDescription(e.target.value)}
                                />

                                <select
                                    value={taskProject}
                                    onChange={e => setTaskProject(e.target.value)}
                                    required
                                >
                                    <option value="">Select Project</option>

                                    {projects.map(project => (
                                        <option
                                            key={project._id}
                                            value={project._id}
                                        >
                                            {project.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={taskPriority}
                                    onChange={e => setTaskPriority(e.target.value)}
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>

                                <div className="assign-field-container">
                                    <div className="assign-header-row">
                                        <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>
                                            Assign To
                                        </label>
                                        <button
                                            type="button"
                                            className="btn-toggle-assign"
                                            onClick={() => setIsAddingNewEmail(!isAddingNewEmail)}
                                        >
                                            {isAddingNewEmail ? (
                                                <>
                                                    <Users size={13} /> Select from team list
                                                </>
                                            ) : (
                                                <>
                                                    <Mail size={13} /> Enter new email directly
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {!isAddingNewEmail ? (
                                        <select
                                            value={taskAssignedTo}
                                            onChange={e => setTaskAssignedTo(e.target.value)}
                                        >
                                            <option value="">Assign To (Optional)</option>
                                            {users.map(u => (
                                                <option key={u._id} value={u._id}>
                                                    {u.name} ({u.email})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="new-email-box">
                                            <input
                                                type="text"
                                                placeholder="Recipient Name (e.g. Rohan)"
                                                value={newAssigneeName}
                                                onChange={e => setNewAssigneeName(e.target.value)}
                                            />
                                            <input
                                                type="email"
                                                placeholder="Recipient Email (e.g. rohan.runtime2408@gmail.com)"
                                                value={newAssigneeEmail}
                                                onChange={e => setNewAssigneeEmail(e.target.value)}
                                                required={isAddingNewEmail}
                                            />
                                            <p className="field-hint">
                                                📧 A task notification will be sent directly to this email address!
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="create-task-date-field">
                                    <input
                                        type="date"
                                        value={taskDueDate}
                                        onChange={e => setTaskDueDate(e.target.value)}
                                    />
                                    {taskDueDate && (
                                        <div className={`date-input-hint ${getDueDateStatus(taskDueDate, "todo").badgeClass}`}>
                                            {getDueDateStatus(taskDueDate, "todo").label}
                                        </div>
                                    )}
                                </div>

                                <button type="submit">Create Task</button>
                            </form>
                        </section>

                        <section className="panel">
                            {/* Header for Tasks List */}
                            <div className="tasks-header-bar">
                                <div className="tasks-title-area">
                                    <h2>
                                        <ListTodo size={20} /> My Tasks ({filteredTasks.length})
                                    </h2>
                                    <p className="tasks-subtitle">
                                        View and manage all your tasks across projects
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="btn-switch-tab"
                                    onClick={() => setActiveTab("kanban")}
                                    title="Open Visual Kanban Board"
                                >
                                    <Kanban size={15} /> Open Kanban Board →
                                </button>
                            </div>

                            {/* Filters Toolbar */}
                            {renderFilterToolbar(true)}

                            <div className="task-list">
                                {filteredTasks.length === 0 ? (
                                    <div className="empty-tasks-state">
                                        <div className="empty-icon" style={{ marginBottom: "8px", color: "#94a3b8" }}><Search size={28} /></div>
                                        <h4>No tasks match your filter criteria</h4>
                                        <p>Try searching for different keywords or clearing active filters.</p>
                                        {isAnyFilterActive && (
                                            <button
                                                type="button"
                                                className="btn-reset-filters"
                                                onClick={resetAllFilters}
                                                style={{ marginTop: "12px" }}
                                            >
                                                Clear All Filters ✕
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    filteredTasks.map(task => {
                                        const dueInfo = getDueDateStatus(task.dueDate, task.status);
                                        return (
                                            <div className={`task-card status-border-${task.status} ${dueInfo.isOverdue ? "card-overdue" : ""} ${dueInfo.type === "today" ? "card-due-today" : ""}`} key={task._id}>
                                                <div className="task-main-info">
                                                    <h3>{task.title}</h3>
                                                    <p>{task.description}</p>
                                                    <div className="task-meta-tags">
                                                        <span className={`tag priority-${task.priority}`}>
                                                            <span className={`priority-dot dot-${task.priority}`} />
                                                            {task.priority === "high" ? "High" : task.priority === "medium" ? "Medium" : "Low"}
                                                        </span>
                                                        {task.project && (
                                                            <span className="tag project-tag" title={task.project.name}>
                                                                📁 {task.project.name}
                                                            </span>
                                                        )}
                                                        <span className="tag user-tag" title={task.assignedTo?.email || "Unassigned"}>
                                                            {task.assignedTo ? (
                                                                <>
                                                                    <span className="user-mini-avatar">
                                                                        {(task.assignedTo.name ? task.assignedTo.name.substring(0, 1) : "U").toUpperCase()}
                                                                    </span>
                                                                    <span className="user-mini-name">{task.assignedTo.name}</span>
                                                                </>
                                                            ) : (
                                                                <span style={{ color: "#94a3b8" }}>Unassigned</span>
                                                            )}
                                                        </span>
                                                        {task.createdBy && (
                                                            <span className="tag creator-tag" title={task.createdBy.email}>
                                                                ✍️ {task.createdBy.name}
                                                            </span>
                                                        )}
                                                        {task.dueDate && (
                                                            <span className={`tag date-tag ${dueInfo.badgeClass}`} title={dueInfo.label}>
                                                                {dueInfo.type === "overdue" && <AlertTriangle size={12} />}
                                                                {dueInfo.type === "today" && <Clock size={12} />}
                                                                {dueInfo.type !== "overdue" && dueInfo.type !== "today" && <Calendar size={12} />}
                                                                {dueInfo.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                            <div className="task-actions">
                                                <button
                                                    type="button"
                                                    className="btn-details"
                                                    onClick={() => openTaskModal(task)}
                                                    title="View History, Comments & Files"
                                                >
                                                    <MessageSquare size={15} /> History & Comments
                                                </button>

                                                {task.status !== "completed" && task.assignedTo && !isTaskOverdue(task.dueDate, task.status) && (
                                                    <button
                                                        type="button"
                                                        className="btn-card-remind"
                                                        onClick={() => handleSendDueReminder(task._id)}
                                                        disabled={sendingReminderId === task._id}
                                                        title={`Send due date reminder email to ${task.assignedTo?.name || 'assignee'}`}
                                                    >
                                                        <BellRing size={14} /> {sendingReminderId === task._id ? "Sending..." : "Remind"}
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="btn-edit-task"
                                                    onClick={() => openEditTaskModal(task)}
                                                    title="Edit Task Details"
                                                >
                                                    <Pencil size={14} /> Edit
                                                </button>

                                                <select
                                                    value={task.status}
                                                    onChange={e =>
                                                        updateTask(
                                                            task._id,
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="todo">To Do</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                </select>

                                                <button
                                                    className="btn-delete"
                                                    onClick={() => deleteTask(task._id)}
                                                    title="Delete Task"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }))}
                            </div>
                        </section>
                    </>
                )}

                {activeTab === "kanban" && (
                    <>
                        <section className="panel tasks-main-panel">
                            {/* Header for pure Kanban Board */}
                            <div className="tasks-header-bar">
                                <div className="tasks-title-area">
                                    <h2>
                                        <Kanban size={20} /> Kanban Board ({filteredTasks.length})
                                    </h2>
                                    <p className="tasks-subtitle">
                                        Drag and drop task cards between columns to update their progress instantly
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="btn-switch-tab"
                                    onClick={() => setActiveTab("tasks")}
                                    title="Go to Tasks page to create new tasks"
                                >
                                    <Plus size={15} /> + Create Task
                                </button>
                            </div>

                            {/* Filters Toolbar */}
                            {renderFilterToolbar(false)}

                            {/* Kanban Board */}
                            <div className="kanban-board">
                                    {[
                                        {
                                            id: "todo",
                                            title: "To Do",
                                            dotClass: "dot-todo",
                                            badgeClass: "badge-kanban-todo",
                                            emptyText: "No tasks to do",
                                            emptyHint: "Drag cards here or create a new task above"
                                        },
                                        {
                                            id: "in-progress",
                                            title: "In Progress",
                                            dotClass: "dot-progress",
                                            badgeClass: "badge-kanban-prog",
                                            emptyText: "No active tasks in progress",
                                            emptyHint: "Drag cards here when work begins"
                                        },
                                        {
                                            id: "completed",
                                            title: "Completed",
                                            dotClass: "dot-completed",
                                            badgeClass: "badge-kanban-done",
                                            emptyText: "No completed tasks yet",
                                            emptyHint: "Drag finished cards here"
                                        }
                                    ].map(col => {
                                        const colTasks = filteredTasks.filter(t => t.status === col.id);

                                        return (
                                            <div
                                                key={col.id}
                                                className={`kanban-column ${dragOverCol === col.id ? "drag-over" : ""}`}
                                                onDragOver={e => handleDragOver(e, col.id)}
                                                onDragLeave={e => handleDragLeave(e, col.id)}
                                                onDrop={e => handleDrop(e, col.id)}
                                            >
                                                <div className="kanban-column-header">
                                                    <div className="kanban-col-left">
                                                        <span className={`kanban-status-dot ${col.dotClass}`} />
                                                        <span className="kanban-col-title">{col.title}</span>
                                                    </div>
                                                    <span className={`kanban-col-badge ${col.badgeClass}`}>
                                                        {colTasks.length}
                                                    </span>
                                                </div>

                                                <div className="kanban-card-list">
                                                    {colTasks.length === 0 ? (
                                                        <div className="kanban-empty-col">
                                                            <p>{col.emptyText}</p>
                                                            <span>{col.emptyHint}</span>
                                                        </div>
                                                    ) : (
                                                        colTasks.map(task => {
                                                            const dueInfo = getDueDateStatus(task.dueDate, task.status);
                                                            return (
                                                            <div
                                                                key={task._id}
                                                                className={`kanban-card ${dueInfo.isOverdue ? "card-overdue" : ""} ${dueInfo.type === "today" ? "card-due-today" : ""} ${draggedTaskId === task._id ? "dragging" : ""}`}
                                                                draggable="true"
                                                                onDragStart={e => handleDragStart(e, task)}
                                                                onDragEnd={handleDragEnd}
                                                            >
                                                                <div className="kanban-card-top">
                                                                    <div className="kanban-card-tags">
                                                                        <span className={`tag priority-${task.priority}`}>
                                                                            <span className={`priority-dot dot-${task.priority}`} />
                                                                            {task.priority === "high" ? "High" : task.priority === "medium" ? "Medium" : "Low"}
                                                                        </span>
                                                                        {task.project && (
                                                                            <span className="tag project-tag" title={task.project.name}>
                                                                                📁 {task.project.name}
                                                                            </span>
                                                                        )}
                                                                        {dueInfo.isOverdue && (
                                                                            <span className="badge-overdue-chip" title={dueInfo.label}>
                                                                                <AlertTriangle size={11} /> Overdue
                                                                            </span>
                                                                        )}
                                                                        {dueInfo.type === "today" && (
                                                                            <span className="badge-today-chip" title={dueInfo.label}>
                                                                                <Clock size={11} /> Due Today
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="kanban-drag-handle" title="Drag to move card">
                                                                        <GripVertical size={14} />
                                                                    </div>
                                                                </div>

                                                                <h4 className="kanban-card-title">{task.title}</h4>

                                                                {task.description && (
                                                                    <p className="kanban-card-desc">{task.description}</p>
                                                                )}

                                                                <div className="kanban-card-meta">
                                                                    {task.dueDate && (
                                                                        <span
                                                                            className={`kanban-meta-item due-badge-pill ${dueInfo.badgeClass}`}
                                                                            title={dueInfo.label}
                                                                        >
                                                                            {dueInfo.isOverdue ? (
                                                                                <AlertTriangle size={12} />
                                                                            ) : dueInfo.type === "today" ? (
                                                                                <Clock size={12} />
                                                                            ) : (
                                                                                <Calendar size={12} />
                                                                            )}
                                                                            {dueInfo.shortLabel}
                                                                        </span>
                                                                    )}

                                                                    <span
                                                                        className="kanban-meta-item assignee"
                                                                        title={task.assignedTo?.email ? `Assigned to: ${task.assignedTo.email}` : "Unassigned"}
                                                                    >
                                                                        <span className="kanban-assignee-avatar">
                                                                            {(task.assignedTo?.name ? task.assignedTo.name.substring(0, 1) : "U").toUpperCase()}
                                                                        </span>
                                                                        <span className="kanban-assignee-name">
                                                                            {task.assignedTo?.name || "Unassigned"}
                                                                        </span>
                                                                    </span>
                                                                </div>

                                                                <div className="kanban-card-footer">
                                                                    <div className="kanban-quick-actions">
                                                                        <button
                                                                            type="button"
                                                                            className="btn-kanban-action"
                                                                            onClick={() => openTaskModal(task)}
                                                                            title="View History, Comments & Files"
                                                                        >
                                                                            <MessageSquare size={13} />
                                                                        </button>
                                                                        {task.status !== "completed" && task.assignedTo && !isTaskOverdue(task.dueDate, task.status) && (
                                                                            <button
                                                                                type="button"
                                                                                className="btn-kanban-action remind"
                                                                                onClick={() => handleSendDueReminder(task._id)}
                                                                                disabled={sendingReminderId === task._id}
                                                                                title={`Send due date reminder email to ${task.assignedTo?.name || 'assignee'}`}
                                                                            >
                                                                                <BellRing size={13} />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            className="btn-kanban-action"
                                                                            onClick={() => openEditTaskModal(task)}
                                                                            title="Edit Task Details"
                                                                        >
                                                                            <Pencil size={13} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn-kanban-action delete"
                                                                            onClick={() => deleteTask(task._id)}
                                                                            title="Delete Task"
                                                                        >
                                                                            <Trash2 size={13} />
                                                                        </button>
                                                                    </div>

                                                                    <div className="kanban-move-buttons">
                                                                        {col.id === "todo" && (
                                                                            <button
                                                                                type="button"
                                                                                className="btn-kanban-move next"
                                                                                onClick={() => quickMoveTask(task, "in-progress")}
                                                                                title="Move to In Progress"
                                                                            >
                                                                                Start <ArrowRight size={11} />
                                                                            </button>
                                                                        )}
                                                                        {col.id === "in-progress" && (
                                                                            <>
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn-kanban-move prev"
                                                                                    onClick={() => quickMoveTask(task, "todo")}
                                                                                    title="Move back to To Do"
                                                                                >
                                                                                    To Do
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn-kanban-move next done"
                                                                                    onClick={() => quickMoveTask(task, "completed")}
                                                                                    title="Mark as Completed"
                                                                                >
                                                                                    Done ✓
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                        {col.id === "completed" && (
                                                                            <button
                                                                                type="button"
                                                                                className="btn-kanban-move prev"
                                                                                onClick={() => quickMoveTask(task, "in-progress")}
                                                                                title="Reopen to In Progress"
                                                                            >
                                                                                Reopen ↺
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                        </section>
                    </>
                )}

                {activeTab === "team" && (
                    <>
                        {/* Current Logged-in User Session Callout */}
                        <div className="current-user-session-banner">
                            <div className="session-left">
                                <span className="session-indicator">●</span>
                                <span>
                                    Currently viewing as: <strong>{user.name}</strong> (<code>{user.email}</code>)
                                </span>
                            </div>
                            <div className="session-roles">
                                <span className="session-label">Your Account:</span>
                                {user.role === "admin" && (
                                    <span className="badge-role badge-role-admin">
                                        <ShieldCheck size={12} /> 👑 Admin
                                    </span>
                                )}
                                {user.role === "manager" && (
                                    <span className="badge-role badge-role-manager">
                                        <ShieldCheck size={12} /> 👔 Manager
                                    </span>
                                )}
                                {getOwnedProjects(user._id).length > 0 && (
                                    <span className="badge-role badge-role-owner">
                                        <Briefcase size={12} /> 📁 Project Owner ({getOwnedProjects(user._id).length})
                                    </span>
                                )}
                                {user.role === "member" && getOwnedProjects(user._id).length === 0 && (
                                    <span className="badge-role badge-role-member">
                                        <Users size={12} /> 👤 Member
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="team-stats">
                            <div className="stat">
                                <h3>Total Members</h3>
                                <h1>{users.length}</h1>
                            </div>
                            <div className="stat">
                                <h3>Admins</h3>
                                <h1>{users.filter(u => u.role === "admin").length}</h1>
                            </div>
                            <div className="stat">
                                <h3>Project Owners</h3>
                                <h1>{users.filter(u => getOwnedProjects(u._id).length > 0).length}</h1>
                            </div>
                            <div className="stat">
                                <h3>Active Tasks</h3>
                                <h1>{tasks.filter(t => t.status !== "completed").length}</h1>
                            </div>
                        </div>

                        {/* Controls Bar: Search & Role Filters */}
                        <div className="team-controls-bar">
                            <div className="team-search-box">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search members by name or email..."
                                    value={teamSearch}
                                    onChange={e => setTeamSearch(e.target.value)}
                                />
                            </div>

                            <div className="team-filter-pills">
                                <button
                                    type="button"
                                    className={`team-pill ${teamFilter === "all" ? "active" : ""}`}
                                    onClick={() => setTeamFilter("all")}
                                >
                                    All ({users.length})
                                </button>
                                <button
                                    type="button"
                                    className={`team-pill ${teamFilter === "admin" ? "active" : ""}`}
                                    onClick={() => setTeamFilter("admin")}
                                >
                                    👑 Admins ({users.filter(u => u.role === "admin").length})
                                </button>
                                <button
                                    type="button"
                                    className={`team-pill ${teamFilter === "owner" ? "active" : ""}`}
                                    onClick={() => setTeamFilter("owner")}
                                >
                                    📁 Project Owners ({users.filter(u => getOwnedProjects(u._id).length > 0).length})
                                </button>
                                <button
                                    type="button"
                                    className={`team-pill ${teamFilter === "member" ? "active" : ""}`}
                                    onClick={() => setTeamFilter("member")}
                                >
                                    👤 Members ({users.filter(u => u.role === "member").length})
                                </button>
                            </div>
                        </div>

                        {/* Member Cards Grid */}
                        <div className="team-grid">
                            {users
                                .filter(u => {
                                    const q = teamSearch.toLowerCase().trim();
                                    const matchesSearch = !q || 
                                        (u.name && u.name.toLowerCase().includes(q)) || 
                                        (u.email && u.email.toLowerCase().includes(q));
                                    if (!matchesSearch) return false;

                                    const owned = getOwnedProjects(u._id);
                                    if (teamFilter === "admin") return u.role === "admin";
                                    if (teamFilter === "owner") return owned.length > 0;
                                    if (teamFilter === "member") return u.role === "member";
                                    return true;
                                })
                                .map(u => {
                                    const ownedProjects = getOwnedProjects(u._id);
                                    const userTasks = getUserTasks(u._id, u.email);
                                    const todoCount = userTasks.filter(t => t.status === "todo").length;
                                    const progCount = userTasks.filter(t => t.status === "in-progress").length;
                                    const doneCount = userTasks.filter(t => t.status === "completed").length;
                                    const totalCount = userTasks.length;

                                    const donePct = totalCount ? (doneCount / totalCount) * 100 : 0;
                                    const progPct = totalCount ? (progCount / totalCount) * 100 : 0;
                                    const todoPct = totalCount ? (todoCount / totalCount) * 100 : 0;

                                    const initials = (u.name 
                                        ? u.name.trim().split(" ").map(w => w[0]).join("").substring(0, 2) 
                                        : u.email.substring(0, 2)
                                    ).toUpperCase();

                                    const avatarClass = u.role === "admin" ? "admin" : (ownedProjects.length > 0 ? "owner" : "");

                                    const isCurrentUser = (u._id && user._id && String(u._id) === String(user._id)) || 
                                                          (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase());

                                    return (
                                        <div className={`member-card ${isCurrentUser ? "current-user-card" : ""}`} key={u._id}>
                                            <div className="member-card-header">
                                                <div className={`member-avatar ${avatarClass}`}>
                                                    {initials}
                                                </div>
                                                <div className="member-identity">
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "3px" }}>
                                                        <h3 className="member-name" style={{ margin: 0 }}>{u.name}</h3>
                                                        {isCurrentUser && (
                                                            <span className="badge-current-user">
                                                                📍 You (Logged In)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="member-email" title={u.email}>{u.email}</p>
                                                    <div className="member-badges">
                                                        {u.role === "admin" && (
                                                            <span className="badge-role badge-role-admin">
                                                                <ShieldCheck size={12} /> 👑 Admin
                                                            </span>
                                                        )}
                                                        {u.role === "manager" && (
                                                            <span className="badge-role badge-role-manager">
                                                                <ShieldCheck size={12} /> 👔 Manager
                                                            </span>
                                                        )}
                                                        {ownedProjects.length > 0 && (
                                                            <span className="badge-role badge-role-owner">
                                                                <Briefcase size={12} /> 📁 Project Owner ({ownedProjects.length})
                                                            </span>
                                                        )}
                                                        {u.role === "member" && ownedProjects.length === 0 && (
                                                            <span className="badge-role badge-role-member">
                                                                <Users size={12} /> 👤 Member
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Projects Owned */}
                                            {ownedProjects.length > 0 && (
                                                <div className="member-section">
                                                    <div className="member-section-label">
                                                        <FolderKanban size={13} /> Projects Owned ({ownedProjects.length})
                                                    </div>
                                                    <div className="member-projects-list">
                                                        {ownedProjects.map(p => (
                                                            <span key={p._id} className="project-pill-tag">
                                                                📁 {p.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Workload / Task Distribution */}
                                            <div className="member-section">
                                                <div className="member-workload-stats">
                                                    <span className="workload-total">
                                                        {totalCount} {totalCount === 1 ? "Assigned Task" : "Assigned Tasks"}
                                                    </span>
                                                    <div className="workload-tags">
                                                        <span className="workload-tag workload-todo">{todoCount} To Do</span>
                                                        <span className="workload-tag workload-prog">{progCount} Active</span>
                                                        <span className="workload-tag workload-done">{doneCount} Done</span>
                                                    </div>
                                                </div>

                                                {totalCount > 0 ? (
                                                    <div className="workload-progress-bar" title={`${doneCount} Done, ${progCount} In Progress, ${todoCount} To Do`}>
                                                        <div className="progress-segment-done" style={{ width: `${donePct}%` }} />
                                                        <div className="progress-segment-prog" style={{ width: `${progPct}%` }} />
                                                        <div className="progress-segment-todo" style={{ width: `${todoPct}%` }} />
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
                                                        No tasks currently assigned
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer Action */}
                                            <div className="member-card-footer">
                                                {u._id !== user?._id && (
                                                    <button
                                                        type="button"
                                                        className="btn-delete-member"
                                                        onClick={() => deleteMember(u)}
                                                        title={`Remove ${u.name} from the team`}
                                                    >
                                                        <Trash2 size={13} /> Remove
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="btn-assign-quick"
                                                    onClick={() => handleAssignTaskToUser(u._id)}
                                                    title={`Assign a new task to ${u.name}`}
                                                    style={{ marginLeft: u._id === user?._id ? "auto" : "0" }}
                                                >
                                                    <ListTodo size={14} /> Assign Task <ArrowRight size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </>
                )}

            </main>

            {/* Top Floating Notification Toast */}
            {message && (
                <div className="toast-notification" onClick={() => setMessage("")}>
                    <div className="toast-icon">
                        <CheckCircle2 size={18} />
                    </div>
                    <span className="toast-text">{message}</span>
                    <button
                        type="button"
                        className="toast-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            setMessage("");
                        }}
                        title="Dismiss notification"
                    >
                        <X size={15} />
                    </button>
                </div>
            )}

            {/* Task Details Modal: Comments, Activity Log & Attachments */}
            {selectedTask && (
                <div className="modal-backdrop" onClick={closeTaskModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>{selectedTask.title}</h2>
                                <p className="modal-subtitle">
                                    Project: <strong>{selectedTask.project?.name || "General"}</strong>
                                </p>
                                <div className="modal-task-meta-pills">
                                    <span className={`tag priority-${selectedTask.priority}`}>
                                        {selectedTask.priority === "high" ? "🔴 High Priority" : selectedTask.priority === "medium" ? "🟡 Medium Priority" : "🟢 Low Priority"}
                                    </span>
                                    <span className={`tag tag-status status-${selectedTask.status}`}>
                                        {STATUS_LABELS[selectedTask.status] || selectedTask.status}
                                    </span>
                                    {selectedTask.dueDate && (() => {
                                        const dueInfo = getDueDateStatus(selectedTask.dueDate, selectedTask.status);
                                        return (
                                            <span className={`tag date-tag ${dueInfo.badgeClass}`} title={dueInfo.label}>
                                                {dueInfo.type === "overdue" && <AlertTriangle size={12} />}
                                                {dueInfo.type === "today" && <Clock size={12} />}
                                                {dueInfo.type !== "overdue" && dueInfo.type !== "today" && <Calendar size={12} />}
                                                {dueInfo.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                                <div className="modal-email-badges">
                                    <span className="email-badge">
                                        👤 <strong>Assigned to:</strong> {selectedTask.assignedTo ? `${selectedTask.assignedTo.name} (${selectedTask.assignedTo.email})` : "Unassigned"}
                                    </span>
                                    <span className="email-badge">
                                        ✍️ <strong>Created by:</strong> {selectedTask.createdBy ? `${selectedTask.createdBy.name} (${selectedTask.createdBy.email})` : "Unknown"}
                                    </span>
                                </div>
                            </div>
                            <div className="modal-header-actions">
                                {selectedTask.status !== "completed" && selectedTask.assignedTo && !isTaskOverdue(selectedTask.dueDate, selectedTask.status) && (
                                    <button
                                        type="button"
                                        className="btn-modal-remind"
                                        onClick={() => handleSendDueReminder(selectedTask._id)}
                                        disabled={sendingReminderId === selectedTask._id}
                                        title={`Send due date reminder email to ${selectedTask.assignedTo.name || 'assignee'}`}
                                    >
                                        <BellRing size={14} />
                                        {sendingReminderId === selectedTask._id ? "Sending..." : "Send Reminder"}
                                    </button>
                                )}
                                <button className="btn-close" onClick={closeTaskModal}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="email-info-banner">
                            <span className="email-info-title">📬 Email Routing for this task:</span>
                            <div className="email-info-rules">
                                <span>• <strong>On Due Date (Today):</strong> Emails Assignee <code>{selectedTask.assignedTo?.email || "Unassigned"}</code></span>
                                <span>• <strong>Overdue Tasks:</strong> 🚫 No emails sent (emails are sent only when due)</span>
                                <span>• <strong>On Completion:</strong> Emails Creator <code>{selectedTask.createdBy?.email || "N/A"}</code></span>
                                <span>• <strong>On Comments:</strong> Emails Creator & Assignee</span>
                            </div>
                        </div>

                        <div className="modal-tabs">
                            <button
                                type="button"
                                className={`modal-tab ${modalTab === "activity" ? "active" : ""}`}
                                onClick={() => setModalTab("activity")}
                            >
                                <History size={16} /> Activity ({taskActivities.length})
                            </button>
                            <button
                                type="button"
                                className={`modal-tab ${modalTab === "comments" ? "active" : ""}`}
                                onClick={() => setModalTab("comments")}
                            >
                                <MessageSquare size={16} /> Comments ({taskComments.length})
                            </button>
                            <button
                                type="button"
                                className={`modal-tab ${modalTab === "attachments" ? "active" : ""}`}
                                onClick={() => setModalTab("attachments")}
                            >
                                <Paperclip size={16} /> Attachments ({taskAttachments.length})
                            </button>
                        </div>

                        <div className="modal-body">
                            {loadingDetails ? (
                                <div className="loading-state">Loading details...</div>
                            ) : (
                                <>
                                    {/* ACTIVITY TAB */}
                                    {modalTab === "activity" && (
                                        <div className="activity-list">
                                            {taskActivities.length === 0 ? (
                                                <div className="empty-state">
                                                    <History size={36} color="#94a3b8" />
                                                    <p>No activity recorded yet for this task.</p>
                                                    <span>(Activities are recorded when status, priority, or assignee is updated)</span>
                                                </div>
                                            ) : (
                                                taskActivities.map(act => (
                                                    <div className="activity-item" key={act._id}>
                                                        <div className="activity-icon">
                                                            <Clock size={16} />
                                                        </div>
                                                        <div className="activity-info">
                                                            <p className="activity-text">
                                                                <strong>{act.user?.name || "User"}</strong> {act.action}:{" "}
                                                                <span className="old-val">{act.oldValue}</span> → <span className="new-val">{act.newValue}</span>
                                                            </p>
                                                            <span className="activity-time">
                                                                {new Date(act.createdAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {/* COMMENTS TAB */}
                                    {modalTab === "comments" && (
                                        <div className="comments-container">
                                            <div className="comments-list">
                                                {taskComments.length === 0 ? (
                                                    <div className="empty-state">
                                                        <MessageSquare size={36} color="#94a3b8" />
                                                        <p>No comments yet. Start the conversation!</p>
                                                    </div>
                                                ) : (
                                                    taskComments.map(c => (
                                                        <div className="comment-card" key={c._id}>
                                                            <div className="comment-header">
                                                                <strong>{c.user?.name || "User"}</strong>
                                                                <span>{new Date(c.createdAt).toLocaleString()}</span>
                                                            </div>
                                                            <p className="comment-text">{c.text}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            <form className="comment-form" onSubmit={handleAddComment}>
                                                <input
                                                    placeholder="Write a comment..."
                                                    value={newCommentText}
                                                    onChange={e => setNewCommentText(e.target.value)}
                                                    required
                                                />
                                                <button type="submit" className="btn-send">
                                                    <Send size={16} /> Send
                                                </button>
                                            </form>
                                        </div>
                                    )}

                                    {/* ATTACHMENTS TAB */}
                                    {modalTab === "attachments" && (
                                        <div className="attachments-container">
                                            <form className="attachment-upload-form" onSubmit={handleUploadAttachment}>
                                                <div className="file-input-wrapper">
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        onChange={e => setSelectedFile(e.target.files[0] || null)}
                                                        accept=".ppt,.pptx,.pdf,.png,.jpg,.jpeg,.docx,.xlsx,.txt,.csv,.json,.zip"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="btn-upload"
                                                    disabled={!selectedFile || uploadingFile}
                                                >
                                                    <Upload size={16} /> {uploadingFile ? "Uploading..." : "Upload File"}
                                                </button>
                                            </form>

                                            <div className="attachments-list">
                                                {taskAttachments.length === 0 ? (
                                                    <div className="empty-state">
                                                        <Paperclip size={36} color="#94a3b8" />
                                                        <p>No attachments yet.</p>
                                                        <span>Upload PowerPoint decks, PDFs, images, or documents to this task.</span>
                                                    </div>
                                                ) : (
                                                    taskAttachments.map(att => (
                                                        <div className="attachment-card" key={att._id}>
                                                            <div className="attachment-icon">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div className="attachment-details">
                                                                <span className="attachment-name" title={att.originalName}>
                                                                    {att.originalName}
                                                                </span>
                                                                <span className="attachment-meta">
                                                                    {formatFileSize(att.size)} • Uploaded by {att.uploadedBy?.name || "User"} • {new Date(att.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div className="attachment-actions">
                                                                <button
                                                                    type="button"
                                                                    className="btn-att-action btn-download"
                                                                    onClick={() => handleDownloadAttachment(att)}
                                                                    title="Download file"
                                                                >
                                                                    <Download size={15} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn-att-action btn-att-delete"
                                                                    onClick={() => handleDeleteAttachment(att._id)}
                                                                    title="Delete file"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Task Modal */}
            {editingTask && (
                <div className="modal-backdrop" onClick={closeEditTaskModal}>
                    <div className="modal-content edit-task-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Edit Task</h2>
                                <p className="modal-subtitle">
                                    Project: <strong>{editingTask.project?.name || "General"}</strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={closeEditTaskModal}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTaskEdit} className="edit-task-form">
                            <div className="edit-form-field">
                                <label>Task Title *</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    placeholder="Task title"
                                    required
                                />
                            </div>

                            <div className="edit-form-field">
                                <label>Description</label>
                                <textarea
                                    rows={3}
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    placeholder="Task description"
                                />
                            </div>

                            <div className="edit-form-row">
                                <div className="edit-form-field">
                                    <label>Priority</label>
                                    <select
                                        value={editPriority}
                                        onChange={e => setEditPriority(e.target.value)}
                                    >
                                        <option value="low">Low Priority</option>
                                        <option value="medium">Medium Priority</option>
                                        <option value="high">High Priority</option>
                                    </select>
                                </div>

                                <div className="edit-form-field">
                                    <label>Status</label>
                                    <select
                                        value={editStatus}
                                        onChange={e => setEditStatus(e.target.value)}
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="edit-form-row">
                                <div className="edit-form-field">
                                    <label>Due Date</label>
                                    <input
                                        type="date"
                                        value={editDueDate}
                                        onChange={e => setEditDueDate(e.target.value)}
                                    />
                                    {editDueDate && (
                                        <div className={`date-input-hint ${getDueDateStatus(editDueDate, editStatus).badgeClass}`}>
                                            {getDueDateStatus(editDueDate, editStatus).label}
                                        </div>
                                    )}
                                </div>

                                <div className="edit-form-field">
                                    <label>Assign To</label>
                                    <select
                                        value={editAssignedTo}
                                        onChange={e => setEditAssignedTo(e.target.value)}
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>
                                                {u.name} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="edit-modal-actions">
                                <button
                                    type="button"
                                    onClick={closeEditTaskModal}
                                    style={{
                                        background: "#e2e8f0",
                                        color: "#334155",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingEdit}
                                    style={{
                                        background: "#4f46e5",
                                        color: "white",
                                        padding: "8px 18px",
                                        borderRadius: "6px",
                                        border: "none",
                                        cursor: savingEdit ? "not-allowed" : "pointer",
                                        fontWeight: "600",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}
                                >
                                    <CheckCircle2 size={16} />
                                    {savingEdit ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Team Member Modal */}
            {showAddUserModal && (
                <div className="modal-backdrop" onClick={() => setShowAddUserModal(false)}>
                    <div className="modal-content quick-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Add Team Member</h2>
                                <p className="modal-subtitle">
                                    Add any new email to assign tasks & send notifications
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowAddUserModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleQuickAddUser} className="quick-user-form">
                            <div>
                                <label>Member Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Rohan Sharma"
                                    value={quickUserName}
                                    onChange={e => setQuickUserName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="e.g. rohan.runtime2408@gmail.com"
                                    value={quickUserEmail}
                                    onChange={e => setQuickUserEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <p className="field-hint" style={{ marginTop: "4px" }}>
                                💡 Once added, this member will immediately appear in the Assign dropdown across the app.
                            </p>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "14px" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddUserModal(false)}
                                    style={{
                                        background: "#e2e8f0",
                                        color: "#334155",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        background: "#4f46e5",
                                        color: "white",
                                        padding: "8px 18px",
                                        borderRadius: "6px",
                                        border: "none",
                                        cursor: "pointer",
                                        fontWeight: "600"
                                    }}
                                >
                                    <UserPlus size={15} style={{ verticalAlign: "middle", marginRight: "6px" }} />
                                    Save Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {editingProject && (
                <div className="modal-backdrop" onClick={() => setEditingProject(null)}>
                    <div className="modal-content quick-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Edit Project</h2>
                                <p className="modal-subtitle">Update project name and details</p>
                            </div>
                            <button type="button" className="btn-close" onClick={() => setEditingProject(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveProjectEdit} className="edit-task-form">
                            <div className="edit-form-field">
                                <label>Project Name *</label>
                                <input
                                    type="text"
                                    value={editProjectName}
                                    onChange={e => setEditProjectName(e.target.value)}
                                    placeholder="Project name"
                                    required
                                />
                            </div>
                            <div className="edit-form-field">
                                <label>Description</label>
                                <textarea
                                    rows={3}
                                    value={editProjectDescription}
                                    onChange={e => setEditProjectDescription(e.target.value)}
                                    placeholder="Project description"
                                />
                            </div>
                            <div className="edit-modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setEditingProject(null)}
                                    style={{
                                        background: "#e2e8f0",
                                        color: "#334155",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingProjectEdit}
                                    style={{
                                        background: "#4f46e5",
                                        color: "white",
                                        padding: "8px 18px",
                                        borderRadius: "6px",
                                        border: "none",
                                        cursor: savingProjectEdit ? "not-allowed" : "pointer",
                                        fontWeight: "600",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}
                                >
                                    <CheckCircle2 size={16} />
                                    {savingProjectEdit ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Task to Current Project Modal */}
            {showAddProjectTaskModal && (() => {
                const currentProj = selectedProjectId ? projects.find(p => p._id === selectedProjectId) : null;
                if (!currentProj) return null;
                return (
                    <div className="modal-backdrop" onClick={() => setShowAddProjectTaskModal(false)}>
                        <div className="modal-content edit-task-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <div>
                                    <h2>+ Add Task to Project</h2>
                                    <p className="modal-subtitle">
                                        Project: <strong>{currentProj.name}</strong>
                                    </p>
                                </div>
                                <button type="button" className="btn-close" onClick={() => setShowAddProjectTaskModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateTaskForProject} className="edit-task-form">
                                <div className="edit-form-field">
                                    <label>Task Title *</label>
                                    <input
                                        type="text"
                                        value={newProjectTaskTitle}
                                        onChange={e => setNewProjectTaskTitle(e.target.value)}
                                        placeholder="Task title"
                                        required
                                    />
                                </div>
                                <div className="edit-form-field">
                                    <label>Description</label>
                                    <textarea
                                        rows={3}
                                        value={newProjectTaskDesc}
                                        onChange={e => setNewProjectTaskDesc(e.target.value)}
                                        placeholder="Task description"
                                    />
                                </div>
                                <div className="edit-form-row">
                                    <div className="edit-form-field">
                                        <label>Priority</label>
                                        <select
                                            value={newProjectTaskPriority}
                                            onChange={e => setNewProjectTaskPriority(e.target.value)}
                                        >
                                            <option value="low">Low Priority</option>
                                            <option value="medium">Medium Priority</option>
                                            <option value="high">High Priority</option>
                                        </select>
                                    </div>
                                    <div className="edit-form-field">
                                        <label>Assign To</label>
                                        <select
                                            value={newProjectTaskAssignee}
                                            onChange={e => setNewProjectTaskAssignee(e.target.value)}
                                        >
                                            <option value="">Unassigned</option>
                                            {users.map(u => (
                                                <option key={u._id} value={u._id}>
                                                    {u.name} ({u.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="edit-form-field">
                                    <label>Due Date</label>
                                    <input
                                        type="date"
                                        value={newProjectTaskDueDate}
                                        onChange={e => setNewProjectTaskDueDate(e.target.value)}
                                    />
                                    {newProjectTaskDueDate && (
                                        <div className={`date-input-hint ${getDueDateStatus(newProjectTaskDueDate, "todo").badgeClass}`}>
                                            {getDueDateStatus(newProjectTaskDueDate, "todo").label}
                                        </div>
                                    )}
                                </div>
                                <div className="edit-modal-actions">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddProjectTaskModal(false)}
                                        style={{
                                            background: "#e2e8f0",
                                            color: "#334155",
                                            padding: "8px 16px",
                                            borderRadius: "6px",
                                            border: "none",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creatingProjectTask}
                                        style={{
                                            background: "#4f46e5",
                                            color: "white",
                                            padding: "8px 18px",
                                            borderRadius: "6px",
                                            border: "none",
                                            cursor: creatingProjectTask ? "not-allowed" : "pointer",
                                            fontWeight: "600",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px"
                                        }}
                                    >
                                        <Plus size={16} />
                                        {creatingProjectTask ? "Creating..." : "Create Task"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            })()}

        </div>
    );
}
