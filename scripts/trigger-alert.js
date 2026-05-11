const { execSync } = require('child_process');
const http = require('http');

async function getAlertsCount() {
  return new Promise((resolve) => {
    http.get('http://localhost:9093/api/v2/alerts', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const alerts = JSON.parse(data);
          const active = alerts.filter(a => a.state === 'active').length;
          resolve(active);
        } catch {
          resolve(0);
        }
      });
    }).on('error', () => resolve(0));
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('Step 1: kill app container');
  try { execSync('docker stop day23-app', { stdio: 'ignore' }); } catch {}

  console.log('Step 2: wait 90s for ServiceDown alert to fire');
  let fired = false;
  for (let i = 1; i <= 18; i++) {
    await sleep(5000);
    const count = await getAlertsCount();
    if (count > 0) {
      console.log(`  alert fired (after ${i * 5}s)`);
      fired = true;
      break;
    }
    console.log(`  no alert yet (${i * 5}s)`);
  }

  console.log('Step 3: restart app');
  try { execSync('docker start day23-app', { stdio: 'ignore' }); } catch {}

  console.log('Step 4: wait 60s for alert to resolve');
  let resolved = false;
  for (let i = 1; i <= 12; i++) {
    await sleep(5000);
    const count = await getAlertsCount();
    if (count === 0) {
      console.log('  alert resolved');
      resolved = true;
      break;
    }
  }

  if (!resolved) {
    console.error('alert did not resolve within 60s');
    process.exit(1);
  }
}

run();
