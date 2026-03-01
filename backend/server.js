const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error');
const { startUtilityReminderCron } = require('./utils/utilityReminders');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === 'production') {
      const allowed = (process.env.FRONTEND_URL || '').split(',').map(u => u.trim());
      return allowed.includes(origin) ? callback(null, true) : callback(new Error('Not allowed by CORS'));
    }
    // Development: allow any localhost / 127.0.0.1 origin on any port
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/subactivities', require('./routes/subActivities'));
app.use('/api/milestones', require('./routes/milestones'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/utilities',      require('./routes/utilities'));
app.use('/api/subscriptions',  require('./routes/subscriptions'));
app.use('/api/settings',       require('./routes/publicSettings'));
app.use('/api/contact',        require('./routes/contact'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  // Start daily reminder cron for home utilities
  startUtilityReminderCron();
});
