import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  DatabaseError,
  NotFoundError,
  ValidationError,
  ConflictError,
  handleDatabaseError,
  errorHandler,
} from './errors';

describe('Error utilities', () => {
  describe('DatabaseError', () => {
    it('should create a DatabaseError with default values', () => {
      const error = new DatabaseError('Database failed');
      expect(error.message).toBe('Database failed');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
    });

    it('should create a DatabaseError with custom code and status', () => {
      const error = new DatabaseError('Custom error', 'CUSTOM_CODE', 503);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.statusCode).toBe(503);
    });

    it('should be an instance of Error', () => {
      const error = new DatabaseError('Test');
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with entity and ID', () => {
      const error = new NotFoundError('Branch', 42);
      expect(error.message).toBe('Branch with ID 42 not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should be an instance of DatabaseError', () => {
      const error = new NotFoundError('Product', 1);
      expect(error instanceof DatabaseError).toBe(true);
    });

    it('should work with string ID', () => {
      const error = new NotFoundError('Order', 'abc');
      expect(error.message).toBe('Order with ID abc not found');
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError', () => {
      const error = new ValidationError('Name is required');
      expect(error.message).toBe('Validation error: Name is required');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should be an instance of DatabaseError', () => {
      const error = new ValidationError('Invalid');
      expect(error instanceof DatabaseError).toBe(true);
    });
  });

  describe('ConflictError', () => {
    it('should create a ConflictError', () => {
      const error = new ConflictError('Resource already exists');
      expect(error.message).toBe('Conflict: Resource already exists');
      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });

    it('should be an instance of DatabaseError', () => {
      const error = new ConflictError('Duplicate');
      expect(error instanceof DatabaseError).toBe(true);
    });
  });

  describe('handleDatabaseError', () => {
    it('should throw DatabaseError wrapping a plain Error', () => {
      const plainError = new Error('Connection refused');
      expect(() => handleDatabaseError(plainError)).toThrow(DatabaseError);
      expect(() => handleDatabaseError(plainError)).toThrow('Database operation failed: Connection refused');
    });

    it('should throw DatabaseError for non-Error values', () => {
      expect(() => handleDatabaseError('some string error')).toThrow(DatabaseError);
    });

    it('should rethrow existing DatabaseError', () => {
      const dbError = new DatabaseError('Existing DB error', 'SOME_CODE', 503);
      expect(() => handleDatabaseError(dbError)).toThrow(dbError);
    });

    it('should rethrow NotFoundError as-is', () => {
      const notFoundError = new NotFoundError('Supplier', 99);
      expect(() => handleDatabaseError(notFoundError)).toThrow(notFoundError);
    });

    it('should rethrow ValidationError as-is', () => {
      const validationError = new ValidationError('Bad input');
      expect(() => handleDatabaseError(validationError)).toThrow(validationError);
    });

    it('should convert SQLITE_CONSTRAINT UNIQUE error to ConflictError', () => {
      const sqliteError = new DatabaseError('UNIQUE constraint failed', 'SQLITE_CONSTRAINT', 500);
      sqliteError.message = 'UNIQUE constraint failed: suppliers.email';
      expect(() => handleDatabaseError(sqliteError)).toThrow(ConflictError);
    });

    it('should convert SQLITE_CONSTRAINT FOREIGN KEY error to ValidationError', () => {
      const sqliteError = new DatabaseError('FOREIGN KEY constraint failed', 'SQLITE_CONSTRAINT', 500);
      sqliteError.message = 'FOREIGN KEY constraint failed';
      expect(() => handleDatabaseError(sqliteError)).toThrow(ValidationError);
    });

    it('should convert SQLITE_BUSY error to DatabaseError with 503 status', () => {
      const busyError = new DatabaseError('Database locked', 'SQLITE_BUSY', 500);
      expect(() => handleDatabaseError(busyError)).toThrow('Database is temporarily unavailable');
    });
  });

  describe('errorHandler middleware', () => {
    it('should respond with 500 for DatabaseError', () => {
      const error = new DatabaseError('DB failure', 'DB_ERR', 500);
      const mockReq = {} as Request;
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const mockNext = vi.fn() as NextFunction;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: { code: 'DB_ERR', message: 'DB failure' },
      });
    });

    it('should respond with 404 for NotFoundError', () => {
      const error = new NotFoundError('Branch', 5);
      const mockReq = {} as Request;
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const mockNext = vi.fn() as NextFunction;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should respond with 500 for unknown errors', () => {
      const error = new Error('Unknown error');
      const mockReq = {} as Request;
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const mockNext = vi.fn() as NextFunction;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      });
    });
  });
});
