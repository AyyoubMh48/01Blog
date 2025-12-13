import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from './toast';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: Error | HttpErrorResponse): void {
    const router = this.injector.get(Router);
    const toast = this.injector.get(ToastService);
    
    let errorMessage = 'An unexpected error occurred';
    let shouldRedirect = false;
    let errorType: 'error' | 'warning' = 'error';

    if (error instanceof HttpErrorResponse) {
      // Server-side error
      const result = this.getServerErrorMessage(error);
      errorMessage = result.message;
      errorType = result.type;
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

    // Show user-friendly notification using Toast
    if (errorType === 'warning') {
      toast.warning(errorMessage);
    } else {
      toast.error(errorMessage);
    }

    // Redirect if necessary
    if (shouldRedirect) {
      router.navigate(['/login']);
    }
  }

  private getServerErrorMessage(error: HttpErrorResponse): { message: string; type: 'error' | 'warning' } {
    switch (error.status) {
      case 0:
        // Server is down or no network
        if (!navigator.onLine) {
          return { message: '📡 No internet connection. Please check your network.', type: 'error' };
        }
        return { message: '🔌 Cannot connect to server. The server may be down or starting up.', type: 'error' };
      case 400:
        return { message: error.error?.message || '⚠️ Invalid request. Please check your input.', type: 'warning' };
      case 401:
        return { message: '🔐 Session expired. Please login again.', type: 'warning' };
      case 403:
        return { message: '🚫 You do not have permission to perform this action.', type: 'warning' };
      case 404:
        return { message: '🔍 The requested resource was not found.', type: 'warning' };
      case 409:
        return { message: error.error?.message || '⚠️ Conflict occurred.', type: 'warning' };
      case 429:
        return { message: '⏳ Too many requests. Please wait and try again later.', type: 'warning' };
      case 500:
        return { message: '💥 Server error. Our team has been notified.', type: 'error' };
      case 502:
        return { message: '🔌 Bad gateway. The server is temporarily unavailable.', type: 'error' };
      case 503:
        return { message: '🛠️ Service temporarily unavailable. Please try again later.', type: 'error' };
      case 504:
        return { message: '⏱️ Server timeout. Please try again.', type: 'error' };
      default:
        return { message: `❌ Server error (${error.status}). Please try again.`, type: 'error' };
    }
  }

  private getClientErrorMessage(error: Error): string {
    if (error.message.includes('ExpressionChangedAfterItHasBeenCheckedError')) {
      return '🔄 A display error occurred. Please refresh the page.';
    }
    if (error.message.includes('ChunkLoadError')) {
      return '📦 Failed to load application. Please refresh the page.';
    }
    if (error.message.includes('null') || error.message.includes('undefined')) {
      return '📊 A data error occurred. Please try again.';
    }
    return error.message || '❌ An unexpected error occurred. Please try again.';
  }

  private shouldRedirectOnError(error: HttpErrorResponse): boolean {
    // Redirect to login on authentication errors
    return error.status === 401;
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
