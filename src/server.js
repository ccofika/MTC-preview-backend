const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP'
});

app.use(helmet());
app.use(limiter);
app.use(compression());

// Custom morgan logger that filters out noise
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat, {
  skip: function (req, res) {
    // Skip OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') return true;
    
    // Skip 304 Not Modified responses
    if (res.statusCode === 304) return true;
    
    // Skip health check requests
    if (req.url === '/api/health') return true;
    
    return false;
  }
}));
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'https://mtc-preview-opal.vercel.app',
    'https://www.nissal.co.rs'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nissal');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));


// Routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const productRoutes = require('./routes/products');
const projectRoutes = require('./routes/projects');
const adminUserRoutes = require('./routes/adminUsers');
const siteSettingsRoutes = require('./routes/siteSettings');
const homepageSettingsRoutes = require('./routes/homepageSettings');
const translationRoutes = require('./routes/translations');
const auth = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/products', productRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/adminUsers', adminUserRoutes);
app.use('/api/settings', siteSettingsRoutes);
app.use('/api/homepage-settings', homepageSettingsRoutes);
app.use('/api/translations', auth, translationRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Shutting down gracefully...');
  
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;