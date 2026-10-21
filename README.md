Ah, apologies for that, Sargent! The formatting in my last message might not have rendered correctly on your screen.

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
