class ApiKeyIsMissingError extends Error {
  constructor(message = "apiKey is required in production") {
    super(message);
    this.name = "ApiKeyIsMissingError";
  }
}

class NotInitializedError extends Error {
  constructor(message = "Logger not initialized. Call init() first.") {
    super(message);
    this.name = "NotInitializedError";
  }
}

class InvalidEnvError extends Error {
  constructor(env, validEnvs) {
    super(`Invalid env: "${env}". Must be one of these: "${validEnvs.join(', ')}".`);
    this.name = "InvalidEnvError";
  }
}

module.exports = { ApiKeyIsMissingError, NotInitializedError, InvalidEnvError };
