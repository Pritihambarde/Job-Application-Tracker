const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ['Applied', 'Interviewing', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    link: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    // Tracks when status last changed, used to flag stale applications for reminder emails
    lastStatusChangeAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

JobSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.lastStatusChangeAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Job', JobSchema);
