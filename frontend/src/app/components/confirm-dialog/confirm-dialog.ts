import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title>
        <mat-icon *ngIf="data.icon" class="dialog-icon">{{ data.icon }}</mat-icon>
        {{ data.title }}
      </h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          [color]="data.confirmColor || 'primary'" 
          (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 300px;
      max-width: 500px;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      padding: 20px 24px;
      font-size: 20px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }

    .dialog-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    mat-dialog-content {
      padding: 0 24px 20px;
      font-size: 14px;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.7);
    }

    mat-dialog-content p {
      margin: 0;
    }

    mat-dialog-actions {
      padding: 12px 16px;
      gap: 8px;
      background-color: rgba(0, 0, 0, 0.02);
      border-top: 1px solid rgba(0, 0, 0, 0.08);
    }

    /* Dark theme support */
    :host-context(.dark-theme) h2 {
      color: rgba(255, 255, 255, 0.95);
    }

    :host-context(.dark-theme) mat-dialog-content {
      color: rgba(255, 255, 255, 0.7);
    }

    :host-context(.dark-theme) mat-dialog-actions {
      background-color: rgba(255, 255, 255, 0.05);
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }

    /* Material theme dark mode */
    @media (prefers-color-scheme: dark) {
      h2 {
        color: rgba(255, 255, 255, 0.95);
      }

      mat-dialog-content {
        color: rgba(255, 255, 255, 0.7);
      }

      mat-dialog-actions {
        background-color: rgba(255, 255, 255, 0.05);
        border-top: 1px solid rgba(255, 255, 255, 0.12);
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
