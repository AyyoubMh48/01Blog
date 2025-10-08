package com._blog.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class ChangePasswordDto {
    @NotEmpty
    private String oldPassword;

    @NotEmpty
    private String newPassword;
}