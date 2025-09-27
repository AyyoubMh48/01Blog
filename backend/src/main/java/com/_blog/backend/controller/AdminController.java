package com._blog.backend.controller;

import com._blog.backend.entity.Report;
import com._blog.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/reports")
    @PreAuthorize("hasRole('ADMIN')") // This ensures only admins can access this endpoint
    public ResponseEntity<List<Report>> getOpenReports() {
        return ResponseEntity.ok(adminService.getOpenReports());
    }
}