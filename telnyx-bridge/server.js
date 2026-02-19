const http = require('http');
const https = require('https');

const PORT = 18790;
const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const TELNYX_FROM = '+12539999067';
const OPENCLAW_PORT = 18789;
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN;

// Track conversations by phone number for session continuity
const sessions = new Map();

function getSessionUser(phone) {
  // Stable session key per phone number
  return `telnyx-${phone.replace(/\+/g, '')}`;
}

function askDaequan(from, text, callback) {
  const user = getSessionUser(from);
  
  const payload = JSON.stringify({
    model: 'openclaw',
    user: user,
    messages: [{ role: 'user', content: `[SMS from ${from}]: ${text}` }]
  });

  const req = http.request({
    hostname: '127.0.0.1',
    port: OPENCLAW_PORT,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
      'x-openclaw-agent-id': 'main',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        const reply = result.choices?.[0]?.message?.content || '';
        console.log(`[daequan] → ${from}: ${reply.slice(0, 100)}...`);
        callback(null, reply);
      } catch (e) {
        console.error(`[daequan] parse error: ${e.message}`, data.slice(0, 200));
        callback(e);
      }
    });
  });
  req.on('error', e => {
    console.error('[daequan] request error:', e.message);
    callback(e);
  });
  req.write(payload);
  req.end();
}

function sendSMS(to, text) {
  // Split long messages into 1600-char chunks (SMS limit)
  const chunks = [];
  for (let i = 0; i < text.length; i += 1500) {
    chunks.push(text.slice(i, i + 1500));
  }
  
  chunks.forEach((chunk, i) => {
    const payload = JSON.stringify({
      from: TELNYX_FROM,
      to,
      text: chunk
    });

    const req = https.request({
      hostname: 'api.telnyx.com',
      path: '/v2/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => console.log(`[telnyx] sent chunk ${i + 1}/${chunks.length} to ${to}: ${res.statusCode}`));
    });
    req.on('error', e => console.error('[telnyx] send error:', e.message));
    req.write(payload);
    req.end();
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/telnyx/webhook') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const event = JSON.parse(body);
        const data = event.data;
        
        if (data && data.event_type === 'message.received') {
          const payload = data.payload;
          const from = payload.from?.phone_number;
          const text = payload.text;
          console.log(`[inbound] ${from}: ${text}`);
          
          // Send to Daequan, get response, reply via SMS
          askDaequan(from, text, (err, reply) => {
            if (err || !reply) {
              console.error('[bridge] no reply to send');
              return;
            }
            // Don't send NO_REPLY or HEARTBEAT_OK
            if (reply.trim() === 'NO_REPLY' || reply.trim() === 'HEARTBEAT_OK') {
              console.log('[bridge] suppressed empty reply');
              return;
            }
            sendSMS(from, reply);
          });
        }
      } catch (e) {
        console.error('[parse error]', e.message);
      }
      res.writeHead(200);
      res.end('ok');
    });
  } else if (req.method === 'POST' && req.url === '/send') {
    // Internal endpoint for OpenClaw to send SMS directly
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { to, text } = JSON.parse(body);
        sendSMS(to, text);
        res.writeHead(200);
        res.end('ok');
      } catch (e) {
        res.writeHead(400);
        res.end(e.message);
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  } else {
    res.writeHead(200);
    res.end('daequan bridge alive');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[bridge] Telnyx bridge listening on 127.0.0.1:${PORT}`);
  console.log(`[bridge] Telnyx number: ${TELNYX_FROM}`);
  console.log(`[bridge] OpenClaw: 127.0.0.1:${OPENCLAW_PORT}`);
});
