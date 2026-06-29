import express from 'express';
import cors from 'cors';
import { getDb } from './db';

const app = express();
app.use(cors());
app.use(express.json());

// trim: single health endpoint, add routes folder when API grows
app.get('/health', async (req, res) => {
  try {
    const db = await getDb();
    // simple query to verify db is alive
    await db.get('SELECT 1');
    res.json({ status: 'ok', ts: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'db connection failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
