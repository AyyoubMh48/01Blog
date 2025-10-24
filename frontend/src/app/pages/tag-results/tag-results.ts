import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router'; 
import { PostService, Page } from '../../services/post'; 
import { TagService } from '../../services/tag';
import { Post } from '../../models/post';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon';   
import { InfiniteScrollModule } from 'ngx-infinite-scroll'; 

@Component({
  selector: 'app-tag-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, 
    MatCardModule,
    MatButtonModule, 
    MatIconModule,   
    InfiniteScrollModule 
  ],
  templateUrl: './tag-results.html',
  styleUrl: './tag-results.scss'
})
export class TagResults implements OnInit {
  posts: Post[] = [];
  tagName: string | null = null;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private tagService: TagService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tagName = params.get('tagName');
      if (this.tagName) {
        this.resetAndLoadPosts(); 
      } else {
        this.errorMessage = "Tag name not found in URL.";
      }
    });
  }

  resetAndLoadPosts(): void {
    this.posts = [];
    this.currentPage = 0;
    this.totalPages = 0;
    this.isLoading = false;
    this.errorMessage = null;
    this.loadPosts();
  }

  loadPosts(): void {
    if (!this.tagName || this.isLoading || (this.totalPages > 0 && this.currentPage >= this.totalPages)) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;

    this.tagService.getPostsByTag(this.tagName, this.currentPage, this.pageSize)
      .subscribe({
        next: (page: Page<Post>) => {
          this.posts = [...this.posts, ...page.content];
          this.totalPages = page.totalPages;
          this.currentPage++;
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Failed to load posts for tag:", err);
          this.errorMessage = "Could not load posts for this tag.";
          this.isLoading = false;
        }
    });
  }

  onScroll(): void {
    this.loadPosts();
  }

  stripHtml(html: string): string {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }
}