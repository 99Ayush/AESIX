import fs from 'fs';
import path from 'path';

// Define logs directory and error log file path
const LOGS_DIR = path.resolve(process.cwd(), 'logs');
const ERROR_LOG_PATH = path.join(LOGS_DIR, 'error.log');

// Ensure logs directory exists
const ensureLogsDirExists = () => {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
};

/**
 * Log error details with timestamp to backend/logs/error.log
 * @param {Error|string} error - Error object or error message
 * @param {Object} [context] - Additional contextual information (e.g. req details)
 */
export const logError = (error, context = null) => {
  try {
    ensureLogsDirExists();
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error && error.stack ? error.stack : '';

    let logEntry = `[${timestamp}] ERROR: ${errorMessage}\n`;
    if (context) {
      logEntry += `Context: ${JSON.stringify(context)}\n`;
    }
    if (stackTrace) {
      logEntry += `Stack: ${stackTrace}\n`;
    }
    logEntry += `--------------------------------------------------\n`;

    fs.appendFileSync(ERROR_LOG_PATH, logEntry, 'utf8');
  } catch (err) {
    console.error('Failed to write to error log file:', err);
  }
};

/**
 * Express error handling middleware to automatically log errors
 */
export const errorLogger = (err, req, res, next) => {
  logError(err, {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip,
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};

export default logError;
