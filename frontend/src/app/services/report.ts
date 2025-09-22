import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  reportUser(userId: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/report`, { reason });
  }
}