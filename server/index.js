require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Url = require('./models/Url');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Successfully connected to MongoDB Atlas!');
}).catch((err) => {
  console.error('Error connecting to MongoDB Atlas:', err);
  process.exit(1); // Exit the process with an error code
});

// Auth middleware
function auth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Register
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, email, password: hashed });
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: 'User/email already exists' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, username: user.username, email: user.email });
});

// Shorten URL (auth required)
app.post('/shorten', auth, async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl || !/^https?:\/\//.test(longUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  const shortId = nanoid(7);
  await Url.create({
    shortId,
    longUrl,
    user: { username: req.user.username, email: req.user.email },
  });
  res.json({ shortUrl: `${req.protocol}://${req.get('host')}/${shortId}` });
});

// Get user's URLs (auth required)
app.get('/my-urls', auth, async (req, res) => {
  const urls = await Url.find({ 'user.email': req.user.email }).sort({ createdAt: -1 });
  res.json(urls);
});

// Redirect endpoint
app.get('/:shortId', async (req, res) => {
  const { shortId } = req.params;
  const urlDoc = await Url.findOne({ shortId });
  if (urlDoc) {
    return res.redirect(urlDoc.longUrl);
  }
  res.status(404).send('URL not found');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
