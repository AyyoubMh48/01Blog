import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Comment } from '../../models/comment';
import { CommentService } from '../../services/comment';
import { AuthService } from '../../services/auth';
import { RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIconModule],
  templateUrl: './comment-section.html',
  styleUrl: './comment-section.scss'
})
export class CommentSectionComponent implements OnInit {
  @Input() postId!: number; // Input from the parent component (e.g., FeedComponent)
  @Output() commentAdded = new EventEmitter<void>(); // Notifies the parent when a comment is added

  comments: Comment[] = [];
  isLoggedIn = false;

  constructor(
    private commentService: CommentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.postId) {
      this.loadComments();
    }
  }

  loadComments(): void {
    this.commentService.getComments(this.postId).subscribe(comments => {
      this.comments = comments;
    });
  }

  onCommentSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.commentService.addComment(this.postId, form.value.content).subscribe(newComment => {
      this.comments.push(newComment); // Add new comment to the list
      this.commentAdded.emit(); // Notify the parent component
      form.reset();
    });
  }
}