import { NextResponse } from 'next/server';
import { BaseError } from '../errors/custom-errors';

interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export function handleError(error: unknown): NextResponse<ErrorResponse> {
  console.error('Error:', error);

  if (error instanceof BaseError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code
        }
      },
      { status: error.statusCode }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_SERVER_ERROR'
      }
    },
    { status: 500 }
  );
} 