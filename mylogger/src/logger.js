const { DEVELOPMENT, PRODUCTION, SERVICE_NAME, LOG_LEVELS } = require('./constants');
const ApiKeyIsMissingError = require('./errors/apiKeyIsMissingError');
const NotInitializedError = require('./errors/notInitializedError');
const ServiceLogger = require('./ServiceLogger');

let initialized = false;
let config = getDefaultConfigObject();
let logsTarget = console;

function getDefaultConfigObject() {
  return {
    env: DEVELOPMENT,
    apiKey: null,
    serviceName: SERVICE_NAME
  }
}

function init(options = {}) {
  if (initialized) return;

  config = { ...config, ...options };

  if (config.env === PRODUCTION) {
    if (!config.apiKey) {
      throw new ApiKeyIsMissingError();
    }

    ServiceLogger.init(config.apiKey);
    logsTarget = ServiceLogger;
  }
  else {
    logsTarget = console;
  }

  initialized = true;
}

function output(level, ...args) {
  if (!initialized) {
    throw new NotInitializedError();
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    service: config.serviceName,
    message: args.length === 1 ? args[0] : args
  };

  const message = JSON.stringify(payload);

  // Call the appropriate method on the logs target
  const logMethod =
    typeof logsTarget[level] === 'function'
      ? logsTarget[level]
      : logsTarget.log;

  logMethod(message);

}

const logger = {
  log: (...args) => output(LOG_LEVELS.LOG, ...args),
  info: (...args) => output(LOG_LEVELS.INFO, ...args),
  warn: (...args) => output(LOG_LEVELS.WARN, ...args),
  error: (...args) => output(LOG_LEVELS.ERROR, ...args)
};

// Internal function for testing - resets module state
function _reset() {
  initialized = false;
  config = getDefaultConfigObject();
  logsTarget = console;
}

module.exports = {
  init,
  logger,
  _reset
};