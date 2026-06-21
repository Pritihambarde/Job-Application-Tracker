const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    // Email verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Brute-force protection
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,

    // Reminder email tracking (avoid spamming the same stale job repeatedly)
    lastReminderSentAt: Date,
  },
  { timestamps: true }
);

UserSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model('User', UserSchema);
