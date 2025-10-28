import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification';
import { Notification } from '../../models/notification';

// Material Imports
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule,MatCardModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class Notifications implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private notificationSub!: Subscription;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to the notification stream from the service
    this.notificationSub = this.notificationService.notifications$.subscribe(data => {
      this.notifications = data;
    });
  }

  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.read = true;
      });
    }
    // Navigate to the link associated with the notification
    if (notification.link) {
      this.router.navigate([notification.link]);
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
  }
}