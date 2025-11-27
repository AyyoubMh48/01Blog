import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute,Router,RouterLink } from '@angular/router'; 
import { UserService } from '../../services/user';
import { UserProfile } from '../../models/user-profile';
import { SubscriptionService } from '../../services/subscription';
import { AuthService } from '../../services/auth';
import { LikeService } from '../../services/like'; 
import { PostService } from '../../services/post';
import { Post } from '../../models/post';
import { CommentSectionComponent } from '../../components/comment-section/comment-section';
import { ReportService } from '../../services/report'; 
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-block',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink, MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule],
  templateUrl: './block.html',
  styleUrl: './block.scss'
})
export class Block implements OnInit {
  userProfile: UserProfile | null = null;
  errorMessage: string | null = null;
  isLoggedIn = false;
  expandedPostIds = new Set<number>();
  isOwnProfile = false; 
  showReportForm = false;

  constructor(
    private route: ActivatedRoute, //  read URL
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private likeService: LikeService,
    private router : Router,
    private reportService: ReportService,
    private postService: PostService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const profileUsername = this.route.snapshot.paramMap.get('username');
    const currentUser = this.authService.getCurrentUser(); 

    if (this.isLoggedIn && currentUser?.username === profileUsername) {
      //this.isOwnProfile = true;
      this.router.navigate(['/profile']);
      return;
    }

    this.isOwnProfile = false;
    
    if (profileUsername) {
      this.userService.getUserProfile(profileUsername).subscribe({
        next: (profile) => {
                  //  console.log("--- [FRONTEND DEBUG] Profile data received:", profile);
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
        this.userProfile.followedByCurrentUser = true;
        this.snackBar.open(`You are now following ${this.userProfile.username}`, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  unfollow(): void {
    if (!this.userProfile) return;
    this.subscriptionService.unfollow(this.userProfile.id).subscribe(() => {
      if (this.userProfile) {
        this.userProfile.followedByCurrentUser = false;
        this.snackBar.open(`You unfollowed ${this.userProfile.username}`, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }
   deletePost(postId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Post',
        message: 'Are you sure you want to delete this post? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
        icon: 'delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.postService.deletePost(postId).subscribe(() => {
          if (this.userProfile) {
            this.userProfile.posts = this.userProfile.posts.filter(p => p.id !== postId);
          }
          this.snackBar.open('Post deleted successfully', 'Close', { duration: 3000 });
        });
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

  onReportSubmit(form: NgForm): void {
    if (form.invalid || !this.userProfile) {
      return;
    }
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Submit Report',
        message: `Are you sure you want to report "${this.userProfile.username}"? Our moderation team will review this report.`,
        confirmText: 'Submit Report',
        cancelText: 'Cancel',
        confirmColor: 'warn',
        icon: 'flag'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reportService.reportUser(this.userProfile!.id, form.value.reason).subscribe({
          next: () => {
            this.showReportForm = false;
            this.snackBar.open('Report submitted successfully. Thank you. 🛡️', 'Close', { duration: 3000 });
          },
          error: (err) => {
            this.snackBar.open('Failed to submit report', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }
  stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

}