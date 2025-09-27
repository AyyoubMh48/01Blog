import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit { 
  title = '01blog-frontend';

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.checkTokenValidity();
  }
}