// src/shared/logger.js
import fs from 'fs';
import path from 'path';

const LOGS_DIR = path.resolve(process.cwd(), 'logs');
const ERROR_LOG_PATH = path.join(LOGS_DIR, 'error.log');
const COMBINED_LOG_PATH = path.join(LOGS_DIR, 'combined.log');

const ensureLogsDirExists = () => {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
};

function write(level, message, meta = null) {
  try {
    ensureLogsDirExists();
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    const line = `[${timestamp}] [${level}] ${message}${metaStr}\n`;

    fs.appendFileSync(COMBINED_LOG_PATH, line, 'utf8');

    if (level === 'ERROR' || level === 'WARN') {
      fs.appendFileSync(ERROR_LOG_PATH, line, 'utf8');
    }

    // Console output in dev
    if (process.env.NODE_ENV !== 'production') {
      const colors = { ERROR: '\x1b[31m', WARN: '\x1b[33m', INFO: '\x1b[36m', DEBUG: '\x1b[90m', RESET: '\x1b[0m' };
      console.log(`${colors[level] || ''}[${level}]${colors.RESET} ${message}${metaStr}`);
    }
  } catch (err) {
    console.error('Failed to write log:', err);
  }
}

export const logger = {
  info:  (msg, meta) => write('INFO', msg, meta),
  warn:  (msg, meta) => write('WARN', msg, meta),
  error: (msg, meta) => write('ERROR', msg, meta),
  debug: (msg, meta) => write('DEBUG', msg, meta),
};

// ─── Your existing error logger (kept for Express middleware) ─────────────────

export const logError = (error, context = null) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? error.stack : '';
  logger.error(errorMessage, { ...context, stack: stackTrace });
};

export const errorLogger = (err, req, res, next) => {
  logError(err, {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip,
  });

  if (res.headersSent) return next(err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};

export default logger;   