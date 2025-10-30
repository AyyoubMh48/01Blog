import { Component, OnInit, OnDestroy,ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { Notification } from '../../models/notification';
import { ThemeService } from '../../services/theme';
import { AuthService,DecodedToken } from '../../services/auth';
import { Router, RouterLink,NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators'
import { UserService } from '../../services/user'; 
import { UserProfile } from '../../models/user-profile';
//import { ThemeService } from '../../services/theme'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,MatMenuModule,MatDividerModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  encapsulation: ViewEncapsulation.None 
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  isOnCreatePostPage = false
  
  currentUser: DecodedToken | null = null;
  userAvatarUrl: string | null = null;

  private routerSub!: Subscription;
  private notificationSub!: Subscription;
  private authStatusSub!: Subscription;

  constructor(
    public authService: AuthService, 
    public themeService: ThemeService,
    public notificationService: NotificationService, 
    private router: Router,
    private userService: UserService
   // public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService.loggedInStatus$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.currentUser = this.authService.getCurrentUser();
        this.isAdmin = (this.currentUser?.role === 'ROLE_ADMIN');

        if (this.currentUser?.username) {
          this.userService.getUserProfile(this.currentUser.username).subscribe((profile: UserProfile) => {
            this.userAvatarUrl = profile.avatarUrl || null;
          });
        }

        this.notificationService.connect();
        this.notificationSub = this.notificationService.notifications$.subscribe(notifications => {
          this.unreadCount = notifications.filter(n => !n.read).length;
        });
      } else {
        this.currentUser = null;
        this.isAdmin = false;
        this.unreadCount = 0;
        this.userAvatarUrl = null;
        if (this.notificationSub) this.notificationSub.unsubscribe();
        this.notificationService.disconnect();
      }
    });

    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isOnCreatePostPage = (event.url === '/post/new');
    });

  }

  
  
  logout(): void {
    this.authService.logout();
    //this.notificationService.disconnect();
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.authStatusSub) this.authStatusSub.unsubscribe();
    if (this.notificationSub) this.notificationSub.unsubscribe();
    this.notificationService.disconnect();
  }
}