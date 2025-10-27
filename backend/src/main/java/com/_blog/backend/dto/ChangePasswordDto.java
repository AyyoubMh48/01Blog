package com._blog.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordDto {
    @NotEmpty
    private String oldPassword;

    @NotEmpty
    @Size(min = 8, message = "New password must be at least 8 characters long.")
    private String newPassword;
}