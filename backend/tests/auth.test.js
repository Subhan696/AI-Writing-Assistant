process.env.JWT_SECRET = 'testsecret';

const jwt = require('jsonwebtoken');
const express = require('express');
const request = require('supertest');
require('dotenv').config({ path: './.env' });

// Minimal auth middleware from backend/index.js
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

describe('Auth Middleware', () => {
  const app = express();
  app.get('/protected', auth, (req, res) => {
    res.json({ user: req.user });
  });

  it('should reject requests without a token', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('No token, authorization denied');
  });

  it('should reject requests with an invalid token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('x-auth-token', 'invalidtoken');
    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Token is not valid');
  });

  it('should allow requests with a valid token', async () => {
    const token = jwt.sign({ user: { id: 'testid' } }, process.env.JWT_SECRET);
    const res = await request(app)
      .get('/protected')
      .set('x-auth-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toEqual({ id: 'testid' });
  });
}); 