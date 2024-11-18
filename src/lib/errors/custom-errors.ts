export class BaseError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class ConversionError extends BaseError {
  constructor(message: string) {
    super(message, 500, 'CONVERSION_ERROR');
  }
}

export class RateLimitError extends BaseError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class FileTypeError extends BaseError {
  constructor(message: string) {
    super(message, 415, 'UNSUPPORTED_FILE_TYPE');
  }
}

export class FileSizeError extends BaseError {
  constructor(message: string) {
    super(message, 413, 'FILE_TOO_LARGE');
  }
} 