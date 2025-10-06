import { Component , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  errorMessage: string | null = null; 

  constructor(private authService: AuthService , private cdr: ChangeDetectorRef) {}

  onSubmit(registerForm: NgForm) {
    this.errorMessage = null;
    //  console.log('Register form submitted!');
    if (registerForm.invalid) {
      return;
    }

    const { password, confirmPassword } = registerForm.value;
    if (password !== confirmPassword) {
      console.error('Passwords do not match!');
      return;
    }

    // Call the service and subscribe to the response
    this.authService.register(registerForm.value).subscribe({
      next: (response) => {
        console.log('Registration successful!', response);
      },
      error: (err) => {
        console.error('Full error object:', err);

        this.errorMessage = err.error?.message || 'An unknown error occurred.';
        console.error('Registration failed:', this.errorMessage);
        this.cdr.detectChanges(); 
      }
    });
  }
}