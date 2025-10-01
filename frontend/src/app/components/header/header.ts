import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { Notification } from '../../models/notification';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme'; 

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;
  private notificationSub!: Subscription;

  constructor(
    public authService: AuthService, 
    public notificationService: NotificationService, 
    private router: Router,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {

      const user = this.authService.getCurrentUser();
      if (user && user.role === 'ROLE_ADMIN') {
        this.isAdmin = true;
      }
      this.notificationService.connect();
      
      this.notificationSub = this.notificationService.notifications$.subscribe(data => {
        this.notifications = data;
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      });
    }
  }

  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.read = true;
        this.unreadCount--;
      });
    }
    if (notification.link) {
      this.router.navigate([notification.link]);
      this.showNotifications = false;
    }
  }
  
  logout(): void {
    this.authService.logout();
    this.notificationService.disconnect();
  }

  ngOnDestroy(): void {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
    this.notificationService.disconnect();
  }
}