require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const errorHandler = require('./src/middleware/errorHandler');
const routes = require('./src/routes');

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Connect to database
connectDB();

const app = express();

// Global Middleware
app.use(helmet()); // Set security HTTP headers

// Rate Limiting
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per `window`
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes.'
});
app.use('/api', limiter);

app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // HTTP request logging
}

// Mount API routes
app.use('/api/v1', routes);

// Handle undefined routes
app.use((req, res, next) => {
  const AppError = require('./src/utils/AppError');
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
  }
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id role');

    if (!user) {
      return next(new Error('User no longer exists'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
});

io.on('connection', socket => {
  socket.join(`user:${socket.user._id.toString()}`);
});

app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
