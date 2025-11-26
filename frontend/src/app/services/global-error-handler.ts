import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: Error | HttpErrorResponse): void {
    const router = this.injector.get(Router);
    let errorMessage = 'An unexpected error occurred';
    let shouldRedirect = false;

    if (error instanceof HttpErrorResponse) {
      // Server-side error
      errorMessage = this.getServerErrorMessage(error);
      shouldRedirect = this.shouldRedirectOnError(error);
    } else {
      // Client-side error
      errorMessage = this.getClientErrorMessage(error);
    }

    // Log to console for debugging (only in development)
    if (!this.isProduction()) {
      console.error('Global Error Handler:', error);
    }

    // Log to external service (e.g., Sentry, LogRocket) in production
    this.logErrorToService(error, errorMessage);

    // Show user-friendly notification
    this.notifyUser(errorMessage);

    // Redirect if necessary
    if (shouldRedirect) {
      router.navigate(['/']);
    }
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'No internet connection. Please check your network.';
      case 400:
        return error.error?.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return error.error?.message || 'Conflict occurred.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Server error (${error.status}). Please try again.`;
    }
  }

  private getClientErrorMessage(error: Error): string {
    if (error.message.includes('ExpressionChangedAfterItHasBeenCheckedError')) {
      return 'A display error occurred. Please refresh the page.';
    }
    if (error.message.includes('ChunkLoadError')) {
      return 'Failed to load application. Please refresh the page.';
    }
    if (error.message.includes('null') || error.message.includes('undefined')) {
      return 'A data error occurred. Please try again.';
    }
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  private shouldRedirectOnError(error: HttpErrorResponse): boolean {
    // Redirect to home on critical errors
    return error.status === 401 || error.status === 403;
  }

  private notifyUser(message: string): void {
    // Simple alert for now - you can replace with a toast notification service
    if (typeof window !== 'undefined') {
      // Use setTimeout to avoid blocking the error handler
      setTimeout(() => alert(message), 0);
    }
  }

  private logErrorToService(error: Error | HttpErrorResponse, message: string): void {
    // In production, send to external logging service
    // Example: Sentry.captureException(error);
    if (this.isProduction()) {
      // TODO: Integrate with logging service (Sentry, LogRocket, etc.)
      // console.log('Would log to service:', { error, message });
    }
  }

  private isProduction(): boolean {
    return typeof window !== 'undefined' && 
           window.location.hostname !== 'localhost' && 
           !window.location.hostname.includes('127.0.0.1');
  }
}
