import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; 
import { UserService } from '../../services/user';
import { UserProfile } from '../../models/user-profile';
import { SubscriptionService } from '../../services/subscription';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './block.html',
  styleUrl: './block.scss'
})
export class Block implements OnInit {
  userProfile: UserProfile | null = null;
  errorMessage: string | null = null;
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute, //  read URL
    private userService: UserService,
      private subscriptionService: SubscriptionService,
      private authService: AuthService
  ) {}

  ngOnInit(): void {
       this.isLoggedIn = this.authService.isLoggedIn();
    // Get 'username' from the URL
    const username = this.route.snapshot.paramMap.get('username');

    if (username) {
      this.userService.getUserProfile(username).subscribe({
        next: (profile) => {
          this.userProfile = profile;
        },
        error: (err) => {
          this.errorMessage = 'User not found.';
          console.error(err);
        }
      });
    }
  }
  follow(): void {
    if (!this.userProfile) return;
    this.subscriptionService.follow(this.userProfile.id).subscribe(() => {
      if (this.userProfile) {
        this.userProfile.isFollowedByCurrentUser = true;
      }
    });
  }

  unfollow(): void {
    if (!this.userProfile) return;
    this.subscriptionService.unfollow(this.userProfile.id).subscribe(() => {
      if (this.userProfile) {
        this.userProfile.isFollowedByCurrentUser = false;
      }
    });
  }
}