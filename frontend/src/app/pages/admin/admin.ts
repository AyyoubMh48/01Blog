import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin';
import { RouterLink } from '@angular/router';
import { Post, PostStatus } from '../../models/post';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
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

  reportColumns: string[] = [
    'id',
    'reason',
    'reporter',
    'reportedUser',
    'date',
    'actions',
  ];
  userColumns: string[] = ['id', 'username', 'email', 'role', 'status'];
  postColumns: string[] = ['id', 'content', 'author','status', 'createdAt', 'actions'];

  constructor(private adminService: AdminService) {}

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
    this.adminService.banUser(userId).subscribe(() => {
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        user.banned = true;
      }
      alert('User banned successfully!');
    });
  }

  unbanUser(userId: number): void {
    this.adminService.unbanUser(userId).subscribe(() => {
      // Find the user in our local array and update their status
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        user.banned = false;
      }
      alert('User unbanned successfully!');
    });
  }

  deletePost(postId: number): void {
    if (confirm('Are you sure you want to delete this post permanently?')) {
      this.adminService.deletePost(postId).subscribe(() => {
        // Remove the post from the local array for an instant UI update
        this.posts = this.posts.filter((p) => p.id !== postId);
      });
    }
  }
  resolveReport(reportId: number, action: string): void {
    this.adminService.resolveReport(reportId, action).subscribe(() => {
      // Remove the report from the local array since it's no longer "OPEN"
      this.reports = this.reports.filter((r) => r.id !== reportId);
    });
  }

  deleteUser(userId: number): void {
    if (confirm('WARNING: This will permanently delete the user and all their posts, comments, likes, etc. Are you absolutely sure?')) {
      this.adminService.deleteUser(userId).subscribe(() => {
        // Remove the user from the local array
        this.users = this.users.filter(u => u.id !== userId);
        alert('User deleted successfully.');
      });
    }
  }

  onHide(postToUpdate: Post): void {
    this.adminService.hidePost(postToUpdate.id).subscribe({
      next: () => {
        postToUpdate.status = PostStatus.HIDDEN_BY_ADMIN;
      },
      error: (err) => console.error('Failed to hide post', err)
    });
  }

 
  onPublish(postToUpdate: Post): void {
    this.adminService.publishPost(postToUpdate.id).subscribe({
      next: () => {
        postToUpdate.status = PostStatus.PUBLISHED;
      },
      error: (err) => console.error('Failed to publish post', err)
    });
  }
}
