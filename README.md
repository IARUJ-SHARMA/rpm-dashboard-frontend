That makes it much easier! Since the MySQL database and tables are already set up at the office, you can skip the database creation entirely and just focus on pulling down the code and linking it up.Here is the exact, streamlined sequence to get both repositories running cleanly tomorrow.1.Set up the Backend (rpm-dashboard):This needs to run first so the database connection is established before the frontend tries to fetch any data.Clone the repository: Open a terminal and run:Bashgit clone https://github.com/IARUJ-SHARMA/rpm-dashboard.git
Navigate into the folder:Bashcd rpm-dashboard
Install dependencies:Bashnpm install
Configure the Environment: Create a .env file in the root of this folder and paste your exact office database credentials:PlaintextPORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root123
DB_NAME=maintanencedashboard
Start the backend server:Bashnpm run dev
(If npm run dev isn't in your package.json, use node index.js or node server.js depending on your entry file).How to verify: Look at the terminal output. It should say something like "Server running on port 5000" and "Connected to MySQL database."2.Create the Media Folder (Crucial for File Uploads):Git automatically ignores completely empty folders. If your backend relies on Multer to save uploaded videos or Excel files, you must ensure the destination folder exists, or the server will crash when you try to upload.While inside the rpm-dashboard backend folder, check if the uploads/media/ folder exists.If it does not exist, manually create it.How to verify: You should see a physical folder path of uploads/media/ inside your backend root directory.3.Set up the Frontend (rpm-dashboard-frontend):Now that the backend API is live, you can boot up the React interface.Open a completely new, second terminal window (leave the backend one running).Clone the frontend repository:Bashgit clone https://github.com/IARUJ-SHARMA/rpm-dashboard-frontend.git
Navigate into the folder:Bashcd rpm-dashboard-frontend
Install dependencies:Bashnpm install
Start the frontend server:Bashnpm run dev
How to verify: The terminal will confirm Vite is running, usually outputting a local link like http://localhost:5173.4.Final System Verification:Open your web browser on the office PC.Navigate to http://localhost:5173.Log in (or switch roles using your RBAC dropdown) and check the Audit Drawer or the Dashboard KPIs.How to verify: If the KPIs show data and the Audit Drawer loads without spinning endlessly, your frontend has successfully connected to your backend, which has successfully queried the office MySQL database. You are good to go!
