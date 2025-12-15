import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { UserProfile } from '../../models/user-profile';
import { PostService } from '../../services/post'; 
import { LikeService } from '../../services/like';
import { Post } from '../../models/post';
import { Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommentSectionComponent } from '../../components/comment-section/comment-section';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,RouterLink,
    MatButtonModule,MatIconModule, MatProgressBarModule,MatTabsModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  successMessage: string | null = null;
  errorMessage: string | null = null;
  userProfile: UserProfile | null = null;
  isUploading = false;
  expandedPostIds = new Set<number>();
  isLoggedIn = false;

  // Password validation patterns (same as registration)
  private readonly passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!*]).{8,}$/;
  private readonly hasUpperCase = /[A-Z]/;
  private readonly hasLowerCase = /[a-z]/;
  private readonly hasNumber = /\d/;
  private readonly hasSpecialChar = /[@#$%^&+=!*]/;

  constructor(private userService: UserService,
    private authService: AuthService,
    private postService: PostService,
    private likeService: LikeService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userService.getUserProfile(currentUser.username).subscribe(profile => {
        this.userProfile = profile;
        if (this.userProfile?.posts) {
            this.userProfile.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      });
    } else {
        this.router.navigate(['/login']);
    }
  }


  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      this.isUploading = true;
      this.userService.updateAvatar(formData).subscribe({
        next: (response: any) => {
          if (this.userProfile) {
            this.userProfile.avatarUrl = response.url; // Update the avatar in the view
          }
          this.isUploading = false;
          this.snackBar.open('Avatar updated successfully! 📷', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.isUploading = false;
          this.snackBar.open('Avatar upload failed', 'Close', { duration: 4000 });
        }
      });
    }
  }
  onBioSubmit(form: NgForm): void {
    if (form.invalid || !this.userProfile) {
      return;
    }
    this.successMessage = null;
    this.errorMessage = null;

    this.userService.updateProfile({ bio: form.value.bio }).subscribe({
      next: () => {
        this.snackBar.open('Bio updated successfully! ✏️', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to update bio', 'Close', { duration: 4000 });
      }
    });
  }

  onChangePasswordSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.successMessage = null;
    this.errorMessage = null;

    const { newPassword, confirmPassword } = form.value;
    
    // Validate password strength (same rules as registration)
    if (!this.isPasswordValid(newPassword)) {
      this.snackBar.open('Password must contain at least 8 characters, including uppercase, lowercase, number, and special character (@#$%^&+=!*)', 'Close', { duration: 5000 });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      this.snackBar.open('New passwords do not match', 'Close', { duration: 4000 });
      return;
    }

    const passwordData = {
      oldPassword: form.value.oldPassword,
      newPassword: form.value.newPassword
    };

    this.userService.changePassword(passwordData).subscribe({
      next: (response) => {
        this.snackBar.open('Password changed successfully! 🔒', 'Close', { duration: 3000 });
        form.reset();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to change password', 'Close', { duration: 4000 });
      }
    });
  }
  stripHtml(html: string): string {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
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
        if (this.userProfile && this.userProfile.posts) {
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

  // Password validation methods
  isPasswordValid(password: string): boolean {
    return this.passwordPattern.test(password);
  }

  hasMinLength(password: string): boolean {
    return password?.length >= 8;
  }

  hasUppercase(password: string): boolean {
    return this.hasUpperCase.test(password);
  }

  hasLowercase(password: string): boolean {
    return this.hasLowerCase.test(password);
  }

  hasDigit(password: string): boolean {
    return this.hasNumber.test(password);
  }

  hasSpecial(password: string): boolean {
    return this.hasSpecialChar.test(password);
  }
}