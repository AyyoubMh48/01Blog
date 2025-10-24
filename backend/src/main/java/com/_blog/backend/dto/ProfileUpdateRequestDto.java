package com._blog.backend.dto;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileUpdateRequestDto {
    @Size(min = 10, max = 200, message = "Bio must be between 10 and 200 characters.")
    private String bio;
}