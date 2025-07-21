const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');

// Mock User model
const User = {
  findById: jest.fn(),
};

// Usage limit middleware (from backend/index.js, slightly adapted for testability)
const usageLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (user.isPro) {
      return next();
    }
    const today = new Date().setHours(0, 0, 0, 0);
    const lastUsed = user.lastUsedDate ? new Date(user.lastUsedDate).setHours(0, 0, 0, 0) : null;
    if (lastUsed !== today) {
      user.dailyUsageCount = 0;
    }
    if (user.dailyUsageCount >= 5) {
      return res.status(429).json({ msg: 'Daily usage limit reached' });
    }
    user.dailyUsageCount += 1;
    user.lastUsedDate = new Date();
    await user.save && user.save();
    next();
  } catch (err) {
    res.status(500).send('Server error');
  }
};

describe('Usage Limit Middleware', () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/generate', (req, res, next) => {
      req.user = { id: 'userid' };
      next();
    }, usageLimit, (req, res) => {
      res.json({ msg: 'Allowed' });
    });
    jest.clearAllMocks();
  });

  it('allows pro users unlimited access', async () => {
    User.findById.mockResolvedValue({ isPro: true });
    const res = await request(app).post('/generate');
    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Allowed');
  });

  it('blocks free users over the limit', async () => {
    User.findById.mockResolvedValue({ isPro: false, dailyUsageCount: 5, lastUsedDate: new Date(), save: jest.fn() });
    const res = await request(app).post('/generate');
    expect(res.statusCode).toBe(429);
    expect(res.body.msg).toBe('Daily usage limit reached');
  });

  it('resets daily usage if lastUsedDate is not today', async () => {
    const yesterday = new Date(Date.now() - 86400000);
    const user = { isPro: false, dailyUsageCount: 5, lastUsedDate: yesterday, save: jest.fn() };
    User.findById.mockResolvedValue(user);
    const res = await request(app).post('/generate');
    expect(res.statusCode).toBe(200);
    expect(user.dailyUsageCount).toBe(1);
  });
}); 