import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getOpenReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  banUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/ban`, {});
  }
  unbanUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/unban`, {});
  }
  getAllPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/posts`);
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/posts/${postId}`);
  }

  resolveReport(reportId: number, action: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/reports/${reportId}/action?action=${action}`,
      {}
    );
  }
  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`);
  }
}
