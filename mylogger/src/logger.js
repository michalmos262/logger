const { DEVELOPMENT, PRODUCTION, LOG_LEVELS } = require('./constants');
const { ApiKeyIsMissingError, NotInitializedError, InvalidEnvError } = require('./errors');
const ServiceLogger = require('./ServiceLogger');

let initialized = false;
let config = getDefaultConfigObject();
let logsTarget = console;

function getDefaultConfigObject() {
  return {
    env: DEVELOPMENT,
    apiKey: null
  };
}

/**
 * Initialize the logger with configuration options.
 * Can only be called once - subsequent calls are ignored.
 * @param {Object} options - Configuration options
 * @param {string} [options.env=DEVELOPMENT] - Environment mode ('development' or 'production')
 * @param {string} [options.apiKey] - API key for production logging service (required in production)
 * @throws {ApiKeyIsMissingError} When env is 'production' and apiKey is not provided
 */
function init(options = {}) {
  if (initialized) return;

  config = { ...config, ...options };

  if (config.env !== DEVELOPMENT && config.env !== PRODUCTION) {
    throw new InvalidEnvError(config.env, [DEVELOPMENT, PRODUCTION]);
  }

  if (config.env === PRODUCTION) {
    if (!config.apiKey) {
      throw new ApiKeyIsMissingError();
    }

    ServiceLogger.init(config.apiKey);
    logsTarget = ServiceLogger;
  } else {
    logsTarget = console;
  }

  initialized = true;
}

/**
 * Internal function to output log messages.
 * Passes arguments directly to the target (console or ServiceLogger).
 * @param {string} level - Log level (log, info, warn, error)
 * @param {...*} args - Arguments to log
 * @throws {NotInitializedError} When logger has not been initialized
 * @private
 */
function output(level, ...args) {
  if (!initialized) {
    throw new NotInitializedError();
  }

  const logMethod = logsTarget[level] ?? logsTarget.log;
  logMethod.apply(logsTarget, args);
}

/**
 * Logger object with methods for different log levels.
 * Behaves like standard console methods.
 * @type {Object}
 * @property {function(...*): void} log - Log a standard message
 * @property {function(...*): void} info - Log an informational message
 * @property {function(...*): void} warn - Log a warning message
 * @property {function(...*): void} error - Log an error message
 */
const logger = {
  log: (...args) => output(LOG_LEVELS.LOG, ...args),
  info: (...args) => output(LOG_LEVELS.INFO, ...args),
  warn: (...args) => output(LOG_LEVELS.WARN, ...args),
  error: (...args) => output(LOG_LEVELS.ERROR, ...args)
};

module.exports = {
  init,
  logger
};