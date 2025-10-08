import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable,BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode 
import { Router } from '@angular/router';

// This interface is for the login response from the server
export interface JwtResponse {
  token: string;
}
// This interface is for the data inside the decoded JWT.
export interface DecodedToken {
  sub: string;      // subject (email)
  username: string;
  role: string;
   exp: number; //(expiration time)
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';

  private loggedInStatus = new BehaviorSubject<boolean>(!!localStorage.getItem('authToken'));

  loggedInStatus$ = this.loggedInStatus.asObservable();

  constructor(
    private http: HttpClient,
  private router: Router 
  ) { }

  register(userData: any) {

    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveToken(response.token);
        this.loggedInStatus.next(true); 
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

  getCurrentUser(): DecodedToken | null {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }
    
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }

  checkTokenValidity(): void {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const isExpired = decodedToken.exp * 1000 < Date.now();
      
      if (isExpired) {
        console.log("Token is expired, logging out.");
        this.logout();
      }
    } catch (error) {
      console.error("Invalid token found, logging out.", error);
      this.logout();
    }
  }
}


logout(): void {
  localStorage.removeItem('authToken');
  this.loggedInStatus.next(false);
  window.location.href = '/login';
}
}