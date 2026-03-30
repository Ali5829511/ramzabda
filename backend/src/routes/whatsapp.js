const express = require('express');
const router = express.Router();

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'RAMZABDAE_VERIFY_2026';

// Meta webhook verification (GET)
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Receive WhatsApp events (POST)
router.post('/', (req, res) => {
  const payload = req.body;
  console.log('WhatsApp webhook event:', JSON.stringify(payload));
  return res.sendStatus(200);
});

module.exports = router;
