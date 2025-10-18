import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/login', (req, res) => {
  // Empfange Login-Daten, mache aber nichts damit
  if (req.body && req.body.username && req.body.password) {
    return res.json({ ok: true });
  }
  res.status(400).json({ ok: false, error: 'Missing username or password' });
});

app.listen(PORT, () => {
  console.log(`Minimal Login Backend läuft auf http://localhost:${PORT}`);
});
