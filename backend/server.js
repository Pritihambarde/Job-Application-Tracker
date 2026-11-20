require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { startReminderScheduler } = require('./jobs/reminderScheduler');

// Run a normal server everywhere except Vercel serverless
if (!process.env.VERCEL) {
  mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('MongoDB Connected ✅');
    startReminderScheduler();
  }).catch((err) => console.error('MongoDB error:', err.message));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT} ✅`));
}

module.exports = app;
