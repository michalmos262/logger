# mylogger

A dual-mode logging library for Node.js applications that outputs structured JSON logs.

## Installation

```bash
npm install mylogger
```

## Usage

```javascript
const { init, logger } = require('mylogger');

// Initialize the logger
init({
  serviceName: 'my-app',
  env: 'development'  // or 'production'
});

// Log messages
logger.log('Application started');
logger.info('User logged in', { userId: 123 });
logger.warn('Memory usage high');
logger.error('Database connection failed');
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `env` | string | `'development'` | Environment mode (`'development'` or `'production'`) |
| `apiKey` | string | `null` | API key for production logging service (required in production) |
| `serviceName` | string | `'unknown'` | Service identifier included in log output |

## Output Format

All logs are output as JSON with the following structure:

```json
{
  "timestamp": "2024-01-21T10:30:00.000Z",
  "level": "info",
  "service": "my-app",
  "message": "User logged in"
}
```

## Running Tests

```bash
npm test
```

## Design Decisions

- **Singleton pattern**: `init()` can only be called once to prevent configuration changes at runtime
- **Dual-mode logging**: Development mode logs to console; production mode sends to a 3rd-party service
- **Structured output**: JSON format enables easy parsing by log aggregation tools
- **Custom errors**: Descriptive error classes for better debugging (`ApiKeyIsMissingError`, `NotInitializedError`)
