const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Mongo connection string comes from the environment (set in docker-compose.yml)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notesdb';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Mongoose model ----------
const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', noteSchema);

// ---------- Connect to MongoDB (retry loop, since the mongo container
// might not be ready the instant this container starts) ----------
async function connectWithRetry() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB at', MONGO_URI);
  } catch (err) {
    console.error('MongoDB connection failed, retrying in 5s...', err.message);
    setTimeout(connectWithRetry, 5000);
  }
}
connectWithRetry();

// ---------- API routes ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongoState: mongoose.connection.readyState });
});

app.get('/api/notes', async (req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 });
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Note text is required' });
  }
  const note = await Note.create({ text: text.trim() });
  res.status(201).json(note);
});

app.delete('/api/notes/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Fallback to index.html for any non-API route (simple SPA-style serving)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
