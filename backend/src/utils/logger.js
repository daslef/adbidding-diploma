const winston = require('winston');

// Define log formats
const { format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
});

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env.NODE_ENV === 'production' ? json() : devFormat
  ),
  defaultMeta: { service: 'ad-tech-api' },
  transports: [
    // Console transport for all environments
    new transports.Console({
      format: combine(
        colorize(),
        process.env.NODE_ENV === 'production' ? json() : devFormat
      )
    }),
    
    // File transport for production
    ...(process.env.NODE_ENV === 'production' ? [
      // Error log
      new transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      }),
      // Combined log
      new transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      })
    ] : [])
  ],
  // Don't exit on errors
  exitOnError: false
});

module.exports = { logger };