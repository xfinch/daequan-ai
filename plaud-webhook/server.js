#!/usr/bin/env node
/**
 * PlauD.AI Webhook Handler
 * 
 * Receives voice AI call data from PlauD via Zapier webhook
 * and processes it through OpenClaw.
 * 
 * Expected payload from PlauD.AI:
 * {
 *   "call_id": "uuid",
 *   "phone_number": "+1234567890",
 *   "transcript": "Full conversation transcript...",
 *   "summary": "AI-generated summary",
 *   "intent": "booking|inquiry|support|other",
 *   "entities": {
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "appointment_date": "2026-02-25"
 *   },
 *   "recording_url": "https://...",
 *   "duration_seconds": 120,
 *   "outcome": "completed|transferred|voicemail"
 * }
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';
const DEFAULT_TARGET = process.env.PLAUD_DEFAULT_TARGET || '+18176966645'; // Your WhatsApp

/**
 * Send message to OpenClaw via gateway
 */
async function sendToOpenClaw(message, target = DEFAULT_TARGET) {
  const url = new URL(`${GATEWAY_URL}/v1/message`);
  
  const data = JSON.stringify({
    target: target,
    message: message,
    channel: 'whatsapp'
  });

  return new Promise((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = client.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, body });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Format PlauD.AI data for WhatsApp
 */
function formatMessage(payload) {
  const {
    call_id,
    phone_number,
    transcript,
    summary,
    intent,
    entities = {},
    duration_seconds,
    outcome
  } = payload;

  let message = `🎙️ **New PlauD.AI Call**\n\n`;
  
  if (entities.name) {
    message += `**From:** ${entities.name}\n`;
  }
  if (phone_number) {
    message += `**Number:** ${phone_number}\n`;
  }
  if (intent) {
    message += `**Intent:** ${intent}\n`;
  }
  if (outcome) {
    message += `**Outcome:** ${outcome}\n`;
  }
  if (duration_seconds) {
    const mins = Math.floor(duration_seconds / 60);
    const secs = duration_seconds % 60;
    message += `**Duration:** ${mins}:${secs.toString().padStart(2, '0')}\n`;
  }
  
  message += `\n**Summary:**\n${summary || 'No summary provided'}\n`;
  
  // Add key entities
  const entityFields = ['email', 'appointment_date', 'company', 'notes'];
  const foundEntities = entityFields.filter(f => entities[f]);
  if (foundEntities.length > 0) {
    message += `\n**Details:**\n`;
    foundEntities.forEach(field => {
      message += `• ${field}: ${entities[field]}\n`;
    });
  }
  
  if (transcript) {
    // Truncate long transcripts
    const maxLen = 1500;
    const truncated = transcript.length > maxLen 
      ? transcript.substring(0, maxLen) + '... [truncated]'
      : transcript;
    message += `\n**Transcript:**\n${truncated}\n`;
  }
  
  message += `\n_Call ID: ${call_id}_`;
  
  return message;
}

/**
 * Main webhook handler
 */
async function handleWebhook(req, res) {
  // CORS headers for Zapier
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end('Method not allowed');
    return;
  }

  // Collect body
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const payload = JSON.parse(body);
      console.log('Received PlauD.AI webhook:', payload.call_id || 'no-id');
      
      // Format and send to OpenClaw
      const message = formatMessage(payload);
      await sendToOpenClaw(message);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Forwarded to OpenClaw' }));
    } catch (err) {
      console.error('Webhook error:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

// Start server
const PORT = process.env.PLAUD_WEBHOOK_PORT || 3456;
const server = http.createServer(handleWebhook);

server.listen(PORT, () => {
  console.log(`PlauD.AI webhook handler listening on port ${PORT}`);
  console.log(`Forwarding to OpenClaw at ${GATEWAY_URL}`);
  console.log(`Default target: ${DEFAULT_TARGET}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});
