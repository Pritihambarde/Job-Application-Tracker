const cron = require('node-cron');
const User = require('../models/User');
const Job = require('../models/Job');
const { sendStaleApplicationReminder } = require('../utils/email');

const STALE_DAYS = 7;
const REMINDER_COOLDOWN_DAYS = 7; // don't email the same user more than once a week

async function runStaleApplicationCheck() {
  const staleThreshold = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  const cooldownThreshold = Date.now() - REMINDER_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

  try {
    const staleJobs = await Job.find({
      status: 'Applied',
      lastStatusChangeAt: { $lt: new Date(staleThreshold) },
    }).populate('user', 'name email lastReminderSentAt isVerified');

    const byUser = new Map();
    for (const job of staleJobs) {
      if (!job.user || !job.user.isVerified) continue;

      const userId = job.user._id.toString();
      if (!byUser.has(userId)) byUser.set(userId, { user: job.user, jobs: [] });

      byUser.get(userId).jobs.push({
        company: job.company,
        role: job.role,
        daysSince: Math.floor((Date.now() - new Date(job.lastStatusChangeAt).getTime()) / (1000 * 60 * 60 * 24)),
      });
    }

    for (const [, { user, jobs }] of byUser) {
      const alreadyRemindedRecently =
        user.lastReminderSentAt && new Date(user.lastReminderSentAt).getTime() > cooldownThreshold;
      if (alreadyRemindedRecently) continue;

      await sendStaleApplicationReminder(user.email, user.name, jobs);
      await User.findByIdAndUpdate(user._id, { lastReminderSentAt: new Date() });
    }

    if (byUser.size > 0) {
      console.log(`[reminders] Sent stale-application emails to ${byUser.size} user(s).`);
    }
  } catch (err) {
    console.error('[reminders] Failed to run stale application check:', err.message);
  }
}

function startReminderScheduler() {
  // Runs once a day at 9:00 AM server time
  cron.schedule('0 9 * * *', runStaleApplicationCheck);
  console.log('[reminders] Stale application reminder scheduler started (daily at 09:00).');
}

module.exports = { startReminderScheduler, runStaleApplicationCheck };
