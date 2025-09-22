package com._blog.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class ReportRequestDto {
    @NotEmpty(message = "A reason for the report must be provided.")
    private String reason;
}