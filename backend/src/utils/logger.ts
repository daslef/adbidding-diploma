import { createLogger, format, transports } from "winston";

const devFormat = format.printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""}`;
});

export const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "DD.MM.YYYY HH:mm:ss" }),
    process.env.NODE_ENV === "production" ? format.json() : devFormat,
  ),
  defaultMeta: { service: "ad-tech-api" },
  transports: [
    // консольный вывод
    new transports.Console({
      format: format.combine(
        format.colorize(),
        process.env.NODE_ENV === "production" ? format.json() : devFormat,
      ),
    }),

    // запись в файл для продакшн-окружения
    ...(process.env.NODE_ENV === "production"
      ? [
        // логи ошибок
        new transports.File({
          filename: "logs/error.log",
          level: "error",
          maxsize: 10485760, // 10MB
          maxFiles: 5,
        }),
        // комбинированные логи
        new transports.File({
          filename: "logs/combined.log",
          maxsize: 10485760, // 10MB
          maxFiles: 5,
        }),
      ]
      : []),
  ],
  exitOnError: false,
});
