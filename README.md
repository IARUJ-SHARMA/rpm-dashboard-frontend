# 🛰️ RPM Dashboard — Radar Preventive Maintenance System

A full-stack web application for managing preventive maintenance of Radar systems. Built for industrial asset management with real-time checklist tracking, inventory management, and maintenance scheduling.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 · TypeScript · Vite · TanStack Query |
| Backend | Node.js · Express |
| Database | MySQL 8.x |
| Styling | Custom CSS (Inter font) |
| Data Ingestion | Excel (.xlsx) via SheetJS |
| PDF Export | PDFKit |

---

## 📁 Project Structure

```
rpm-dashboard-frontend-main/    ← Workspace root
├── rpm-dashboard-main/         ← Node.js/Express backend  (port 5000)
│   ├── server.js               ← All API routes
│   ├── db.js                   ← MySQL connection pool
│   ├── ingest.js               ← Excel → DB upsert engine
│   ├── schema.sql              ← 10-table database schema
│   └── .env                    ← DB credentials (see .env.example)
│
├── rpm-dashboard-frontend-main/ ← React frontend  (port 5173)
│   └── src/
│       ├── components/         ← All UI components
│       └── api.ts              ← Typed API helpers
│
├── package.json                ← Workspace scripts
└── README.md                   ← This file
```

---

## ⚙️ Prerequisites

1. **Node.js** v18 or higher → [nodejs.org](https://nodejs.org)
2. **MySQL Server 8.x** → [mysql.com](https://dev.mysql.com/downloads/mysql/)
3. **MySQL Workbench** (recommended for viewing audit logs)

---

## 🚀 Setup & Run (Step-by-Step)

### 1. Database

The application connects to `maintanencedashboard` (or `rpm_dashboard`). In MySQL Workbench, use:

```sql
CREATE DATABASE IF NOT EXISTS maintanencedashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE maintanencedashboard;
```

Then execute `rpm-dashboard-main/schema.sql` (if initializing a blank database).

### 2. Configure Backend Environment

```bash
cd rpm-dashboard-main
cp .env.example .env
```

Your office `.env` settings:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root123
DB_NAME=maintanencedashboard
CORS_ORIGIN=http://localhost:5173
```

### 3. Install Dependencies

```bash
# From workspace root:
cd rpm-dashboard-main && npm install
cd ../rpm-dashboard-frontend-main && npm install
```

### 4. Start the Backend

```bash
cd rpm-dashboard-main
npm run dev
```

You should see:
```
✅ RPM Backend running on http://localhost:5000
   DB: rpm_dashboard @ localhost:3306
```

### 5. Start the Frontend

In a new terminal:

```bash
cd rpm-dashboard-frontend-main
npm run dev
```

Open **http://localhost:5173** in your browser.

### 6. Load Initial Data

1. In the browser, click **"Upload Master Excel"**
2. Select `rpm-dashboard-main/RPM_Dashboard_InputData_v10.xlsx`
3. All subsystems, tasks, consumables, spares, and calendar events will be loaded

---

## ✅ Features

| Feature | Status |
|---------|--------|
| 📅 Maintenance Calendar (colour-coded by PM frequency) | ✅ |
| ✔️ Checklist Tick/Untick → MySQL audit trail | ✅ |
| 📊 Daily & Monthly KPI Summary Cards | ✅ |
| 🗂️ Subsystem Eligibility by Date | ✅ |
| 📦 Consumables Inventory with +/- Stock Controls | ✅ |
| 🔩 Fixed-Life Spares with Alert Levels | ✅ |
| 🔄 PM Rescheduling with Date-Clash Validation | ✅ |
| 📄 PDF Export (Daily + Monthly Maintenance Plans) | ✅ |
| 📤 Master Excel Upload with Live Ingestion | ✅ |
| ⚠️ Low-Stock Gatekeeping Warning on Checklist | ✅ |
| 🕐 Per-Task Audit Trail Drawer | ✅ |
| 🔐 RBAC (Role-Based Access Control) | 🔜 Coming |
| 🎥 Video Reference per Task | 🔜 Coming |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `subsystems` | Radar subsystem master list |
| `checklist_tasks` | PM checklist tasks per subsystem |
| `consumables` | Consumable items with qty tracking |
| `fixed_life_spares` | Life-limited spare parts |
| `calendar_events` | Scheduled maintenance events |
| `users` | User accounts (for RBAC) |
| `pm_records` | PM completion records |
| `reschedule_log` | PM rescheduling history |
| `task_audit_log` | Every tick/untick event (for MySQL Workbench) |
| `upload_log` | Excel upload history |

---

## 🔍 Verifying Checklist Ticks in MySQL Workbench

After ticking/unticking a checklist item in the browser, open MySQL Workbench (e.g. your **RPM Office Connection**) and run:

```sql
USE maintanencedashboard;

-- See all tick/untick events with user and timestamp
SELECT * FROM task_audit_log ORDER BY changed_at DESC LIMIT 20;

-- See current status of all tasks
SELECT task_id, task_title, completion_status FROM checklist_tasks ORDER BY subsystem_id, step_no;
```

---

## 🛠️ API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/calendar-events` | All scheduled events |
| GET | `/api/checklist/:subsystemId` | Tasks for a subsystem |
| PUT | `/api/checklist/:taskId/status` | Tick/untick a task |
| GET | `/api/audit-log/:taskId` | Audit history per task |
| GET | `/api/summary/:date` | Daily KPI stats |
| GET | `/api/summary/month/:year/:month` | Monthly KPI stats |
| GET | `/api/consumables` | All consumable items |
| POST | `/api/consumables/:itemId/adjust` | Increment/decrement stock |
| GET | `/api/spares` | Fixed-life spares |
| GET | `/api/eligibility/:date` | Subsystems due on date |
| GET | `/api/gatekeeping/:subsystemId` | Low-stock warnings |
| POST | `/api/reschedule` | Reschedule a PM event |
| GET | `/api/export/:date` | Daily PDF export |
| GET | `/api/export/month/:year/:month` | Monthly PDF export |
| POST | `/api/admin/upload-excel` | Upload master Excel |
| GET | `/api/admin/last-update` | Last upload info |

---

## 📝 Notes

- The Vite dev server proxies all `/api` requests to `http://localhost:5000`
- CORS is configured via `CORS_ORIGIN` in `.env`
- All checklist status changes are persisted to `task_audit_log` in real time
- Stock levels auto-update `status` field when adjusted (Low Stock / Adequate)

---

*Built for the Radar Preventive Maintenance Division — Industrial Asset Management System*
