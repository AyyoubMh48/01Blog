package com._blog.backend.dto;

import com._blog.backend.entity.ReportStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReportResponseDto {
    private Long id;
    private String reason;
    private ReportStatus status;
    private LocalDateTime createdAt;
    private AuthorDto reporter;
    private AuthorDto reportedUser;
}