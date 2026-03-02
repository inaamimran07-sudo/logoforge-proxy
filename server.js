const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const multer = require('multer');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'LogoForge proxy running' });
});

// Text to image
app.post('/generate', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(400).json({ error: 'No API key provided' });
  try {
    const response = await fetch('https://api.ideogram.ai/v1/ideogram-v3/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Api-Key': apiKey },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Image remix
app.post('/remix', upload.single('image'), async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(400).json({ error: 'No API key provided' });
  if (!req.file) return res.status(400).json({ error: 'No image provided' });
  try {
    const form = new FormData();
    form.append('image', req.file.buffer, {
      filename: req.file.originalname || 'image.png',
      contentType: req.file.mimetype
    });
    form.append('prompt', req.body.prompt || '');
    form.append('rendering_speed', 'DEFAULT');
    form.append('style_type', 'DESIGN');
    form.append('aspect_ratio', '1x1');
    if (req.body.image_weight) form.append('image_weight', req.body.image_weight);

    const response = await fetch('https://api.ideogram.ai/v1/ideogram-v3/remix', {
      method: 'POST',
      headers: { 'Api-Key': apiKey, ...form.getHeaders() },
      body: form
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log('LogoForge proxy running on port ' + PORT);
});
