import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../services/post';
import { LikeService } from '../../services/like';
import { AuthService } from '../../services/auth';
import { Post } from '../../models/post';
import { CommentSectionComponent } from '../../components/comment-section/comment-section';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, CommentSectionComponent, MatDialogModule, MatSnackBarModule],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss'
})
export class PostDetail implements OnInit {
  post: Post | null = null;
  isLoggedIn = false;
  currentUsername: string | null = null;
  isCommentSectionExpanded = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private authService: AuthService,
    private likeService: LikeService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

ngOnInit(): void {
  this.isLoggedIn = this.authService.isLoggedIn();
  this.currentUsername = this.authService.getCurrentUser()?.username || null;

  const idParam = this.route.snapshot.paramMap.get('postId');

  if (idParam) {
    const postId = +idParam; 

    if (isNaN(postId)) {
      this.errorMessage = "Invalid Post ID.";
      this.post = null;
      return; 
    }

    this.postService.getPost(postId).subscribe({
      next: (postData) => {
        this.post = postData;
        this.errorMessage = null;
      },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage = "Post not found.";
        } else {
          this.errorMessage = "An error occurred fetching the post.";
          console.error(err);
        }
        this.post = null;
      }
    });
  } else {
    this.errorMessage = "Post ID missing from URL.";
  }
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
          this.snackBar.open('Post deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/feed']);
        });
      }
    });
  }

  onCommentAdded(post: Post): void {
    post.commentCount++;
  }
}