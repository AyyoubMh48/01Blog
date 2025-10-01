import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {
  reports: any[] = [];
  users: any[] = [];
  posts: any[] = [];
  analytics: any = {};

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getOpenReports().subscribe(data => {
      this.reports = data;
    });
    this.adminService.getUsers().subscribe(data => {
      this.users = data;
    });
    this.adminService.getAllPosts().subscribe(data => {
      this.posts = data;
    });
    this.adminService.getAnalytics().subscribe(data => {
      this.analytics = data;
    });
  }
  banUser(userId: number): void {
    this.adminService.banUser(userId).subscribe(() => {
      const user = this.users.find(u => u.id === userId);
      if (user) {
        user.banned = true; 
      }
      alert('User banned successfully!');
    });
  }
  deletePost(postId: number): void {
    if (confirm('Are you sure you want to delete this post permanently?')) {
      this.adminService.deletePost(postId).subscribe(() => {
        // Remove the post from the local array for an instant UI update
        this.posts = this.posts.filter(p => p.id !== postId);
      });
    }
  }
  resolveReport(reportId: number, action: string): void {
    this.adminService.resolveReport(reportId, action).subscribe(() => {
      // Remove the report from the local array since it's no longer "OPEN"
      this.reports = this.reports.filter(r => r.id !== reportId);
    });
  }
}