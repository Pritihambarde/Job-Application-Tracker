const rateLimit = require('express-rate-limit');

// Generic handler so error responses match the rest of the API's shape
function jsonHandler(message) {
  return (req, res) => {
    res.status(429).json({ msg: message });
  };
}

// Strict limiter for login — the main brute-force target
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many login attempts. Try again in a few minutes.'),
});

// Registration — prevent mass account creation
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many accounts created from this network. Try again later.'),
});

// Password reset requests — prevent email-bombing a victim's inbox
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many password reset requests. Try again later.'),
});

// General API limiter, applied globally as a safety net
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler('Too many requests. Slow down and try again shortly.'),
});

module.exports = {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  generalLimiter,
};
