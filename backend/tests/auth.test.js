const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

const validUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPass123!',
};

describe('POST /api/auth/register', () => {
  it('creates a new account and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.isVerified).toBe(false);
  });

  it('hashes the password — it is never stored or returned in plain text', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const stored = await User.findOne({ email: validUser.email });

    expect(stored.password).not.toBe(validUser.password);
    expect(stored.password.length).toBeGreaterThan(20);
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/already exists/i);
  });

  it('rejects an invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'Ab1' });

    expect(res.status).toBe(400);
  });

  it('rejects a password with no number', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'NoNumbersHere' });

    expect(res.status).toBe(400);
  });

  it('rejects a password with no special character', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'TestPass123' });

    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/special character/i);
  });

  it('rejects a password with no uppercase letter', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'testpass123!' });

    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/uppercase/i);
  });

  it('rejects a name containing numbers', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, name: 'John123' });

    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/name/i);
  });

  it('accepts names with hyphens, apostrophes and accents', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, name: "Mary-Jane O'Neil Zoë" });

    expect(res.status).toBe(201);
  });

  it('rejects a missing name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'noname@example.com', password: 'TestPass123!' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects an incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPassword1' });

    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/invalid email or password/i);
  });

  it('rejects a non-existent email with the same message as a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'WhateverPass1' });

    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/invalid email or password/i);
  });

  it('locks the account after 5 failed attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'WrongPassword1' });
    }

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password }); // even the correct password

    expect(res.status).toBe(423);
    expect(res.body.msg).toMatch(/too many failed attempts/i);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('x-auth-token', 'garbage-token');
    expect(res.status).toBe(401);
  });

  it('returns the current user with a valid token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const token = registerRes.body.token;

    const res = await request(app).get('/api/auth/me').set('x-auth-token', token);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(validUser.email);
    expect(res.body.password).toBeUndefined();
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('returns the same generic message whether or not the email exists', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const knownRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: validUser.email });
    const unknownRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'ghost@example.com' });

    expect(knownRes.status).toBe(200);
    expect(unknownRes.status).toBe(200);
    expect(knownRes.body.msg).toBe(unknownRes.body.msg);
  });

  it('sets a reset token on the user record', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    await request(app).post('/api/auth/forgot-password').send({ email: validUser.email });

    const user = await User.findOne({ email: validUser.email });
    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordExpires.getTime()).toBeGreaterThan(Date.now());
  });
});

describe('POST /api/auth/reset-password/:token', () => {
  it('resets the password with a valid token and allows login with the new password', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    await request(app).post('/api/auth/forgot-password').send({ email: validUser.email });

    const user = await User.findOne({ email: validUser.email });
    const newPassword = 'BrandNewPass1!';

    const resetRes = await request(app)
      .post(`/api/auth/reset-password/${user.resetPasswordToken}`)
      .send({ password: newPassword });

    expect(resetRes.status).toBe(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: newPassword });

    expect(loginRes.status).toBe(200);
  });

  it('rejects an invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password/not-a-real-token')
      .send({ password: 'BrandNewPass1!' });

    expect(res.status).toBe(400);
  });
});
