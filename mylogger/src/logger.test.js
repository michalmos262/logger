const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert');
const { init, logger, _reset } = require('./logger');

describe('logger', () => {
  beforeEach(() => {
    _reset();
  });

  describe('init()', () => {
    it('Init without parameters', () => {
      init();
      // Should not throw when calling logger methods after init
      assert.doesNotThrow(() => logger.log('test'));
    });

    it('Init with custom service name', () => {
      const consoleMock = mock.method(console, 'log', () => {});

      init({ serviceName: 'my-service' });
      logger.log('test');

      const output = JSON.parse(consoleMock.mock.calls[0].arguments[0]);
      assert.strictEqual(output.service, 'my-service');

      consoleMock.mock.restore();
    });

    it('Log in production without apiKey', () => {
      assert.throws(
        () => init({ env: 'production' }),
        { message: 'mylogger: apiKey is required in production' }
      );
    });

    it('Init can only be called once', () => {
      const consoleMock = mock.method(console, 'log', () => {});

      init({ serviceName: 'first' });
      init({ serviceName: 'second' }); // Should be ignored

      logger.log('test');

      const output = JSON.parse(consoleMock.mock.calls[0].arguments[0]);
      assert.strictEqual(output.service, 'first');

      consoleMock.mock.restore();
    });
  });

  describe('logging methods', () => {
    it('logger.log()', () => {
      const consoleMock = mock.method(console, 'log', () => {});

      init({ serviceName: 'test-service' });
      logger.log('hello');

      const output = JSON.parse(consoleMock.mock.calls[0].arguments[0]);

      assert.ok(output.timestamp);
      assert.strictEqual(output.level, 'log');
      assert.strictEqual(output.service, 'test-service');
      assert.strictEqual(output.message, 'hello');

      consoleMock.mock.restore();
    });

    it('logger.info()', () => {
      const consoleMock = mock.method(console, 'info', () => {});

      init({ serviceName: 'test-service' });
      logger.info('info message');

      const output = JSON.parse(consoleMock.mock.calls[0].arguments[0]);

      assert.strictEqual(output.level, 'info');
      assert.strictEqual(output.message, 'info message');

      consoleMock.mock.restore();
    });

    it('logger.warn()', () => {
      const consoleMock = mock.method(console, 'warn', () => {});

      init({ serviceName: 'test-service' });
      logger.warn('warning message');

      const output = JSON.parse(consoleMock.mock.calls[0].arguments[0]);

      assert.strictEqual(output.level, 'warn');
      assert.strictEqual(output.message, 'warning message');

      consoleMock.mock.restore();
    });

    it('logger.error()', () => {
      const consoleMock = mock.method(console, 'error', () => {});

      init({ serviceName: 'test-service' });
      logger.error('error message');

      const output = JSON.parse(consoleMock.mock.calls[0].arguments[0]);

      assert.strictEqual(output.level, 'error');
      assert.strictEqual(output.message, 'error message');

      consoleMock.mock.restore();
    });

    it('single argument formats correctly (not wrapped in array)', () => {
      const consoleMock = mock.method(console, 'log', () => {});

      init();
      logger.log('single arg');

      const output = JSON.parse(consoleMock.mock.calls[0].arguments[0]);

      assert.strictEqual(output.message, 'single arg');
      assert.strictEqual(typeof output.message, 'string');

      consoleMock.mock.restore();
    });

    it('multiple arguments format as array', () => {
      const consoleMock = mock.method(console, 'log', () => {});

      init();
      logger.log('hello', 'world', 123);

      const output = JSON.parse(consoleMock.mock.calls[0].arguments[0]);

      assert.ok(Array.isArray(output.message));
      assert.deepStrictEqual(output.message, ['hello', 'world', 123]);

      consoleMock.mock.restore();
    });
  });

  describe('error handling', () => {
    it('throws error when calling logger methods before init()', () => {
      assert.throws(
        () => logger.log('test'),
        { message: 'Logger not initialized. Call init() first.' }
      );
    });

    it('throws error for all logger methods before init()', () => {
      assert.throws(() => logger.log('test'), Error);
      assert.throws(() => logger.info('test'), Error);
      assert.throws(() => logger.warn('test'), Error);
      assert.throws(() => logger.error('test'), Error);
    });
  });
});
