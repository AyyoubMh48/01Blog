package com._blog.backend.controller;

import com._blog.backend.dto.ReportRequestDto;
import com._blog.backend.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping("/{userId}/report")
    public ResponseEntity<?> submitReport(
            @PathVariable Long userId,
            @Valid @RequestBody ReportRequestDto reportDto,
            Principal principal) {
        
        reportService.createReport(principal.getName(), userId, reportDto);
        return ResponseEntity.ok(Map.of("message", "Report submitted successfully."));
    }
}