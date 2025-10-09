import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { Notification } from '../../models/notification';
import { AuthService } from '../../services/auth';
import { Router, RouterLink,NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators'
//import { ThemeService } from '../../services/theme'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;
  isOnCreatePostPage = false
  private routerSub!: Subscription;
  private notificationSub!: Subscription;
  private authStatusSub!: Subscription;

  constructor(
    public authService: AuthService, 
    public notificationService: NotificationService, 
    private router: Router,
   // public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService.loggedInStatus$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        const user = this.authService.getCurrentUser();
        this.isAdmin = (user?.role === 'ROLE_ADMIN');
        this.notificationService.connect();
        this.notificationSub = this.notificationService.notifications$.subscribe(data => {
            this.notifications = data;
            this.unreadCount = this.notifications.filter(n => !n.read).length;
        });
         this.routerSub = this.router.events.pipe(
          filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
          this.isOnCreatePostPage = (event.url === '/post/new');
        });
      }
    });
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
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.authStatusSub) this.authStatusSub.unsubscribe();
    if (this.notificationSub) this.notificationSub.unsubscribe();
    this.notificationService.disconnect();
  }
}