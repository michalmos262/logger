const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert');
const { init, logger, _reset } = require('./logger');
const { ApiKeyIsMissingError, NotInitializedError } = require('./errors');
const { PRODUCTION } = require('./constants');

describe('logger', () => {
  beforeEach(() => {
    _reset();
  });

  describe('init()', () => {
    it('Init without parameters', () => {
      init();
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

    it('Single argument formats correctly (not wrapped in array)', () => {
      const consoleMock = mock.method(console, 'log', () => {});

      init();
      logger.log('single arg');

      const output = JSON.parse(consoleMock.mock.calls[0].arguments[0]);

      assert.strictEqual(output.message, 'single arg');
      assert.strictEqual(typeof output.message, 'string');

      consoleMock.mock.restore();
    });

    it('Multiple arguments format as array', () => {
      const consoleMock = mock.method(console, 'log', () => {});

      init();
      logger.log('hello', 'world', 123);

      const output = JSON.parse(consoleMock.mock.calls[0].arguments[0]);

      assert.ok(Array.isArray(output.message));
      assert.deepStrictEqual(output.message, ['hello', 'world', 123]);

      consoleMock.mock.restore();
    });
  });

  describe('Error handling', () => {
    it('Throws error when calling logger in production without apiKey', () => {
      assert.throws(
        () => init({ env: PRODUCTION }),
        ApiKeyIsMissingError
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
