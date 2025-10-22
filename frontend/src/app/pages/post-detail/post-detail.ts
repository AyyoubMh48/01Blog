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

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, CommentSectionComponent],
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
    private router: Router
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
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(postId).subscribe(() => {
        this.router.navigate(['/feed']);
      });
    }
  }

  onCommentAdded(post: Post): void {
    post.commentCount++;
  }
}