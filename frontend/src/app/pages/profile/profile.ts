import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { UserProfile } from '../../models/user-profile';

// Import Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,MatIconModule, MatProgressBarModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  successMessage: string | null = null;
  errorMessage: string | null = null;
  userProfile: UserProfile | null = null;
  isUploading = false;

  constructor(private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userService.getUserProfile(currentUser.username).subscribe(profile => {
        this.userProfile = profile;
      });
    }
  }

  // onSubmit(form: NgForm): void {
  //   if (form.invalid) {
  //     return;
  //   }
  //   // Clear previous messages
  //   this.successMessage = null;
  //   this.errorMessage = null;

  //   const { newPassword, confirmPassword } = form.value;
  //   if (newPassword !== confirmPassword) {
  //     this.errorMessage = "New passwords do not match.";
  //     return;
  //   }

  //   const passwordData = {
  //     oldPassword: form.value.oldPassword,
  //     newPassword: form.value.newPassword
  //   };

  //   this.userService.changePassword(passwordData).subscribe({
  //     next: (response) => {
  //       this.successMessage = "Password changed successfully!";
  //       form.reset();
  //     },
  //     error: (err) => {
  //       this.errorMessage = err.error?.message || "An error occurred.";
  //     }
  //   });
  // }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      this.isUploading = true;
      this.userService.updateAvatar(formData).subscribe({
        next: (response: any) => {
          if (this.userProfile) {
            this.userProfile.avatarUrl = response.url; // Update the avatar in the view
          }
          this.isUploading = false;
        },
        error: (err) => {
          this.errorMessage = "Avatar upload failed.";
          this.isUploading = false;
        }
      });
    }
  }
  onBioSubmit(form: NgForm): void {
    if (form.invalid || !this.userProfile) {
      return;
    }
    this.successMessage = null;
    this.errorMessage = null;

    this.userService.updateProfile({ bio: form.value.bio }).subscribe({
      next: () => {
        this.successMessage = "Profile updated successfully!";
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "An error occurred.";
      }
    });
  }

  onChangePasswordSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }
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