To verify your database is set up correctly and to view the live data in MySQL Workbench just like you documented in your report, here are the exact SQL queries you need.You can copy and paste these directly into the MySQL Workbench Query tab.1. Select the Database & Check the TablesFirst, tell Workbench which database you are working in and verify that all 10 of your tables exist. Run this:SQLUSE maintanencedashboard;
SHOW TABLES;
(This should list your tables: calendar_events, checklist_tasks, consumables, fixed_life_spares, pm_records, reschedule_log, subsystems, task_audit_log, upload_log, and users.)2. The Verification Queries (From Your Report)Here are the exact queries from Section 6.3 of your Completion Report. Running these will let you see exactly what your frontend is doing on the backend.   To see your live Audit Trail (Every tick/untick):SQLSELECT id, task_id, old_status, new_status, changed_by, changed_at 
FROM task_audit_log 
ORDER BY changed_at DESC 
LIMIT 10;
To check Consumables Inventory & Low Stock Alerts:SQLSELECT item_id, consumable_item_name, current_qty, alert_threshold, status 
FROM consumables 
ORDER BY current_qty ASC 
LIMIT 10;
To verify the Checklist Tasks & Video References:SQLSELECT task_id, subsystem_id, step_no, task_title, completion_status, video_ref_filename 
FROM checklist_tasks 
ORDER BY subsystem_id, step_no 
LIMIT 10;
To check the Rescheduling Log (Date-Clash overrides):SQLSELECT log_id, subsystem_id, original_date, new_date, reason_for_rescheduling, requested_by 
FROM reschedule_log 
ORDER BY log_id DESC;
To verify your Master Excel Uploads:SQLSELECT id, filename, uploaded_at, summary 
FROM upload_log 
ORDER BY id DESC 
LIMIT 5;
A Quick Note on "Making" the Backend DataIf you run these SELECT queries and the tables are completely empty, you don't need to manually type the data in! Because you built a Master Data Ingestion Pipeline (Section 3A.5), all you need to do is:   Make sure your React frontend and Express backend are running.Log in as an Administrator (ADMIN001).Click the Upload Excel button on your dashboard and select your RPM_Dashboard_InputData_v10.xlsx file.Your ingest.js engine will automatically parse the 8 sheets and populate all of these tables for you. Then, you can run the SQL queries above again to see your fully populated database!   

Here is the exact setup guide formatted as standard Markdown. You can easily click the "Copy" button in the corner of this block and paste it directly into your `README.md` file:

```markdown
## Office Deployment & Local Setup Guide

**Prerequisites:** Node.js must be installed, and the MySQL database (`maintanencedashboard`) should already be active on the office network.

### 1. Backend Setup (`rpm-dashboard`)

This must be initialized first to establish the database connection.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/IARUJ-SHARMA/rpm-dashboard.git](https://github.com/IARUJ-SHARMA/rpm-dashboard.git)

```

2. **Navigate into the backend directory:**
```bash
cd rpm-dashboard

```


3. **Install dependencies:**
```bash
npm install

```


4. **Configure Environment Variables:**
Create a `.env` file in the root of the `rpm-dashboard` directory and paste the office database credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root123
DB_NAME=maintanencedashboard

```


5. **Verify Media Directories:**
Since Git ignores empty folders, ensure the upload destination exists so Multer doesn't throw a path error. If it is missing, create it manually:
```bash
mkdir -p uploads/media/

```


6. **Start the backend server:**
```bash
npm run dev

```


*(Look for "Server running on port 5000" and "Connected to MySQL database" in the terminal output).*

---

### 2. Frontend Setup (`rpm-dashboard-frontend`)

1. **Open a new terminal window** (leave the backend server running).
2. **Clone the frontend repository:**
```bash
git clone [https://github.com/IARUJ-SHARMA/rpm-dashboard-frontend.git](https://github.com/IARUJ-SHARMA/rpm-dashboard-frontend.git)

```


3. **Navigate into the frontend directory:**
```bash
cd rpm-dashboard-frontend

```


4. **Install dependencies:**
```bash
npm install

```


5. **Start the Vite development server:**
```bash
npm run dev

```


*(The terminal should confirm Vite is running on `http://localhost:5173`).*

### 3. Final Verification

Open your web browser and navigate to `http://localhost:5173`. Check the Audit Drawer or KPI cards to verify data is successfully syncing from the office MySQL database.

```

This raw text version should show up perfectly for you! Let me know if you need any tweaks to the wording before you commit it.

```

I am deploying my project, the RPM Dashboard, on a new office machine. I have attached the project's completion report for full technical context on my architecture, database schema, and environment variables.

My stack is:
- Frontend: React 19 + TypeScript + Vite (Port 5173)
- Backend: Node.js + Express (Port 5000)
- Database: MySQL 8.0 (Port 3306, Schema: maintanencedashboard)

I was following my setup sequence, but I encountered the following error:

[PASTE YOUR EXACT ERROR MESSAGE OR TERMINAL OUTPUT HERE]

Based on my tech stack and the attached document, please provide the exact, step-by-step troubleshooting path to resolve this issue.
