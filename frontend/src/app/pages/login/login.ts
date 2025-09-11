import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { RouterLink } from '@angular/router'
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  constructor(private authService: AuthService) {}

  onSubmit(loginForm: NgForm) {
    if (loginForm.invalid) {
      return; 
    }
    this.authService.login(loginForm.value);
  }
}
