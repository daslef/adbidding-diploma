import dotenv from 'dotenv';
import express from 'express'
import http from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import routes from './src/routes/index.js'
import { setupRedis } from './src/config/redis.js'
import { connectToDatabase, sequelize } from './src/config/database.js'
import { logger } from './src/utils/logger.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { seedData } from './src/utils/seedData.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      }
    }
  }
}

dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Database setup and server initialization
const PORT = process.env.PORT || 5010;

const startServer = async () => {
  try {
    logger.info('Настройка WebSocket-обработчиков...');
    require('./src/websockets')(io);

    logger.info('Инициализация Redis...');
    setupRedis();

    logger.info('Подключение к Postgres...');
    await connectToDatabase();

    // Sync database schema
    await sequelize.sync();
    logger.info('Схемы данных синхронизированы с Postgres');

    await seedData();
    logger.info('База данных наполнена');

    server.listen(PORT, () => {
      logger.info(`Сервер запущен на порту ${PORT}`);
      logger.info(`Текущее окружение: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Не удалось запустить сервер', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', async () => {
  logger.info('Сигнал SIGINT получен. Завершаем работу.');
  server.close(() => {
    logger.info('Сервер остановлен');
    process.exit(0);
  });
});

module.exports = { app, server };