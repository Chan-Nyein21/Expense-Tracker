/**
 * Custom Error Classes
 * Purpose: Specific error types for better error handling
 */

/**
 * ValidationError for data validation failures
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * StorageError for storage operation failures
 */
export class StorageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StorageError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }
}

/**
 * NotFoundError for resource not found
 */
export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
  }
}

export default {
  ValidationError,
  StorageError,
  NotFoundError
};