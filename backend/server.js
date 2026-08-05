require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { startReminderScheduler } = require('./jobs/reminderScheduler');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('MongoDB Connected ✅');
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ msg: 'Database connection failed' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    startReminderScheduler();
  });
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} ✅`);
  });
}

module.exports = app;