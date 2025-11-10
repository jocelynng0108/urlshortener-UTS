// backend/server.js
const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');

const app = express();
const port = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${port}`; // used for building short URL

app.use(cors());
app.use(express.json());

// In-memory store: { code: { originalUrl, createdAt, hits } }
const store = Object.create(null);

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Create short URL
app.post('/api/shorten', (req, res) => {
  const { url, custom, ttl } = req.body;
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url is required' });

  // basic validation
  try {
    const u = new URL(url);
  } catch (err) {
    return res.status(400).json({ error: 'invalid url' });
  }

  const code = custom && typeof custom === 'string' && custom.trim() !== '' ? custom.trim() : nanoid(7);
  if (store[code]) return res.status(409).json({ error: 'code already exists' });

  store[code] = {
    originalUrl: url,
    createdAt: new Date().toISOString(),
    hits: 0,
    ttl: typeof ttl === 'number' && ttl > 0 ? Date.now() + ttl * 1000 : null // ttl in seconds
  };

  const shortUrl = `${BASE_URL}/${code}`;
  res.status(201).json({ code, shortUrl, originalUrl: url });
});

// Redirect short url
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const record = store[code];
  if (!record) return res.status(404).send('Not found');

  // check TTL
  if (record.ttl && Date.now() > record.ttl) {
    delete store[code];
    return res.status(404).send('Not found');
  }

  record.hits = (record.hits || 0) + 1;
  res.redirect(record.originalUrl);
});

// Info endpoint
app.get('/api/info/:code', (req, res) => {
  const { code } = req.params;
  const record = store[code];
  if (!record) return res.status(404).json({ error: 'not found' });
  res.json({
    code,
    originalUrl: record.originalUrl,
    createdAt: record.createdAt,
    hits: record.hits,
    ttl: record.ttl
  });
});

// Generate QR for short url
app.post('/api/generate-qr', async (req, res) => {
  const { code, size } = req.body;
  if (!code) return res.status(400).json({ error: 'code is required' });
  const record = store[code];
  if (!record) return res.status(404).json({ error: 'not found' });
  const shortUrl = `${BASE_URL}/${code}`;
  try {
    const options = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: typeof size === 'number' && size > 0 ? size : 300,
      margin: 1
    };
    const dataUrl = await QRCode.toDataURL(shortUrl, options);
    res.json({ shortUrl, dataUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to generate qr' });
  }
});

app.listen(port, () => {
  console.log(`Shortener API running on port ${port}`);
  console.log(`BASE_URL=${BASE_URL}`);
});
