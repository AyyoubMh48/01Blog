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

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getOpenReports().subscribe(data => {
      this.reports = data;
    });
    this.adminService.getUsers().subscribe(data => {
    this.users = data;
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
}