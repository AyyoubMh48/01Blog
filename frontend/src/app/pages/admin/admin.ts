import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin';
import { RouterLink } from '@angular/router';
import { Post, PostStatus } from '../../models/post';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  reports: any[] = [];
  users: any[] = [];
  posts: Post[] = [];
  analytics: any = {};

  PostStatus = PostStatus;
  selectedTabIndex = 0; 

  // reportColumns: string[] = [
  //   'id',
  //   'reason',
  //   'reporter',
  //   'reportedUser',
  //   'date',
  //   'actions',
  // ];
  // userColumns: string[] = ['id', 'username', 'email', 'role', 'status'];
  // postColumns: string[] = ['id', 'content', 'author','status', 'createdAt', 'actions'];

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.adminService.getOpenReports().subscribe((data) => {
      this.reports = data;
    });
    this.adminService.getUsers().subscribe((data) => {
      this.users = data;
    });
    this.adminService.getAllPosts().subscribe((data) => {
      this.posts = data;
    });
    this.adminService.getAnalytics().subscribe((data) => {
      this.analytics = data;
    });
  }
  banUser(userId: number): void {
    const user = this.users.find((u) => u.id === userId);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Ban User',
        message: `Are you sure you want to ban "${user?.username}"? They will no longer be able to access the platform.`,
        confirmText: 'Ban User',
        cancelText: 'Cancel',
        confirmColor: 'warn',
        icon: 'block'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.banUser(userId).subscribe({
          next: () => {
            if (user) {
              user.banned = true;
            }
            this.snackBar.open(`User "${user?.username}" has been banned 🚫`, 'Close', { duration: 3000 });
          },
          error: (err) => {
            this.snackBar.open('Failed to ban user', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  unbanUser(userId: number): void {
    const user = this.users.find((u) => u.id === userId);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Unban User',
        message: `Unban "${user?.username}"? They will regain access to the platform.`,
        confirmText: 'Unban',
        cancelText: 'Cancel',
        confirmColor: 'primary',
        icon: 'check_circle'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.unbanUser(userId).subscribe({
          next: () => {
            if (user) {
              user.banned = false;
            }
            this.snackBar.open(`User "${user?.username}" has been unbanned ✅`, 'Close', { duration: 3000 });
          },
          error: (err) => {
            this.snackBar.open('Failed to unban user', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  deletePost(postId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Post',
        message: 'Are you sure you want to delete this post permanently? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
        icon: 'delete_forever'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deletePost(postId).subscribe({
          next: () => {
            this.posts = this.posts.filter((p) => p.id !== postId);
            this.snackBar.open('Post deleted permanently 🗑️', 'Close', { duration: 3000 });
          },
          error: (err) => {
            this.snackBar.open('Failed to delete post', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }
  resolveReport(reportId: number, action: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Resolve Report',
        message: `Mark this report as resolved with action: "${action}"?`,
        confirmText: 'Resolve',
        cancelText: 'Cancel',
        confirmColor: 'primary',
        icon: 'task_alt'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.resolveReport(reportId, action).subscribe({
          next: () => {
            this.reports = this.reports.filter((r) => r.id !== reportId);
            this.snackBar.open(`Report resolved: ${action} ✓`, 'Close', { duration: 3000 });
          },
          error: (err) => {
            this.snackBar.open('Failed to resolve report', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  deleteUser(userId: number): void {
    const user = this.users.find(u => u.id === userId);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '⚠️ Delete User Permanently',
        message: `This will permanently delete "${user?.username}" and ALL their posts, comments, likes, etc. This action CANNOT be undone. Are you absolutely sure?`,
        confirmText: 'Delete Permanently',
        cancelText: 'Cancel',
        confirmColor: 'warn',
        icon: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteUser(userId).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== userId);
            this.snackBar.open('User and all associated data deleted permanently', 'Close', { duration: 4000 });
          },
          error: (err) => {
            this.snackBar.open('Failed to delete user', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  onHide(postToUpdate: Post): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Hide Post',
        message: 'Hide this post? It will no longer be visible to users.',
        confirmText: 'Hide',
        cancelText: 'Cancel',
        confirmColor: 'accent',
        icon: 'visibility_off'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.hidePost(postToUpdate.id).subscribe({
          next: () => {
            postToUpdate.status = PostStatus.HIDDEN_BY_ADMIN;
            this.snackBar.open('Post hidden from public view 👁️', 'Close', { duration: 3000 });
          },
          error: (err) => {
            this.snackBar.open('Failed to hide post', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

 
  onPublish(postToUpdate: Post): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Publish Post',
        message: 'Publish this post? It will become visible to all users.',
        confirmText: 'Publish',
        cancelText: 'Cancel',
        confirmColor: 'primary',
        icon: 'publish'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.publishPost(postToUpdate.id).subscribe({
          next: () => {
            postToUpdate.status = PostStatus.PUBLISHED;
            this.snackBar.open('Post published successfully 📢', 'Close', { duration: 3000 });
          },
          error: (err) => {
            this.snackBar.open('Failed to publish post', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }
}
