import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import {
  securityHeaders,
  restrictedCors,
  apiKeyAuth,
  rateLimiter,
  monitoringIpWhitelist,
  requestLogger,
} from "./middleware/security";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const app = new Hono();

// ── Global Middleware (applied to all routes) ─────────────────────────────────
app.use("*", securityHeaders);
app.use("*", restrictedCors);
app.use("*", requestLogger);

// ── Health Check (no auth, no rate limit) ─────────────────────────────────────
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Qaraj GM Backend API v1.0.4",
    monitoring: "/monitoring — Bug reports, error & system health dashboard",
  });
});

// ── Monitoring Dashboard (IP whitelist only) ──────────────────────────────────
app.use("/monitoring*", monitoringIpWhitelist);

// ── Monitoring Dashboard HTML ────────────────────────────────────────────────
app.get("/monitoring", async (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Qaraj GM — Monitoring Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }
    h1 { color: #38bdf8; margin-bottom: 4px; }
    .subtitle { color: #64748b; font-size: 13px; margin-bottom: 20px; }
    h2 { color: #94a3b8; margin: 20px 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .stat { background: #1e293b; border-radius: 8px; padding: 16px; text-align: center; }
    .stat .value { font-size: 28px; font-weight: bold; color: #38bdf8; }
    .stat .label { font-size: 11px; color: #64748b; margin-top: 4px; }
    .stat.critical .value { color: #ef4444; }
    .stat.high .value { color: #f97316; }
    .stat.medium .value { color: #eab308; }
    .stat.healthy .value { color: #22c55e; }
    .stat.info .value { color: #a78bfa; }
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 8px; overflow: hidden; margin-bottom: 16px; }
    th { background: #334155; padding: 10px 12px; text-align: left; font-size: 12px; color: #94a3b8; text-transform: uppercase; }
    td { padding: 10px 12px; border-top: 1px solid #334155; font-size: 13px; }
    tr:hover { background: #334155; }
    .badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; display: inline-block; }
    .badge.critical { background: #7f1d1d; color: #fca5a5; }
    .badge.high { background: #7c2d12; color: #fdba74; }
    .badge.medium { background: #713f12; color: #fde047; }
    .badge.low { background: #14532d; color: #86efac; }
    .badge.new { background: #1e3a5f; color: #93c5fd; }
    .badge.acknowledged { background: #3b0764; color: #d8b4fe; }
    .badge.in_progress { background: #713f12; color: #fde047; }
    .badge.resolved { background: #14532d; color: #86efac; }
    .badge.wont_fix { background: #334155; color: #94a3b8; }
    .badge.healthy { background: #14532d; color: #86efac; }
    .badge.degraded { background: #7c2d12; color: #fdba74; }
    .badge.down { background: #7f1d1d; color: #fca5a5; }
    .badge.mock { background: #713f12; color: #fde047; }
    .badge.configured { background: #14532d; color: #86efac; }
    .badge.mock_mode { background: #713f12; color: #fde047; }
    .tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .tab { padding: 8px 16px; background: #1e293b; border-radius: 6px; cursor: pointer; font-size: 13px; border: 1px solid #334155; transition: all 0.2s; }
    .tab:hover { border-color: #38bdf8; }
    .tab.active { background: #38bdf8; color: #0f172a; border-color: #38bdf8; font-weight: 600; }
    .actions { margin: 0 0 16px; display: flex; gap: 8px; flex-wrap: wrap; }
    .btn { padding: 8px 16px; background: #38bdf8; color: #0f172a; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s; }
    .btn:hover { background: #7dd3fc; }
    .btn.secondary { background: #334155; color: #e2e8f0; }
    .btn.secondary:hover { background: #475569; }
    .btn.sm { padding: 4px 10px; font-size: 12px; }
    .btn.danger { background: #ef4444; color: white; }
    .btn.danger:hover { background: #dc2626; }
    #content { min-height: 200px; }
    .empty { text-align: center; padding: 40px; color: #64748b; }
    .form { background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .form input, .form textarea, .form select { width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #e2e8f0; margin-bottom: 10px; font-size: 13px; font-family: inherit; }
    .form label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
    .form textarea { min-height: 80px; resize: vertical; }
    .health-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .health-card { background: #1e293b; border-radius: 8px; padding: 16px; }
    .health-card h3 { color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .health-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #334155; }
    .health-row:last-child { border-bottom: none; }
    .health-key { color: #94a3b8; font-size: 13px; }
    .health-val { color: #e2e8f0; font-size: 13px; font-weight: 500; }
    .loading { text-align: center; padding: 40px; color: #64748b; }
    .loading::after { content: '...'; animation: dots 1.5s steps(3, end) infinite; }
    @keyframes dots { 0% { content: '.'; } 33% { content: '..'; } 66% { content: '...'; } }
    .timestamp { color: #475569; font-size: 11px; text-align: right; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>Qaraj GM Monitoring</h1>
  <div class="subtitle">Group Motors — Backend API v1.0.4 | Database-backed monitoring</div>

  <div class="stats" id="stats">
    <div class="stat"><div class="value" id="stat-total">-</div><div class="label">Total Errors</div></div>
    <div class="stat critical"><div class="value" id="stat-unresolved">-</div><div class="label">Unresolved</div></div>
    <div class="stat high"><div class="value" id="stat-24h">-</div><div class="label">Last 24h</div></div>
    <div class="stat medium"><div class="value" id="stat-bugs">-</div><div class="label">Open Bugs</div></div>
    <div class="stat info"><div class="value" id="stat-users">-</div><div class="label">Users</div></div>
    <div class="stat info"><div class="value" id="stat-vehicles">-</div><div class="label">Vehicles</div></div>
    <div class="stat healthy"><div class="value" id="stat-health">-</div><div class="label">API Status</div></div>
  </div>

  <div class="tabs">
    <div class="tab active" onclick="showTab('errors')">Error Logs</div>
    <div class="tab" onclick="showTab('bugs')">Bug Reports</div>
    <div class="tab" onclick="showTab('health')">System Health</div>
    <div class="tab" onclick="showTab('submit')">Submit Bug Report</div>
  </div>

  <div class="actions">
    <button class="btn" onclick="exportReport()">Export Report (JSON)</button>
    <button class="btn secondary" onclick="saveSnapshot()">Save Health Snapshot</button>
    <button class="btn secondary" onclick="loadData()">Refresh</button>
  </div>

  <div id="content"><div class="loading">Loading</div></div>
  <div class="timestamp" id="last-updated"></div>

  <script>
    var API = window.location.origin + '/api/trpc';
    // API key injected server-side for whitelisted IPs only (not exposed in source)
    var API_KEY = '%%MONITORING_KEY%%';

    function trpcCall(procedure, input) {
      var url = input !== undefined
        ? API + '/' + procedure + '?input=' + encodeURIComponent(JSON.stringify({ json: input }))
        : API + '/' + procedure;
      return fetch(url, { headers: { 'x-api-key': API_KEY } })
        .then(function(res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
        .then(function(data) { return data && data.result && data.result.data ? data.result.data.json : null; })
        .catch(function(err) { console.error('trpcCall error [' + procedure + ']:', err); return null; });
    }

    function trpcMutate(procedure, input) {
      return fetch(API + '/' + procedure, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ json: input }),
      })
        .then(function(res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
        .then(function(data) { return data && data.result && data.result.data ? data.result.data.json : null; })
        .catch(function(err) { console.error('trpcMutate error [' + procedure + ']:', err); return null; });
    }

    var currentTab = 'errors';

    function loadData() {
      // Error stats from DB
      trpcCall('monitoring.errors.stats', undefined).then(function(stats) {
        if (stats) {
          document.getElementById('stat-total').textContent = stats.totalErrors != null ? stats.totalErrors : '-';
          document.getElementById('stat-unresolved').textContent = stats.unresolvedErrors != null ? stats.unresolvedErrors : '-';
          document.getElementById('stat-24h').textContent = stats.errorsLast24h != null ? stats.errorsLast24h : '-';
        }
      });

      // Bug count from DB
      trpcCall('monitoring.bugs.list', { limit: 1, offset: 0 }).then(function(bugs) {
        document.getElementById('stat-bugs').textContent = bugs && bugs.total != null ? bugs.total : '-';
      });

      // Dashboard summary (users, vehicles)
      trpcCall('monitoring.health.summary', undefined).then(function(summary) {
        if (summary) {
          document.getElementById('stat-users').textContent = summary.users ? summary.users.total : '-';
          document.getElementById('stat-vehicles').textContent = summary.vehicles ? summary.vehicles.total : '-';
        }
      });

      // Live health
      trpcCall('monitoring.health.live', undefined).then(function(health) {
        if (health) {
          var el = document.getElementById('stat-health');
          el.textContent = health.status === 'healthy' ? '\\u2713' : health.status;
          el.parentElement.className = health.status === 'healthy' ? 'stat healthy' : 'stat critical';
        }
      });

      document.getElementById('last-updated').textContent = 'Last updated: ' + new Date().toLocaleString();
      showTab(currentTab);
    }

    function showTab(tab) {
      currentTab = tab;
      document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
      var tabs = ['errors', 'bugs', 'health', 'submit'];
      var idx = tabs.indexOf(tab);
      if (idx >= 0) document.querySelectorAll('.tab')[idx].classList.add('active');

      var content = document.getElementById('content');

      // ── TAB: Error Logs ──
      if (tab === 'errors') {
        content.innerHTML = '<div class="loading">Loading errors</div>';
        trpcCall('monitoring.errors.list', { limit: 50, resolved: false }).then(function(data) {
          if (!data || !data.errors || !data.errors.length) {
            content.innerHTML = '<div class="empty">No unresolved errors. That\\'s a good sign!</div>';
            return;
          }
          var html = '<table><thead><tr><th>Time</th><th>Severity</th><th>Source</th><th>Endpoint</th><th>Message</th><th>User</th><th>Action</th></tr></thead><tbody>';
          data.errors.forEach(function(e) {
            html += '<tr>'
              + '<td>' + new Date(e.createdAt).toLocaleString() + '</td>'
              + '<td><span class="badge ' + e.severity + '">' + e.severity + '</span></td>'
              + '<td>' + (e.source || '-') + '</td>'
              + '<td>' + (e.endpoint || '-') + '</td>'
              + '<td title="' + escHtml(e.message || '') + '">' + escHtml((e.message || '').substring(0, 80)) + '</td>'
              + '<td>' + (e.userPhone || e.userId || '-') + '</td>'
              + '<td><button class="btn sm" onclick="resolveError(\\'' + e.id + '\\')">Resolve</button></td>'
              + '</tr>';
          });
          html += '</tbody></table>';
          html += '<div style="color:#64748b;font-size:12px;">Showing ' + data.errors.length + ' of ' + data.total + ' unresolved errors</div>';
          content.innerHTML = html;
        });
      }

      // ── TAB: Bug Reports ──
      if (tab === 'bugs') {
        content.innerHTML = '<div class="loading">Loading bug reports</div>';
        trpcCall('monitoring.bugs.list', { limit: 50 }).then(function(data) {
          if (!data || !data.reports || !data.reports.length) {
            content.innerHTML = '<div class="empty">No bug reports yet.</div>';
            return;
          }
          var html = '<table><thead><tr><th>Time</th><th>Severity</th><th>Status</th><th>Reporter</th><th>Title</th><th>Description</th><th>Device</th></tr></thead><tbody>';
          data.reports.forEach(function(r) {
            html += '<tr>'
              + '<td>' + new Date(r.createdAt).toLocaleString() + '</td>'
              + '<td><span class="badge ' + r.severity + '">' + r.severity + '</span></td>'
              + '<td><span class="badge ' + r.status + '">' + (r.status || '').replace('_', ' ') + '</span></td>'
              + '<td>' + escHtml(r.reporterName) + '</td>'
              + '<td>' + escHtml(r.title) + '</td>'
              + '<td title="' + escHtml(r.description || '') + '">' + escHtml((r.description || '').substring(0, 100)) + '</td>'
              + '<td>' + escHtml(r.deviceInfo || '-') + '</td>'
              + '</tr>';
          });
          html += '</tbody></table>';
          html += '<div style="color:#64748b;font-size:12px;">Showing ' + data.reports.length + ' of ' + data.total + ' bug reports</div>';
          content.innerHTML = html;
        });
      }

      // ── TAB: System Health ──
      if (tab === 'health') {
        content.innerHTML = '<div class="loading">Loading system health</div>';

        Promise.all([
          trpcCall('monitoring.health.live', undefined),
          trpcCall('monitoring.health.summary', undefined),
          trpcCall('monitoring.health.history', { limit: 20 }),
        ]).then(function(results) {
          var health = results[0];
          var summary = results[1];
          var history = results[2];

          var html = '<div class="health-grid">';

          // API Status Card
          html += '<div class="health-card"><h3>API Status</h3>';
          if (health) {
            html += healthRow('Overall', '<span class="badge ' + health.status + '">' + health.status + '</span>');
            html += healthRow('Uptime', health.uptimeFormatted || '-');
            html += healthRow('API Version', health.apiVersion || '-');
            html += healthRow('Node.js', health.nodeVersion || '-');
            html += healthRow('Timestamp', health.timestamp ? new Date(health.timestamp).toLocaleString() : '-');
          } else {
            html += '<div class="empty">Could not fetch live health</div>';
          }
          html += '</div>';

          // Service Checks Card
          html += '<div class="health-card"><h3>Service Checks</h3>';
          if (health && health.checks) {
            var c = health.checks;
            html += healthRow('API', '<span class="badge ' + c.api.status + '">' + c.api.status + '</span>');
            html += healthRow('Database', '<span class="badge ' + c.database.status + '">' + c.database.status + '</span>'
              + (c.database.responseTimeMs !== undefined ? ' (' + c.database.responseTimeMs + 'ms)' : ''));
            html += healthRow('SMS Provider', '<span class="badge ' + c.sms.status + '">' + c.sms.status + '</span>'
              + (c.sms.provider ? ' (' + c.sms.provider + ')' : '')
              + (c.sms.sender ? ' sender: ' + c.sms.sender : ''));
          }
          html += '</div>';

          // Business Metrics Card
          html += '<div class="health-card"><h3>Business Metrics</h3>';
          if (summary) {
            html += healthRow('Registered Users', summary.users ? summary.users.total : '-');
            html += healthRow('Vehicles', summary.vehicles ? summary.vehicles.total : '-');
            html += healthRow('Total Appointments', summary.appointments ? summary.appointments.total : '-');
            html += healthRow('Pending Appointments', summary.appointments ? summary.appointments.pending : '-');
          } else {
            html += '<div class="empty">Could not fetch summary</div>';
          }
          html += '</div>';

          // Error Breakdown Card
          html += '<div class="health-card"><h3>Error Breakdown</h3>';
          if (summary && summary.errors) {
            var e = summary.errors;
            html += healthRow('Total Errors', e.total != null ? e.total : '-');
            html += healthRow('Unresolved', '<span style="color:#ef4444;font-weight:600">' + (e.unresolved != null ? e.unresolved : '-') + '</span>');
            html += healthRow('Last 24h', e.last24h != null ? e.last24h : '-');
            if (e.bySeverity && Object.keys(e.bySeverity).length > 0) {
              var sevHtml = '';
              ['critical','high','medium','low'].forEach(function(s) {
                if (e.bySeverity[s]) sevHtml += '<span class="badge ' + s + '" style="margin-right:4px">' + s + ': ' + e.bySeverity[s] + '</span>';
              });
              html += healthRow('By Severity', sevHtml);
            }
            if (e.bySource && Object.keys(e.bySource).length > 0) {
              var srcHtml = Object.entries(e.bySource).map(function(kv) { return kv[0] + ': ' + kv[1]; }).join(', ');
              html += healthRow('By Source (7d)', srcHtml);
            }
          }
          html += '</div>';

          // Bug Summary Card
          html += '<div class="health-card"><h3>Bug Reports</h3>';
          if (summary && summary.bugs) {
            html += healthRow('Total Reports', summary.bugs.total != null ? summary.bugs.total : '-');
            html += healthRow('Open', '<span style="color:#eab308;font-weight:600">' + (summary.bugs.open != null ? summary.bugs.open : '-') + '</span>');
          }
          html += '</div>';

          html += '</div>'; // close health-grid

          // Health History Table
          if (history && history.snapshots && history.snapshots.length) {
            html += '<h2>Health Snapshot History (last ' + history.snapshots.length + ')</h2>';
            html += '<table><thead><tr><th>Time</th><th>API</th><th>DB</th><th>SMS</th><th>DB ms</th><th>Users</th><th>Vehicles</th><th>Appts</th><th>Errors Today</th><th>Uptime</th></tr></thead><tbody>';
            history.snapshots.forEach(function(s) {
              html += '<tr>'
                + '<td>' + new Date(s.createdAt).toLocaleString() + '</td>'
                + '<td><span class="badge ' + s.apiStatus + '">' + s.apiStatus + '</span></td>'
                + '<td><span class="badge ' + s.dbStatus + '">' + s.dbStatus + '</span></td>'
                + '<td><span class="badge ' + s.smsStatus + '">' + s.smsStatus + '</span></td>'
                + '<td>' + (s.dbResponseTimeMs != null ? s.dbResponseTimeMs : '-') + '</td>'
                + '<td>' + (s.totalUsers != null ? s.totalUsers : '-') + '</td>'
                + '<td>' + (s.totalVehicles != null ? s.totalVehicles : '-') + '</td>'
                + '<td>' + (s.totalAppointments != null ? s.totalAppointments : '-') + '</td>'
                + '<td>' + (s.errorCountToday != null ? s.errorCountToday : '-') + '</td>'
                + '<td>' + formatUptime(s.uptimeSeconds) + '</td>'
                + '</tr>';
            });
            html += '</tbody></table>';
          }

          content.innerHTML = html;
        });
      }

      // ── TAB: Submit Bug Report ──
      if (tab === 'submit') {
        content.innerHTML = '<div class="form">'
          + '<label>Your Name *</label>'
          + '<input id="br-name" placeholder="e.g. Elnur" />'
          + '<label>Phone</label>'
          + '<input id="br-phone" placeholder="+994..." />'
          + '<label>Role</label>'
          + '<select id="br-role"><option value="tester">Tester</option><option value="admin">Admin</option><option value="service_center">Service Center</option><option value="user">User</option></select>'
          + '<label>Bug Title *</label>'
          + '<input id="br-title" placeholder="Short description of the bug" />'
          + '<label>Description *</label>'
          + '<textarea id="br-desc" placeholder="What happened? What did you expect?"></textarea>'
          + '<label>Steps to Reproduce</label>'
          + '<textarea id="br-steps" placeholder="1. Open app\\n2. Go to...\\n3. Tap..."></textarea>'
          + '<label>Severity</label>'
          + '<select id="br-severity"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="critical">Critical</option></select>'
          + '<label>App Version</label>'
          + '<input id="br-version" placeholder="e.g. 1.0.20" value="1.0.20" />'
          + '<label>Device Info</label>'
          + '<input id="br-device" placeholder="e.g. Samsung Galaxy S24, Android 15" />'
          + '<br/>'
          + '<button class="btn" onclick="submitBug()">Submit Bug Report</button>'
          + '</div>';
      }
    }

    function healthRow(key, val) {
      return '<div class="health-row"><span class="health-key">' + key + '</span><span class="health-val">' + val + '</span></div>';
    }

    function formatUptime(seconds) {
      if (!seconds && seconds !== 0) return '-';
      var d = Math.floor(seconds / 86400);
      var h = Math.floor((seconds % 86400) / 3600);
      var m = Math.floor((seconds % 3600) / 60);
      var s = seconds % 60;
      var parts = [];
      if (d > 0) parts.push(d + 'd');
      if (h > 0) parts.push(h + 'h');
      if (m > 0) parts.push(m + 'm');
      parts.push(s + 's');
      return parts.join(' ');
    }

    function escHtml(str) {
      if (!str) return '';
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function resolveError(id) {
      var name = prompt('Your name (who resolved this):');
      if (!name) return;
      trpcMutate('monitoring.errors.resolve', { id: id, resolvedBy: name }).then(function(result) {
        if (result && result.success) {
          loadData();
        } else {
          alert('Failed to resolve error.');
        }
      });
    }

    function submitBug() {
      var report = {
        reporterName: document.getElementById('br-name').value,
        reporterPhone: document.getElementById('br-phone').value || undefined,
        reporterRole: document.getElementById('br-role').value,
        title: document.getElementById('br-title').value,
        description: document.getElementById('br-desc').value,
        stepsToReproduce: document.getElementById('br-steps').value || undefined,
        severity: document.getElementById('br-severity').value,
        appVersion: document.getElementById('br-version').value || undefined,
        deviceInfo: document.getElementById('br-device').value || undefined,
      };
      if (!report.reporterName || !report.title || !report.description) {
        alert('Please fill in Name, Title, and Description.');
        return;
      }
      trpcMutate('monitoring.bugs.submit', report).then(function(result) {
        if (result && result.success) {
          alert('Bug report submitted! ID: ' + result.id);
          showTab('bugs');
        } else {
          alert('Failed to submit. Is the database connected?');
        }
      });
    }

    function saveSnapshot() {
      trpcMutate('monitoring.health.saveSnapshot', {}).then(function(result) {
        if (result && result.success) {
          alert('Health snapshot saved to database.');
          if (currentTab === 'health') showTab('health');
        } else {
          alert('Failed to save snapshot.');
        }
      });
    }

    function exportReport() {
      Promise.all([
        trpcCall('monitoring.errors.list', { limit: 500 }),
        trpcCall('monitoring.bugs.list', { limit: 100 }),
        trpcCall('monitoring.health.live', undefined),
        trpcCall('monitoring.health.summary', undefined),
      ]).then(function(results) {
        var errors = results[0];
        var bugs = results[1];
        var health = results[2];
        var summary = results[3];
        var report = {
          exportDate: new Date().toISOString(),
          apiVersion: 'v1.0.4',
          systemHealth: health,
          summary: summary,
          errors: errors ? errors.errors : [],
          bugReports: bugs ? bugs.reports : [],
        };
        var blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'qaraj-monitoring-report-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
      });
    }

    // Auto-refresh every 60 seconds
    setInterval(loadData, 60000);

    // Initial load
    loadData();
  </script>
</body>
</html>`;
  // Inject API key server-side (only visible to whitelisted IPs)
  const apiKey = process.env.QARAJ_API_KEY || '';
  return c.html(html.replace('%%MONITORING_KEY%%', apiKey));
});

// ── Static Car Images (no auth, cached by clients) ─────────────────────────────
app.get("/static/cars/*", async (c) => {
  const filePath = c.req.path.replace("/static/cars/", "");
  // Sanitize path to prevent directory traversal
  if (filePath.includes("..") || filePath.startsWith("/")) {
    return c.text("Forbidden", 403);
  }
  const fullPath = join(process.cwd(), "car-images", filePath);
  try {
    const fileStat = await stat(fullPath);
    if (!fileStat.isFile()) return c.text("Not found", 404);
    const data = await readFile(fullPath);
    const ext = extname(fullPath).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".webp": "image/webp",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
    };
    c.header("Content-Type", mimeMap[ext] || "application/octet-stream");
    c.header("Cache-Control", "public, max-age=2592000"); // 30 days
    c.header("Access-Control-Allow-Origin", "*");
    return c.body(data);
  } catch {
    return c.text("Not found", 404);
  }
});

// ── tRPC API Routes (API key + rate limiting) ─────────────────────────────────
app.use("/api/trpc/*", rateLimiter);
app.use("/api/trpc/*", apiKeyAuth);
app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// ── Start the HTTP server using Node.js built-in http module ──────────────────
const port = parseInt(process.env.PORT || '3000', 10);

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${port}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // FIX: Inject the REAL client IP from the TCP socket into a custom header.
  // Hono's Request object doesn't have access to Node.js socket info,
  // so we pass it via 'x-real-client-ip' header which security.ts reads.
  // ═══════════════════════════════════════════════════════════════════════════
  const realClientIp = req.socket?.remoteAddress || '0.0.0.0';

  // Collect request body
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const body = Buffer.concat(chunks);

  // Build a standard Request object for Hono
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  // Inject real client IP — this is set by our own server, NOT by the client
  headers.set('x-real-client-ip', realClientIp);

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method || 'GET') ? undefined : body,
  });

  // Let Hono handle it
  const response = await app.fetch(request);

  // Send the response back
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  const responseBody = await response.arrayBuffer();
  res.end(Buffer.from(responseBody));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[SECURITY] API Key protection: ENABLED`);
  console.log(`[SECURITY] Rate limiting: ENABLED`);
  console.log(`[SECURITY] Monitoring IP whitelist: ENABLED`);
  console.log(`[SECURITY] Allowed monitoring IPs: ${process.env.MONITORING_ALLOWED_IPS || '127.0.0.1,::1,::ffff:127.0.0.1'}`);
  console.log(`Qaraj GM Backend API v1.0.4 running at http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/`);
  console.log(`Monitoring:   http://localhost:${port}/monitoring`);
});
