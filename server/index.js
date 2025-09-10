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

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Successfully connected to MongoDB Atlas!');
}).catch((err) => {
  console.error('Error connecting to MongoDB Atlas:', err);
  process.exit(1);
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
  res.json({ token, user: {
    username: user.username,
    email: user.email,
    age: user.age,
    mobile: user.mobile,
    sex: user.sex
  }});
});

// --- All route and middleware code follows this ---

// Update profile (username, age, mobile, sex)
app.put('/profile', auth, async (req, res) => {
  const { username, age, mobile, sex } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { $set: { username, age, mobile, sex } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: {
      username: user.username,
      age: user.age,
      mobile: user.mobile,
      sex: user.sex,
      email: user.email
    }});
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password and return updated user info
app.post('/change-password', auth, async (req, res) => {
  const { password, newPassword } = req.body;
  if (!password || !newPassword) return res.status(400).json({ error: 'Missing fields' });
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    // Return updated user info (excluding password)
    res.json({
      message: 'Password changed',
      user: {
        username: user.username,
        age: user.age,
        mobile: user.mobile,
        sex: user.sex,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Shorten URL
app.post('/shorten', auth, async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).json({ error: 'No URL provided' });
  try {
    const shortId = nanoid(7);
    const newUrl = await Url.create({
      longUrl,
      shortId,
      user: {
        username: req.user.username,
        email: req.user.email,
      },
    });
    res.json(newUrl);
  } catch (err) {
    res.status(500).json({ error: 'Failed to shorten URL' });
  }
});

// Get user's URLs
app.get('/my-urls', auth, async (req, res) => {
  try {
    const urls = await Url.find({ 'user.email': req.user.email });
    res.json(urls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});

// Delete one or more URLs or all history (auth required)
app.delete('/my-urls', auth, async (req, res) => {
  if (req.body.ids === 'ALL') {
    try {
      const result = await Url.deleteMany({ 'user.email': req.user.email });
      return res.json({ deletedCount: result.deletedCount });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete all URLs' });
    }
  }
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No IDs provided' });
  }
  try {
    // Only delete URLs belonging to the user
    const result = await Url.deleteMany({
      _id: { $in: ids },
      'user.email': req.user.email,
    });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete URLs' });
  }
});

// Fetch user data
app.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      username: user.username,
      email: user.email,
      age: user.age,
      mobile: user.mobile,
      sex: user.sex,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect short URL
app.get('/:shortId', async (req, res) => {
  try {
    const url = await Url.findOne({ shortId: req.params.shortId });
    if (url) {
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).json('No url found');
    }
  } catch (err) {
    res.status(500).json('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
