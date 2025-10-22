import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PostService,Page } from '../../services/post';
import { Post } from '../../models/post';
import { AuthService } from '../../services/auth';
import { LikeService } from '../../services/like';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    InfiniteScrollModule
  ],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
})
export class Feed implements OnInit {
  posts: Post[] = [];
  isLoggedIn = false;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  previewFileType: 'image' | 'video' | null = null;
  expandedPostIds = new Set<number>();
  currentUsername: string | null = null;

  currentPage = 0;
  pageSize = 10; 
  totalPages = 0;
  isLoading = false;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private likeService: LikeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUsername = this.authService.getCurrentUser()?.username || null;
    this.loadPosts();
  }

  loadPosts(): void {
  if (this.isLoading || (this.totalPages > 0 && this.currentPage >= this.totalPages)) {
    return;
  }
  this.isLoading = true;

  this.postService.getFeed(this.currentPage, this.pageSize)
    .subscribe((page: Page<Post>) => {
      this.posts = [...this.posts, ...page.content];
      this.totalPages = page.totalPages;
      this.currentPage++; 
      this.isLoading = false;
    }, error => {
      console.error("Failed to load posts:", error);
      this.isLoading = false;
    });
}

// This method is called by the infinite scroll directive
  onScroll(): void {
    console.log("Scrolled, loading next page...");
    this.loadPosts();
  }

  // Helper method for previews
  stripHtml(html: string): string {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  deletePost(postId: number): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(postId).subscribe(() => {
        // Remove the post from the local array for an instant UI update
        this.posts = this.posts.filter((p) => p.id !== postId);
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
