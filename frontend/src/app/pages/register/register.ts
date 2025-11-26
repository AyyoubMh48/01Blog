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
  passwordStrength: string = '';
  passwordStrengthColor: string = '';

  // Password validation patterns
  private readonly passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!*]).{8,}$/;
  private readonly hasUpperCase = /[A-Z]/;
  private readonly hasLowerCase = /[a-z]/;
  private readonly hasNumber = /\d/;
  private readonly hasSpecialChar = /[@#$%^&+=!*]/;

  constructor(private authService: AuthService, private router: Router,private cdr: ChangeDetectorRef ) {}


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isPasswordValid(password: string): boolean {
    return this.passwordPattern.test(password);
  }

  hasMinLength(password: string): boolean {
    return password?.length >= 8;
  }

  hasUppercase(password: string): boolean {
    return this.hasUpperCase.test(password);
  }

  hasLowercase(password: string): boolean {
    return this.hasLowerCase.test(password);
  }

  hasDigit(password: string): boolean {
    return this.hasNumber.test(password);
  }

  hasSpecial(password: string): boolean {
    return this.hasSpecialChar.test(password);
  }

  checkPasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = '';
      this.passwordStrengthColor = '';
      return;
    }

    let strength = 0;
    const checks = [
      { test: password.length >= 8, points: 1 },
      { test: this.hasUpperCase.test(password), points: 1 },
      { test: this.hasLowerCase.test(password), points: 1 },
      { test: this.hasNumber.test(password), points: 1 },
      { test: this.hasSpecialChar.test(password), points: 1 },
      { test: password.length >= 12, points: 1 }
    ];

    strength = checks.filter(check => check.test).length;

    if (strength <= 2) {
      this.passwordStrength = 'Weak';
      this.passwordStrengthColor = 'weak';
    } else if (strength <= 4) {
      this.passwordStrength = 'Medium';
      this.passwordStrengthColor = 'medium';
    } else {
      this.passwordStrength = 'Strong';
      this.passwordStrengthColor = 'strong';
    }
  }

  onSubmit(registerForm: NgForm) {
    this.errorMessage = null;
    this.passwordMismatch = false;
    //  console.log('Register form submitted!');
    if (registerForm.invalid) {
      return;
    }

    const { password, confirmPassword } = registerForm.value;
    
    // Check password complexity
    if (!this.isPasswordValid(password)) {
      this.errorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&+=!*)';
      return;
    }
    
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