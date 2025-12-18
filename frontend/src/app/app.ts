import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';
import { HeaderComponent } from './components/header/header'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit { 
  title = 'LogX';

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.checkTokenValidity();
  }
}