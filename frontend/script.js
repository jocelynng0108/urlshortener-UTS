// frontend/script.js
const API_BASE = (function(){
  return window.__API_BASE__ || 'http://localhost:5000';
})();

const urlInput = document.getElementById('urlInput');
const slugInput = document.getElementById('slugInput');
const shortenBtn = document.getElementById('shortenBtn');
const copyBtn = document.getElementById('copyBtn');
const qrBtn = document.getElementById('qrBtn');
const shortUrlDiv = document.getElementById('shortUrl');
const infoDiv = document.getElementById('info');
const qrImage = document.getElementById('qrImage');
const downloadQrBtn = document.getElementById('downloadQrBtn');
const openShortBtn = document.getElementById('openShortBtn');

let currentShort = '';

async function shorten() {
  const url = urlInput.value.trim();
  const custom = slugInput.value.trim();

  if (!url) return alert('Masukkan URL asli dulu');

  shortenBtn.disabled = true;
  shortenBtn.textContent = 'Processing...';

  try {
    const res = await fetch(`${API_BASE}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, custom: custom || undefined })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    currentShort = json.shortUrl;
    shortUrlDiv.textContent = currentShort;
    infoDiv.textContent = `Original: ${json.originalUrl} • created at ${new Date(json.createdAt || Date.now()).toLocaleString()}`;
    qrImage.src = ''; // clear
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    shortenBtn.disabled = false;
    shortenBtn.textContent = 'Shorten';
  }
}

copyBtn.addEventListener('click', async () => {
  if (!currentShort) return alert('Belum ada short url');
  try {
    await navigator.clipboard.writeText(currentShort);
    alert('Copied!');
  } catch (e) {
    alert('Copy failed');
  }
});

qrBtn.addEventListener('click', async () => {
  if (!currentShort) return alert('Belum ada short url');
  // extract code from short url
  const parts = currentShort.split('/');
  const code = parts[parts.length - 1];
  try {
    const res = await fetch(`${API_BASE}/api/generate-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, size: 400 })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to generate QR');
    qrImage.src = json.dataUrl;
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

downloadQrBtn.addEventListener('click', () => {
  if (!qrImage.src) return alert('Generate QR dulu');
  const a = document.createElement('a');
  a.href = qrImage.src;
  a.download = 'short-qr.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
});

openShortBtn.addEventListener('click', () => {
  if (!currentShort) return alert('Belum ada short url');
  window.open(currentShort, '_blank');
});

shortenBtn.addEventListener('click', shorten);

// allow Enter in URL input
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') shorten();
});
