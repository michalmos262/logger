const ServiceLogger = require('./ServiceLogger');

const DEVELOPMENT = 'development'
const PRODUCTION = 'production'
const SERVICE_NAME = 'unknown'

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
      throw new Error('mylogger: apiKey is required in production');
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
    throw new Error('Logger not initialized. Call init() first.');
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    service: config.serviceName,
    message: args.length === 1 ? args[0] : args
  };

  const message = JSON.stringify(payload);

  // Call the appropriate method on the transport
  if (typeof logsTarget[level] === 'function') {
    logsTarget[level](message);
  } else {
    logsTarget.log(message);
  }
}

const logger = {
  log: (...args) => output('log', ...args),
  info: (...args) => output('info', ...args),
  warn: (...args) => output('warn', ...args),
  error: (...args) => output('error', ...args)
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