import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PostService } from '../../services/post';
import { Post } from '../../models/post';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.html',
  styleUrl: './feed.scss'
})
export class Feed implements OnInit {
  posts: Post[] = [];

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.postService.getPosts().subscribe(posts => {
      // Sort posts to show the newest first
      this.posts = posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
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