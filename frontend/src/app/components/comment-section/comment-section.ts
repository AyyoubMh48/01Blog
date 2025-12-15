import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Comment } from '../../models/comment';
import { CommentService } from '../../services/comment';
import { AuthService } from '../../services/auth';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

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
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule],
  templateUrl: './comment-section.html',
  styleUrl: './comment-section.scss'
})
export class CommentSectionComponent implements OnInit {
  @Input() postId!: number; // Input from the parent component (e.g., FeedComponent)
  @Output() commentAdded = new EventEmitter<void>(); // Notifies the parent when a comment is added
  @Output() commentDeleted = new EventEmitter<void>(); // Notifies the parent when a comment is deleted

  comments: Comment[] = [];
  isLoggedIn = false;
  currentUsername: string | null = null;
  isAdmin = false;

  constructor(
    private commentService: CommentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const currentUser = this.authService.getCurrentUser();
    this.currentUsername = currentUser?.username || null;
    this.isAdmin = currentUser?.role === 'ROLE_ADMIN';
    if (this.postId) {
      this.loadComments();
    }
  }

  loadComments(): void {
    this.commentService.getComments(this.postId).subscribe(comments => {
      this.comments = comments;
    });
  }

  canDeleteComment(comment: Comment): boolean {
    return this.isLoggedIn && (this.currentUsername === comment.author.username || this.isAdmin);
  }

  deleteComment(comment: Comment): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Comment',
        message: 'Are you sure you want to delete this comment?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
        icon: 'delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.commentService.deleteComment(this.postId, comment.id).subscribe({
          next: () => {
            this.comments = this.comments.filter(c => c.id !== comment.id);
            this.commentDeleted.emit();
            this.snackBar.open('Comment deleted', 'Close', { duration: 2000 });
          },
          error: (err) => {
            this.snackBar.open('Failed to delete comment', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  onCommentSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.commentService.addComment(this.postId, form.value.content).subscribe({
      next: (newComment) => {
        //this.comments.push(newComment); 
         this.comments.unshift(newComment); // Add new comment at the top
        this.commentAdded.emit(); // Notify the parent component
        form.reset();
        this.snackBar.open('Comment added! 💬', 'Close', { duration: 2000 });
      },
      error: (err) => {
        if (err.status === 404) {
          this.snackBar.open('This post is no longer available', 'Close', { duration: 3000 });
          this.router.navigate(['/feed']);
        } else {
          this.snackBar.open('Failed to add comment', 'Close', { duration: 4000 });
        }
      }
    });
  }
}