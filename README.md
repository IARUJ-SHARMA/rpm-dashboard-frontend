To verify your database is set up correctly and to view the live data in MySQL Workbench just like you documented in your report, here are the exact SQL queries you need.

You can copy and paste these directly into the MySQL Workbench Query tab.

### 1. Select the Database & Check the Tables

First, tell Workbench which database you are working in and verify that all 10 of your tables exist. Run this:

```sql
USE maintanencedashboard;
SHOW TABLES;

```

*(This should list your tables: `calendar_events`, `checklist_tasks`, `consumables`, `fixed_life_spares`, `pm_records`, `reschedule_log`, `subsystems`, `task_audit_log`, `upload_log`, and `users`.)*

### 2. The Verification Queries (From Your Report)

Here are the exact queries from **Section 6.3 of your Completion Report**. Running these will let you see exactly what your frontend is doing on the backend.

**To see your live Audit Trail (Every tick/untick):**

```sql
SELECT id, task_id, old_status, new_status, changed_by, changed_at 
FROM task_audit_log 
ORDER BY changed_at DESC 
LIMIT 10;

```

**To check Consumables Inventory & Low Stock Alerts:**

```sql
SELECT item_id, consumable_item_name, current_qty, alert_threshold, status 
FROM consumables 
ORDER BY current_qty ASC 
LIMIT 10;

```

**To verify the Checklist Tasks & Video References:**

```sql
SELECT task_id, subsystem_id, step_no, task_title, completion_status, video_ref_filename 
FROM checklist_tasks 
ORDER BY subsystem_id, step_no 
LIMIT 10;

```

**To check the Rescheduling Log (Date-Clash overrides):**

```sql
SELECT log_id, subsystem_id, original_date, new_date, reason_for_rescheduling, requested_by 
FROM reschedule_log 
ORDER BY log_id DESC;

```

**To verify your Master Excel Uploads:**

```sql
SELECT id, filename, uploaded_at, summary 
FROM upload_log 
ORDER BY id DESC 
LIMIT 5;

```

### A Quick Note on "Making" the Backend Data

If you run these `SELECT` queries and the tables are completely empty, you don't need to manually type the data in! Because you built a **Master Data Ingestion Pipeline** (Section 3A.5), all you need to do is:

1. Make sure your React frontend and Express backend are running.
2. Log in as an Administrator (`ADMIN001`).
3. Click the **Upload Excel** button on your dashboard and select your `RPM_Dashboard_InputData_v10.xlsx` file.

Your `ingest.js` engine will automatically parse the 8 sheets and populate all of these tables for you. Then, you can run the SQL queries above again to see your fully populated database!

MySQL Workbench does not have a live auto-refresh feature to stream data in real-time. However, you can avoid pasting and running the SQL query repeatedly by using the visual Result Grid and just hitting a refresh button.



Here is the easiest way to set this up so you can check your ticks and unticks instantly:

Look at the left sidebar (Navigator) in MySQL Workbench and double-click the maintanencedashboard schema to make it active (the text will turn bold).

Expand the Tables folder to see your list of tables.

Right-click on the task_audit_log table and select "Select Rows - Limit 1000". This automatically runs a query and opens a visual grid tab showing your data.

Leave this tab open in the background.

Go to your React frontend in your browser and tick or untick a checklist item.

Switch back to MySQL Workbench and click the small Refresh icon (🔄) located just above the data grid (or simply press Ctrl + Enter).

The grid will instantly pull the newest snapshot of the database, and your latest tick/untick action will appear right at the bottom of the list. You can leave this tab open all day and just hit that refresh icon whenever you want to see the latest backend changes.



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





They run on different ports because your application uses a **decoupled client-server architecture** (specifically, a separate frontend and backend).

Here is why they are split onto two different ports (`5173` and `5000`):

1. Frontend (Port 5173 - Vite):
This is built with React and Vite. Vite runs a local development server primarily designed to serve your user interface, handle component rendering, manage hot-reloading when you change your code, and run in your web browser.


2. Backend (Port 5000 - Express):
This is built with Node.js and Express. It acts as a separate API server that handles business logic, connects directly to your MySQL database (`maintanencedashboard`), processes SQL queries, handles file uploads, and generates PDFs.



### How they talk to each other:

Even though they run on different ports, your frontend isn't isolated. Whenever you click a button on your dashboard (like ticking a checklist item or adjusting inventory stock), your React frontend makes an HTTP request to `http://localhost:5000/api/...` behind the scenes. Your Express backend receives that request, talks to MySQL, and sends the data back to your screen.

Keeping them separate is standard industry practice because it keeps your UI code clean and completely independent from your database and server logic!


Yes, you technically **can** merge them into a single server, but it is **not recommended** for a project like yours—especially for an industrial dashboard with databases, file uploads, and live logs.

Here is why keeping them separate is much better, and how a merged setup would work:

### Why keeping them separate is better:

1. **Separation of Concerns:** Your frontend is built using React and Vite, which are designed just to compile and render your UI in the browser. Your backend is Node.js/Express, which handles secure database connections, password logic, and file systems. Mixing them makes the codebase messy.
2. **Development Speed:** Vite gives you **Hot Module Replacement (HMR)**—meaning when you change a line of React code, your browser updates instantly without refreshing. If you merge them into a single Express server, you lose that smooth instant-reload experience.

---

### How people *do* merge them (if they really want to):

If you ever wanted to run everything on just **one port** (for example, running everything on `http://localhost:5000`), you would have to do this:

1. Run a build command on your frontend (`npm run build`), which turns your React code into static HTML/CSS/JS files.
2. Tell your Express backend to serve those static files directly using middleware like this:
```javascript
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));

```



### Why you shouldn't do this for development:

If you merged them right now, every time you wanted to change a button color or fix a bug in your React components, you would have to manually run a full build command and restart your backend just to see the change. Keeping them on ports `5173` (frontend) and `5000` (backend) lets you code both sides simultaneously and see changes instantly!
