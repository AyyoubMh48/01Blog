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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';
import { Observable } from 'rxjs';
import { TagService } from '../../services/tag';
import { Tag } from '../../models/post';

type FeedFilter = 'following' | 'myPosts' | 'all';
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
    InfiniteScrollModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
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
  activeFilter: FeedFilter = 'following';
  currentPage = 0;
  pageSize = 10; 
  totalPages = 0;
  isLoading = false;
  popularTags: Tag[] = [];
  trendingPosts: Post[] = [];

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private likeService: LikeService,
    private router: Router,
    private tagService: TagService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUsername = this.authService.getCurrentUser()?.username || null;
    this.activeFilter = this.isLoggedIn ? 'following' : 'all';
    this.resetAndLoadPosts();
    this.loadPopularTags();
    this.loadTrendingPosts();
  }

  setFilter(filter: FeedFilter): void {
    if (!this.isLoggedIn && filter !== 'all') return; 
    this.activeFilter = filter;
    this.resetAndLoadPosts();
  }

  resetAndLoadPosts(): void {
      this.posts = [];
      this.currentPage = 0;
      this.totalPages = 0;
      this.loadPosts(); 
  }
  loadPopularTags(): void {
    this.tagService.getPopularTags().subscribe(tags => {
      this.popularTags = tags;
    });
  }
  loadTrendingPosts(): void {
    this.postService.getTrendingPosts(5).subscribe(posts => { 
      this.trendingPosts = posts;
    });
  }

  loadPosts(): void {
  if (this.isLoading || (this.totalPages > 0 && this.currentPage >= this.totalPages)) {
    console.log('load blocked:', { 
      isLoading: this.isLoading, 
      currentPage: this.currentPage, 
      totalPages: this.totalPages 
    });
    return;
  }
  this.isLoading = true;
    console.log('loading page:', this.currentPage);

  let apiCall: Observable<Page<Post>>;

    switch(this.activeFilter) {
      case 'following':
        apiCall = this.postService.getFeed(this.currentPage, this.pageSize);
        break;
      case 'myPosts':
        apiCall = this.postService.getMyPosts(this.currentPage, this.pageSize);
        break;
      case 'all':
      default:
        apiCall = this.postService.getPublicPosts(this.currentPage, this.pageSize);
        break;
    }

  
  apiCall.subscribe({
    next: (page: Page<Post>) => {
      console.log('loaded:', page.content.length, 'posts. Total pages:', page.totalPages);
      this.posts = [...this.posts, ...page.content];
      this.totalPages = page.totalPages;
      this.currentPage++;
      this.isLoading = false;
    },
    error: (error) => {
      console.error('failed to load posts:', error);
      this.isLoading = false;
    }
  });
}

// This method is called by the infinite scroll directive
  onScroll(): void {
    console.log('🔄 Scroll event triggered at page:', this.currentPage);
    this.loadPosts();
  }

  // Helper method for previews
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
          this.posts = this.posts.filter((p) => p.id !== postId);
          this.snackBar.open('Post deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        });
      }
    });
  }
  

  toggleLike(post: Post): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.likeService.toggleLike(post.id).subscribe({
      next: () => {
        const wasLiked = post.likedByCurrentUser;
        post.likedByCurrentUser = !post.likedByCurrentUser;
        post.likedByCurrentUser ? post.likeCount++ : post.likeCount--;
        
        if (!wasLiked) {
          this.snackBar.open('Post liked! ❤️', '', {
            duration: 1500,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
      },
      error: (err) => {
        if (err.status === 404) {
          // Post was hidden/deleted - remove from feed
          this.posts = this.posts.filter(p => p.id !== post.id);
          this.snackBar.open('This post is no longer available', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to like post', 'Close', { duration: 3000 });
        }
      }
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

  async sharePost(post: Post): Promise<void> {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    
    try {
      await navigator.clipboard.writeText(postUrl);
      this.snackBar.open('Link copied! ✓', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } catch (error) {
      this.snackBar.open('Failed to copy', 'Close', {
        duration: 2000,
      });
    }
  }
 

}
