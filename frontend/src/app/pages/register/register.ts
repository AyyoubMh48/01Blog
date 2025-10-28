import { Component , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule,
    MatFormFieldModule,
    MatInputModule,MatIconModule,
    MatButtonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {

  errorMessage: string | null = null; 
  passwordMismatch = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(registerForm: NgForm) {
    this.errorMessage = null;
    this.passwordMismatch = false;
    //  console.log('Register form submitted!');
    if (registerForm.invalid) {
      return;
    }

    const { password, confirmPassword } = registerForm.value;
    if (password !== confirmPassword) {
      console.error('Passwords do not match!');
      this.passwordMismatch = true;
      return;
    }

    this.authService.register(registerForm.value).subscribe({
      next: (response) => {
        console.log('Registration successful!', response);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Full error object:', err);

        this.errorMessage = err.error?.message || 'An unknown error occurred.';
        console.error('Registration failed:', this.errorMessage);
      }
    });
  }
}