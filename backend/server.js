require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { startReminderScheduler } = require('./jobs/reminderScheduler');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected ✅');
    startReminderScheduler();
  })
  .catch((err) => console.log('MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});
