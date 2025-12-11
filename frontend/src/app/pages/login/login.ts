import { Component,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,MatCardModule,
    MatFormFieldModule,
    MatInputModule,MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule,

    MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  errorMessage: string | null = null;
  showPassword = false;
  isLoading = false;
  

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


  onSubmit(loginForm: NgForm) {
    if (loginForm.invalid) {
      return;
    }

    this.errorMessage = null;
    this.isLoading = true; 

    this.authService.login(loginForm.value).subscribe({
      next: () => {
        this.isLoading = false; 
        this.cdr.detectChanges(); 
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 
          err.error?.message || 
          'Login failed. Please check your credentials.';
        this.cdr.detectChanges(); 
      }
    });
  }
}
