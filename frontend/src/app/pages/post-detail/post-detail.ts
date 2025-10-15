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
  // We don't need a Set for one post, just a boolean
  isCommentSectionExpanded = false; 

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

    const id = this.route.snapshot.paramMap.get('postId');
    if (id) {
      this.postService.getPost(+id).subscribe(postData => {
        this.post = postData;
      });
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