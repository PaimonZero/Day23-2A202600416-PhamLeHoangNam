const http = require('http');

const data = JSON.stringify({ prompt: 'hello' });

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/predict',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      console.log('trace_id:', parsed.trace_id || '?');
    } catch {
      console.log('trace_id: ?');
    }
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
