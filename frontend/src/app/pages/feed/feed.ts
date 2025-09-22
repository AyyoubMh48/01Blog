import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PostService } from '../../services/post';
import { Post } from '../../models/post';
import { AuthService } from '../../services/auth';
import { LikeService } from '../../services/like';
import { Router } from '@angular/router';
import { CommentSectionComponent } from '../../components/comment-section/comment-section'; 

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule,CommentSectionComponent],
  templateUrl: './feed.html',
  styleUrl: './feed.scss'
})
export class Feed implements OnInit {
  posts: Post[] = [];
  isLoggedIn = false;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  expandedPostIds = new Set<number>(); ;

  constructor(
      private postService: PostService,
      private authService: AuthService,
      private likeService: LikeService,
      private router : Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadPosts();
  }

  loadPosts(): void {
    if (this.isLoggedIn) {
      this.postService.getFeed().subscribe(posts => {
        this.posts =  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());;
      });
    } else {
      this.postService.getPublicPosts().subscribe(posts => {
        this.posts =  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());;
      });
    }
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      // Show image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onPostSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('content', form.value.content);
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    this.postService.createPost(formData).subscribe(newPost => {
      this.posts.unshift(newPost);
      form.reset();
      this.selectedFile = null;
      this.imagePreview = null;
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