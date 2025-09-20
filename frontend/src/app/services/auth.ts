import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';


export interface JwtResponse {
  token: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) { }

  register(userData: any) {

    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveToken(response.token);
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('authToken');
    // The '!!' converts the string or null to a true/false boolean
    return !!token; 
  }
}