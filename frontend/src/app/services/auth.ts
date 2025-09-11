import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  constructor(private http: HttpClient) { }

  register(userData: any) {
    console.log('Registering user:', userData);
  }

  login(credentials: any) {
    console.log('Logging in with:', credentials);
  }
}