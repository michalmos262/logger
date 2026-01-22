const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert');
const { ApiKeyIsMissingError, NotInitializedError, InvalidEnvError } = require('./errors');
const { PRODUCTION } = require('./constants');

describe('logger', () => {
  let init, logger, ServiceLogger;

  beforeEach(() => {
    // Reset module cache to get a fresh logger instance between tests.
    // The logger is a singleton with internal state (e.g. `initialized`),
    // so reloading avoids cross-test interference.
    delete require.cache[require.resolve('./logger')];
    delete require.cache[require.resolve('./ServiceLogger')];

    // Re-require with fresh state
    ({ init, logger } = require('./logger'));
    ServiceLogger = require('./ServiceLogger');
  });

  describe('init()', () => {
    it('Init without parameters', () => {
      init();
      assert.doesNotThrow(() => logger.log('test'));
    });

    it('Init can only be called once', () => {
      const consoleMock = mock.method(console, 'log', () => {});

      init();
      logger.log('first');

      init(); // Should be ignored
      logger.log('second');

      assert.strictEqual(consoleMock.mock.calls.length, 2);
      assert.strictEqual(consoleMock.mock.calls[0].arguments[0], 'first');
      assert.strictEqual(consoleMock.mock.calls[1].arguments[0], 'second');

      consoleMock.mock.restore();
    });

    it('Init with production env and valid apiKey uses ServiceLogger', () => {
      const serviceLoggerMock = mock.method(ServiceLogger, 'log', () => {});

      init({ env: PRODUCTION, apiKey: 'test-api-key' });
      logger.log('production message');

      assert.strictEqual(serviceLoggerMock.mock.calls.length, 1);
      assert.strictEqual(serviceLoggerMock.mock.calls[0].arguments[0], 'production message');

      serviceLoggerMock.mock.restore();
    });
  });

  describe('logging methods', () => {
    it('logger.log() passes arguments to console.log', () => {
      const consoleMock = mock.method(console, 'log', () => {});

      init();
      logger.log('hello');

      assert.strictEqual(consoleMock.mock.calls.length, 1);
      assert.strictEqual(consoleMock.mock.calls[0].arguments[0], 'hello');

      consoleMock.mock.restore();
    });

    it('logger.info() passes arguments to console.info', () => {
      const consoleMock = mock.method(console, 'info', () => {});

      init();
      logger.info('info message');

      assert.strictEqual(consoleMock.mock.calls.length, 1);
      assert.strictEqual(consoleMock.mock.calls[0].arguments[0], 'info message');

      consoleMock.mock.restore();
    });

    it('logger.warn() passes arguments to console.warn', () => {
      const consoleMock = mock.method(console, 'warn', () => {});

      init();
      logger.warn('warning message');

      assert.strictEqual(consoleMock.mock.calls.length, 1);
      assert.strictEqual(consoleMock.mock.calls[0].arguments[0], 'warning message');

      consoleMock.mock.restore();
    });

    it('logger.error() passes arguments to console.error', () => {
      const consoleMock = mock.method(console, 'error', () => {});

      init();
      logger.error('error message');

      assert.strictEqual(consoleMock.mock.calls.length, 1);
      assert.strictEqual(consoleMock.mock.calls[0].arguments[0], 'error message');

      consoleMock.mock.restore();
    });

    it('Multiple arguments are passed through', () => {
      const consoleMock = mock.method(console, 'log', () => {});

      init();
      logger.log('hello', 'world', 123);

      assert.strictEqual(consoleMock.mock.calls.length, 1);
      assert.deepStrictEqual(
        consoleMock.mock.calls[0].arguments,
        ['hello', 'world', 123]
      );

      consoleMock.mock.restore();
    });

    it('Object arguments are passed through', () => {
      const consoleMock = mock.method(console, 'log', () => {});

      init();
      logger.log('test', { a: 1, b: 2 });

      assert.strictEqual(consoleMock.mock.calls.length, 1);
      assert.strictEqual(consoleMock.mock.calls[0].arguments[0], 'test');
      assert.deepStrictEqual(consoleMock.mock.calls[0].arguments[1], { a: 1, b: 2 });

      consoleMock.mock.restore();
    });
  });

  describe('Error handling', () => {
    it('Throws error when calling init in production without apiKey', () => {
      assert.throws(
        () => init({ env: PRODUCTION }),
        ApiKeyIsMissingError
      );
    });

    it('Throws error for invalid env value', () => {
      assert.throws(
        () => init({ env: 'invalid' }),
        InvalidEnvError
      );
    });

    it('Throws error for all logger methods before init()', () => {
      assert.throws(() => logger.log('test'), NotInitializedError);
      assert.throws(() => logger.info('test'), NotInitializedError);
      assert.throws(() => logger.warn('test'), NotInitializedError);
      assert.throws(() => logger.error('test'), NotInitializedError);
    });
  });
});