import express from 'express';

const router = express.Router();

// Proxy endpoint to fetch UNISA news bypassing SSL handshake errors
router.get('/', async (req, res) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://www.unisa.it', { signal: controller.signal });
    const html = await response.text();
    clearTimeout(timeoutId);
    res.send(html);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error('Backend failed to fetch UNISA news:', err.message);
    res.send('');
  }
});

export default router;
