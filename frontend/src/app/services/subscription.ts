import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  follow(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/follow`, {});
  }

  unfollow(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/unfollow`);
  }
}