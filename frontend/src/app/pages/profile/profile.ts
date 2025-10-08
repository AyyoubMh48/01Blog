import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../services/user';

// Import Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private userService: UserService) {}

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    // Clear previous messages
    this.successMessage = null;
    this.errorMessage = null;

    const { newPassword, confirmPassword } = form.value;
    if (newPassword !== confirmPassword) {
      this.errorMessage = "New passwords do not match.";
      return;
    }

    const passwordData = {
      oldPassword: form.value.oldPassword,
      newPassword: form.value.newPassword
    };

    this.userService.changePassword(passwordData).subscribe({
      next: (response) => {
        this.successMessage = "Password changed successfully!";
        form.reset();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "An error occurred.";
      }
    });
  }
}