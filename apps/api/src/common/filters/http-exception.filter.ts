/**
 * S5: GLOBAL EXCEPTION FILTER
 * Standardized error responses (no stack traces)
 * Operational errors (4xx) vs System errors (5xx)
 * Auto-report to GlitchTip
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: Record<string, any>;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: number;
    let message: string;
    let details: Record<string, any> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, any>;
        message = responseObj.message || exception.message;
        details = responseObj.details;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal Server Error';
      
      // Log system errors for GlitchTip reporting
      this.logger.error(`System Error: ${exception.message}`, exception.stack);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal Server Error';
    }

    // Determine if operational (4xx) or system (5xx) error
    const isOperational = status >= 400 && status < 500;
    
    const errorResponse: ErrorResponse = {
      error: message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (details) {
      errorResponse.details = details;
    }

    // Never expose stack traces to clients
    if (!isOperational && !process.env.NODE_ENV === 'development') {
      // In production, log the full error for GlitchTip
      this.logger.error(
        `Error: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json(errorResponse);
  }
}
