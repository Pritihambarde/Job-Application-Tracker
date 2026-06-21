const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { loginLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimiters');
const {
  handleValidation,
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../middleware/validators');
const {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../utils/email');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

function signToken(userId) {
  return jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// REGISTER
router.post('/register', registerLimiter, registerRules, handleValidation, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      // Same message as "invalid credentials" elsewhere would leak nothing extra here,
      // but for registration it's standard UX to tell the user the email is taken.
      return res.status(400).json({ msg: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');

    user = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24h
    });

    await user.save();

    // Fire-and-forget — don't block the response on email delivery
    sendWelcomeEmail(user.email, user.name).catch(() => {});
    sendVerificationEmail(user.email, user.name, verificationToken).catch(() => {});

    const token = signToken(user.id);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, isVerified: user.isVerified },
      msg: 'Account created. Check your email to verify your address.',
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// LOGIN
router.post('/login', loginLimiter, loginRules, handleValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Use an identical message whether the email doesn't exist or the password is wrong,
    // so the API never reveals which emails are registered.
    const invalidMsg = { msg: 'Invalid email or password' };

    if (!user) {
      return res.status(400).json(invalidMsg);
    }

    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        msg: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME_MS;
        user.failedLoginAttempts = 0;
      }
      await user.save();
      return res.status(400).json(invalidMsg);
    }

    // Successful login — reset any failed-attempt tracking
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, isVerified: user.isVerified },
      msg: 'Login successful',
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// VERIFY EMAIL
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Verification link is invalid or has expired' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ msg: 'Email verified successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// RESEND VERIFICATION EMAIL
router.post('/resend-verification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.isVerified) return res.status(400).json({ msg: 'Email is already verified' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationToken);
    res.json({ msg: 'Verification email sent' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', passwordResetLimiter, forgotPasswordRules, handleValidation, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return the same response, whether or not the email exists,
    // so the endpoint can't be used to enumerate registered accounts.
    const genericResponse = { msg: 'If an account exists for that email, a reset link has been sent.' };

    if (!user) {
      return res.json(genericResponse);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, user.name, resetToken);
    res.json(genericResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// RESET PASSWORD
router.post('/reset-password/:token', resetPasswordRules, handleValidation, async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Reset link is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.json({ msg: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET current logged-in user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
