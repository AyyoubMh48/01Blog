import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';
import { HeaderComponent } from './components/header/header'; 
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent,FooterComponent],
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