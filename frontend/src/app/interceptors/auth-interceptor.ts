import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, retry, timer } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastService } from '../services/toast';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toast = inject(ToastService);
  const authToken = localStorage.getItem('authToken');
  
  let authReq = req;
  if (authToken) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
  }

  return next(authReq).pipe(
    // Retry once on connection errors (status 0) with a small delay
    retry({
      count: 1,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Only retry on connection errors (server unreachable)
        if (error.status === 0) {
          return timer(1000); // Wait 1 second before retry
        }
        return throwError(() => error);
      }
    }),
    catchError((err: HttpErrorResponse) => {
      // Handle specific error cases
      switch (err.status) {
        case 0:
          // Server unreachable - show specific message
          if (!navigator.onLine) {
            toast.networkError();
          } else {
            toast.serverDown();
          }
          break;
        case 401:
          // Unauthorized - session expired
          toast.sessionExpired();
          authService.logout();
          router.navigate(['/login']);
          break;
        case 403:
          // Forbidden - clear session
          authService.logout();
          break;
        // Other errors will be handled by GlobalErrorHandler
      }
      return throwError(() => err);
    })
  );
};