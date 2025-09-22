import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; 
import { UserService } from '../../services/user';
import { UserProfile } from '../../models/user-profile';
import { SubscriptionService } from '../../services/subscription';
import { AuthService } from '../../services/auth';
import { LikeService } from '../../services/like'; 
import { Post } from '../../models/post';
import { Router } from '@angular/router';
import { CommentSectionComponent } from '../../components/comment-section/comment-section';


@Component({
  selector: 'app-block',
  standalone: true,
  imports: [CommonModule,CommentSectionComponent],
  templateUrl: './block.html',
  styleUrl: './block.scss'
})
export class Block implements OnInit {
  userProfile: UserProfile | null = null;
  errorMessage: string | null = null;
  isLoggedIn = false;
  expandedPostIds = new Set<number>(); ;

  constructor(
    private route: ActivatedRoute, //  read URL
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private likeService: LikeService,
    private router : Router


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

  toggleLike(post: Post): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.likeService.toggleLike(post.id).subscribe(() => {
      post.likedByCurrentUser = !post.likedByCurrentUser;
      post.likedByCurrentUser ? post.likeCount++ : post.likeCount--;
    });
  }

  toggleComments(postId: number): void {
    if (this.expandedPostIds.has(postId)) {
      this.expandedPostIds.delete(postId);
    } else {
      this.expandedPostIds.add(postId);
    }
  }

  onCommentAdded(post: Post): void {
    post.commentCount++;
  }
}