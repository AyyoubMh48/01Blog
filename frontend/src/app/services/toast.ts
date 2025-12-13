import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  };

  constructor(private snackBar: MatSnackBar) {}

  show(message: string, type: ToastType = 'info', duration?: number): void {
    const config: MatSnackBarConfig = {
      ...this.defaultConfig,
      duration: duration || this.defaultConfig.duration,
      panelClass: this.getPanelClass(type),
    };

    this.snackBar.open(message, 'Close', config);
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration || 7000); // Errors show longer
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  // Server connection errors
  serverDown(): void {
    this.error('Unable to connect to server. Please check if the backend is running.', 10000);
  }

  networkError(): void {
    this.error('Network error. Please check your internet connection.', 10000);
  }

  sessionExpired(): void {
    this.warning('Your session has expired. Please login again.');
  }

  private getPanelClass(type: ToastType): string[] {
    return [`toast-${type}`];
  }
}
