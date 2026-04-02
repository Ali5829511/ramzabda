import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'RAMZABDAE_VERIFY_2026';

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'ramzabda' });
});

// Meta webhook verification endpoint
app.get('/api/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Meta webhook events endpoint
app.post('/api/webhooks/whatsapp', (req, res) => {
  const payload = req.body;

  // Keep minimal logging for debugging webhook delivery in Railway logs.
  console.log('WhatsApp webhook event:', JSON.stringify(payload));

  return res.sendStatus(200);
});

// Serve the React SPA from the build output
const distPath = join(__dirname, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback – only for non-API routes
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
