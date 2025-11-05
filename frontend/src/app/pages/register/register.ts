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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule,
    MatFormFieldModule,MatCheckboxModule,MatProgressSpinnerModule,
    MatInputModule,MatIconModule,
    MatButtonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  errorMessage: string | null = null; 
  passwordMismatch = false;
  showPassword = false;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router,private cdr: ChangeDetectorRef ) {}


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

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
    this.isLoading = true;

    this.authService.register(registerForm.value).subscribe({
      next: (response) => {
        console.log('Registration successful!', response);
        this.isLoading = false;
         this.cdr.detectChanges();   
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Full error object:', err);
        this.isLoading = false;

        this.errorMessage = err.error?.message || 'An unknown error occurred.';
        this.cdr.detectChanges();   
        console.error('Registration failed:', this.errorMessage);
      }
    });
  }
}