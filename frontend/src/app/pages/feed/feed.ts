import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PostService } from '../../services/post';
import { Post } from '../../models/post';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.html',
  styleUrl: './feed.scss'
})
export class Feed implements OnInit {
  posts: Post[] = [];
  isLoggedIn = false;

  constructor(
      private postService: PostService,
      private authService: AuthService
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

  onPostSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.postService.createPost(form.value).subscribe(newPost => {
      // Add the new post to the top of the list for a real-time feel
      this.posts.unshift(newPost);
      form.reset();
    });
  }
}