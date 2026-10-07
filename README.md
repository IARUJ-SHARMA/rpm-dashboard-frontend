RPM Dashboard – Full Stack Setup Guide
This guide provides the exact steps to clone, configure, and run both the Node.js/MySQL backend and the React/Vite frontend.

Prerequisites
Before you begin, ensure you have the following installed on your machine:

Node.js (v16 or higher)

[suspicious link removed]

Git

Step 1: Clone the Repositories
Open your terminal and clone both the backend and frontend repositories into your desired project folder.

Bash
# Clone the backend repository
git clone https://github.com/IARUJ-SHARMA/rpm-dashboard.git

# Clone the frontend repository
git clone https://github.com/IARUJ-SHARMA/rpm-dashboard-frontend.git
Step 2: Database Configuration
Since the backend relies on MySQL, you need to initialize the database schema.

Open your MySQL terminal or MySQL Workbench.

Execute the provided schema.sql file located in the backend folder to create your tables and relationships.

Bash
# Example command line import (replace 'root' with your MySQL username)
mysql -u root -p < rpm-dashboard/schema.sql
Step 3: Backend Setup (rpm-dashboard)
Because .env files and node_modules are safely ignored by Git, you must reinstall dependencies and recreate your environment variables.

1. Navigate and Install Dependencies

Bash
cd rpm-dashboard
npm install
2. Create the .env File
Create a new file named .env in the root of the rpm-dashboard folder and paste the following configuration (update the database credentials to match your local MySQL setup):

Code snippet
# Server Configuration
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
3. Start the Backend Server

Bash
# Run with node
node server.js

# OR run with nodemon for live reloading (if configured in package.json)
npm run dev
The backend should now be running on http://localhost:5000.

Step 4: Frontend Setup (rpm-dashboard-frontend)
Open a new terminal window (keep the backend running in the first one) and set up the React/Vite frontend.

1. Navigate and Install Dependencies

Bash
cd rpm-dashboard-frontend
npm install
2. Start the Frontend Development Server

Bash
npm run dev
The frontend will launch (typically on http://localhost:5173). Vite will automatically open it in your browser, or you can click the local link provided in the terminal.

There you have it, Sargent! Just copy everything from the # RPM Dashboard – Full Stack Setup Guide down to the end, paste it into your README.md, and you or anyone else will have a flawless, error-free setup process every time.

Which repository do you want to add this README to first?
