require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const History = require('./models/History');
const Share = require('./models/Share');
const axios = require('axios');

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Register route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({
      email,
      password,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.status(201).send('User registered');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Get authenticated user
app.get('/api/auth', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Usage limit middleware
const usageLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (user.isPro) {
      return next(); // Pro users have unlimited usage
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const lastUsed = user.lastUsedDate ? new Date(user.lastUsedDate).setHours(0, 0, 0, 0) : null;

    if (lastUsed !== today) {
      user.dailyUsageCount = 0;
    }

    if (user.dailyUsageCount >= 5) { // 5 is the daily limit for free users
      return res.status(429).json({ msg: 'Daily usage limit reached' });
    }

    user.dailyUsageCount += 1;
    user.lastUsedDate = new Date();
    await user.save();

    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Generate text route
app.post('/api/generate', auth, usageLimit, async (req, res) => {
  const { prompt } = req.body;
  try {
const response = await axios.post(
  'https://api.groq.com/openai/v1/chat/completions',
  {
    model: 'llama3-8b-8192',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 150
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    }
  }
);
const generatedText = response.data.choices[0].message.content;

    const historyEntry = new History({
      user: req.user.id,
      prompt,
      response: generatedText,
    });
    await historyEntry.save();

    res.json({ generatedText });
  } catch (err) {
    console.error('GROQ API error:', err.response ? err.response.data : err.message);
    res.status(500).send('Error generating text');
  }
});

// History route
app.get('/api/history', auth, async (req, res) => {
  try {
    const history = await History.find({ user: req.user.id }).sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Create shareable link
app.post('/api/share', async (req, res) => {
  try {
    const newShare = new Share({ content: req.body.content });
    await newShare.save();
    res.json({ shareId: newShare._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get shared content
app.get('/api/share/:id', async (req, res) => {
  try {
    const share = await Share.findById(req.params.id);
    if (!share) {
      return res.status(404).json({ msg: 'Content not found' });
    }
    res.json(share);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Placeholder route
app.get('/', (req, res) => {
  res.send('AI Writing Assistant Backend');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 