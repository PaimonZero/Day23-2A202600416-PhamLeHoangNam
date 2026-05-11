const http = require('http');

const endpoints = [
  { name: 'app', url: 'http://localhost:8000/healthz' },
  { name: 'prometheus', url: 'http://localhost:9090/-/healthy' },
  { name: 'alertmanager', url: 'http://localhost:9093/-/healthy' },
  { name: 'grafana', url: 'http://localhost:3000/api/health', check: body => body.includes('"database":"ok"') },
  { name: 'loki', url: 'http://localhost:3100/ready' },
  { name: 'jaeger', url: 'http://localhost:16686/' },
  { name: 'otel-collector', url: 'http://localhost:8888/metrics' }
];

console.log('Checking services...');

async function checkService(service) {
  return new Promise((resolve) => {
    http.get(service.url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (service.check && !service.check(data)) {
          resolve(false);
        } else {
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        }
      });
    }).on('error', () => resolve(false));
  });
}

async function run() {
  let allOk = true;
  for (const service of endpoints) {
    const ok = await checkService(service);
    if (ok) {
      console.log(`  ${service.name.padEnd(14)}: OK`);
    } else {
      console.log(`  ${service.name.padEnd(14)}: FAIL`);
      allOk = false;
    }
  }
  if (allOk) {
    console.log('Stack healthy.');
  } else {
    process.exit(1);
  }
}

run();
