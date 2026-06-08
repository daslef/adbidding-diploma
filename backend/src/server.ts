import dotenv from "dotenv";
import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import routes from "./routes/index.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { setupRedis } from "./providers/redis.js";
import { connectToDatabase, sequelize } from "./providers/database/connection.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import websockets from "./websockets/index.js";

dotenv.config();

const FRONTEND_URL = process.env['FRONTEND_URL'] || "http://localhost:3000"
const PORT = process.env['PORT'] || 5010;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);


app.use("/api/", apiLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", routes);

app.use(errorHandler);

const startServer = async () => {
  try {
    logger.info("Настройка WebSocket-обработчиков...");
    websockets(io);

    logger.info("Инициализация Redis...");
    setupRedis();

    logger.info("Подключение к Postgres...");
    await connectToDatabase();

    await sequelize.sync();
    logger.info("Схемы данных синхронизированы с Postgres");

    logger.info("База данных наполнена");

    server.listen(PORT, () => {
      logger.info(`Сервер запущен на порту ${PORT}`);
      logger.info(`Текущее окружение: ${process.env['NODE_ENV']}`);
    });
  } catch (error) {
    logger.error("Не удалось запустить сервер", error);
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", async () => {
  logger.info("Сигнал SIGINT получен. Завершаем работу.");
  server.close(() => {
    logger.info("Сервер остановлен");
    process.exit(0);
  });
});

module.exports = { app, server };
