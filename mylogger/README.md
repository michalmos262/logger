# mylogger

A dual-mode logging library for Node.js applications. Drop-in replacement for `console` with support for production logging services.

## Installation

```bash
npm install mylogger
```

## Usage

```javascript
const { init, logger } = require('mylogger');

// Initialize the logger
init();

// Log messages (behaves like console)
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

## Output Format

The logger mimics standard console methods. Arguments are passed directly to the underlying target:

```javascript
logger.log('hello', 'world');
// Output: hello world

logger.info('test', { a: 1 });
// Output: test { a: 1 }
```

## Production Mode

In production, logs are sent to a 3rd-party logging service:

```javascript
init({
  env: 'production',
  apiKey: 'your-api-key'
});
```

## Running Tests

```bash
npm test
```

## Design Decisions

- **Singleton pattern**: `init()` can only be called once to prevent configuration changes at runtime
- **Dual-mode logging**: Development mode logs to console; production mode sends to a 3rd-party service
- **Drop-in replacement**: Behaves like standard console methods for easy adoption
- **Custom errors**: Descriptive error classes for better debugging (`ApiKeyIsMissingError`, `NotInitializedError`, `InvalidEnvError`)
