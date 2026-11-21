# ⚡ TaskFlow — Enterprise Task & Project Management Platform

[![Backend Live](https://img.shields.io/badge/Render%20Backend-Live%20Online-success?logo=render)](https://taskflow-xyek.onrender.com/health)
[![React](https://img.shields.io/badge/React-18-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000.svg?logo=express)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> A modern, full-stack enterprise task and sprint management platform built with the MERN stack. Combines the high-polish obsidian aesthetics of **Linear** with the multi-dimensional sprint analytics and cross-tabulation matrix reporting of **Jira**.

---

## 🌐 Live Cloud Deployment

| Service | Platform | Live URL / Endpoint | Status |
|---|---|---|---|
| **Backend API** | [Render.com](https://render.com/) | [`https://taskflow-xyek.onrender.com`](https://taskflow-xyek.onrender.com) | 🟢 Live (Online) |
| **Health Check** | [Render.com](https://render.com/) | [`https://taskflow-xyek.onrender.com/health`](https://taskflow-xyek.onrender.com/health) | 🟢 200 OK |
| **Keep-Alive Monitor** | [UptimeRobot](https://uptimerobot.com/) | Automated 5-min pinging (24/7 Zero Sleep) | 🟢 Active |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud Cluster (`taskflow`) | 🟢 Connected |

---

## 🌟 Key Highlights

- **Executive KPI Dashboard**: 5 Stripe/Datadog-grade metric cards tracking Total Tasks, To Do, In Progress, Completed, and Overdue velocity in a single cohesive row.
- **Visual Status Donut Chart**: Dynamic SVG radial chart displaying completion percentage with an interactive priority urgency breakdown stack.
- **Project Velocity Bar Graph**: Real-time cross-project velocity comparison with segmented colored progress bars (Completed, In Progress, Backlog).
- **2D Cross-Dimensional Pivot Matrix (Jira-grade)**: Interactive two-dimensional cross-tabulation report with dynamic toggles (`By Project`, `By Assignee`, `By Priority`), inline health statuses, and cumulative Grand Total footer.
- **Drag-and-Drop Kanban Board**: Fluid, visual workflow lifecycle board across To Do, In Progress, and Completed states.
- **Automated Due Date & Overdue Email Engine**: Background scheduler powered by Nodemailer that scans upcoming deadlines and sends formatted HTML email alerts.
- **Task Detail Drawer**: Complete collaboration suite featuring comment threads, file attachments, and full audit activity timelines.
- **Role-Based Access Control (RBAC)**: Secure JWT authentication with Admin, Manager, and Member permissions.

---

## 🚀 Core Features

### 1. 📊 Executive Visual Analytics
- **Live KPI Grid**: 5 high-contrast metric cards with animated progress indicators and overdue risk highlights.
- **Quick Jump Navigation**: One-click smooth-scrolling pills to instantly jump between KPIs, Donut Chart, Velocity Bar Graph, and Pivot Table.
- **Segmented Velocity Bars**: Visual breakdown of project velocity comparing completed tasks against active development and backlog.

### 2. 🗂️ Enterprise 2D Matrix Pivot Table
- Cross-tabulates tasks across multiple workspace dimensions:
  - **📁 By Project**: Compares milestones, completion %, overdue tasks, and health indicators.
  - **👤 By Assignee**: Monitors team capacity, active load, unassigned backlog, and availability.
  - **⚡ By Priority**: Evaluates urgency distribution across High (P1), Medium (P2), and Low (P3) tasks.
- **Click-to-Drilldown**: Clicking any row filters directly into the corresponding project or assignee view.
- **Grand Total Row**: Aggregated workspace velocity, average completion %, and overall health status.

### 3. 📋 Visual Kanban Board
- Interactive drag-and-drop workflow across **To Do**, **In Progress**, and **Completed** columns.
- Real-time status sync with optimistic UI updates and instant database persistence.

### 4. 📁 Project Management & Directory
- Multi-project workspaces with project owner attribution.
- Embedded project views featuring list and Kanban toggles, progress bars, and localized filters.

### 5. 👥 Team Directory & Resource Allocation
- Role management (`Admin`, `Manager`, `Member`).
- Real-time capacity monitoring preventing engineer burnout and surfacing unassigned tasks.

### 6. ⏰ Automated Email Scheduler (Nodemailer)
- Scheduled background cron job checking task due dates.
- Automatic email alerts for tasks due today and overdue tasks sent directly to the assignee's inbox.
- Manual one-click instant email reminder trigger from the task detail modal.

### 7. 📎 Collaboration: Comments, Attachments & Activity Log
- Rich comment threads per task.
- Secure file upload and download support (documents, spreadsheets, images, presentations).
- Historical audit activity log tracking status transitions, assignments, and updates.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18 | Modern component architecture with hooks |
| **Tooling** | Vite 6 | Lightning-fast HMR and optimized production bundling |
| **Icons & Styling** | Lucide React + CSS3 | Modern Linear-grade dark/light obsidian styling |
| **Backend** | Node.js (v22) + Express 5 | High-performance RESTful API service |
| **Database** | MongoDB Atlas + Mongoose 9 | Scalable cloud document database |
| **Authentication** | JWT (JSON Web Tokens) + Bcrypt | Secure HTTP Bearer token authorization & password hashing |
| **File Storage** | Multer | Local/cloud multipart file upload handler |
| **Notifications** | Nodemailer | Gmail SMTP integration for automated email alerts |
| **Cloud Hosting** | Render.com | Cloud web service hosting backend |

---

## 📂 Project Structure

```text
taskflow/
├── backend/
│   ├── models/             # Mongoose schemas (User, Project, Task, Comment, Attachment, Activity)
│   ├── routes/             # REST API endpoint routers
│   ├── utils/              # Email service, scheduler, date formatters
│   ├── admin.js            # Initial admin seed script
│   ├── db.js               # MongoDB Atlas connection handler
│   ├── jwt.js              # Token generation and verification middleware
│   ├── package.json        # Backend dependencies & scripts
│   └── server.js           # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Core application state, dashboard, Kanban & views
│   │   ├── main.jsx        # React entry point
│   │   └── style.css       # Obsidian Linear UI & Jira-grade responsive styles
│   ├── index.html          # HTML5 template
│   ├── package.json        # Frontend dependencies & scripts
│   └── vite.config.js      # Vite configuration
```

---

## ⚙️ Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or local MongoDB instance

---

### 1. Clone the Repository
```bash
git clone https://github.com/fahad-sh145-b/taskflow.git
cd taskflow
```

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file inside the `backend` folder:
   ```env
   PORT=4000
   MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here

   # Email Service (Gmail SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_character_app_password
   EMAIL_FROM="TaskFlow <your_email@gmail.com>"
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:4000` (or connects to `https://taskflow-xyek.onrender.com` in production).*

---

### 3. Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`.*

---

## 📡 API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Cloud health check (Render & UptimeRobot) | No |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login user & issue JWT | No |
| `GET` | `/api/projects` | Get all projects | Yes |
| `POST` | `/api/projects` | Create a new project | Yes |
| `GET` | `/api/tasks` | Get all tasks | Yes |
| `POST` | `/api/tasks` | Create a new task | Yes |
| `PUT` | `/api/tasks/:id` | Update task details / status | Yes |
| `DELETE` | `/api/tasks/:id` | Delete task | Yes |
| `GET` | `/api/user` | List team members & workloads | Yes |
| `POST` | `/api/user/quick-add` | Quick-invite team member | Yes |
| `POST` | `/api/comments` | Add comment to a task | Yes |
| `POST` | `/api/attachments/:taskId` | Upload file attachment | Yes |
| `GET` | `/api/attachments/:id/download` | Download attachment file | Yes |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Crafted with ❤️ by **[fahad-sh145-b](https://github.com/fahad-sh145-b)**
