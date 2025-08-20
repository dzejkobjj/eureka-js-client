import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Logger from '../src/Logger.js';

const DEFAULT_LEVEL = 30;

describe('Logger', () => {
  it('should construct with no args', () => {
    expect(() => new Logger()).to.not.throw();
  });

  describe('Logger Instance', () => {
    let logger;
    beforeEach(() => {
      logger = new Logger();
    });

    it('should return the current log level from the "level" method', () => {
      expect(logger.level()).to.equal(DEFAULT_LEVEL);
    });

    it('should update the log level if passed a number', () => {
      logger.level(100);
      expect(logger.level()).to.equal(100);
      logger.level(15);
      expect(logger.level()).to.equal(15);
    });

    it('should update the log level if a valid string is passed', () => {
      logger.level('warn');
      expect(logger.level()).to.equal(40);
      logger.level('error');
      expect(logger.level()).to.equal(50);
    });

    it('should use the default log level is an invalid string is passed', () => {
      logger.level('invalid');
      expect(logger.level()).to.equal(DEFAULT_LEVEL);
    });

    it('should only log a message if the log level is higher than the level', () => {
      logger.level(100);
      const stub = vi.spyOn(console, 'error').mockImplementation(() => {});
      logger.error('Some Error');
      expect(stub).toHaveBeenCalledTimes(0);
      logger.level(50);
      logger.error('Other Error');
      expect(stub).toHaveBeenCalledTimes(1);
      stub.mockRestore();
    });

    describe('Log Methods', () => {
      beforeEach(() => {
        // Log everything:
        logger.level(-1);
      });

      const stubConsole = method => vi.spyOn(console, method).mockImplementation(() => {});

      it('should call console.log with debug', () => {
        const stub = stubConsole('log');
        logger.debug('test');
        expect(stub).toHaveBeenCalledTimes(1);
        stub.mockRestore();
      });

      it('should call console.info with info', () => {
        const stub = stubConsole('info');
        logger.info('test');
        expect(stub).toHaveBeenCalledTimes(1);
        stub.mockRestore();
      });

      it('should call console.warn with warn', () => {
        const stub = stubConsole('warn');
        logger.warn('test');
        expect(stub).toHaveBeenCalledTimes(1);
        stub.mockRestore();
      });

      it('should call console.error with error', () => {
        const stub = stubConsole('error');
        logger.error('test');
        expect(stub).toHaveBeenCalledTimes(1);
        stub.mockRestore();
      });
    });
  });
});
