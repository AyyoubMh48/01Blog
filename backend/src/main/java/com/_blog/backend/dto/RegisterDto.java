package com._blog.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data 
public class RegisterDto {
    
    @NotEmpty(message = "Username cannot be empty.")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters.")
    private String username;

    @NotEmpty(message = "Email cannot be empty.")
    @Email(message = "Please provide a valid email address.")
    private String email;

    @NotEmpty(message = "Password cannot be empty.")
    @Size(min = 8, max = 50, message = "Password must be between 8 and 50 characters.")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!*]).{8,}$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&+=!*)"
    )
    private String password;
}