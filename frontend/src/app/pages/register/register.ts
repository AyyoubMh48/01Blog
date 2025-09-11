import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  constructor(private authService: AuthService) {}

  onSubmit(registerForm: NgForm) {
    //  console.log('Register form submitted!');
    if (registerForm.invalid) {
      return;
    }

    const { password, confirmPassword } = registerForm.value;
    if (password !== confirmPassword) {
      console.error('Passwords do not match!');
      return;
    }

    this.authService.register(registerForm.value);
  }
}