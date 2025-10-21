package com._blog.backend.controller;

import com._blog.backend.dto.AdminAnalyticsDto;
import com._blog.backend.dto.PostResponseDto;
import com._blog.backend.dto.ReportResponseDto;
import com._blog.backend.dto.UserDto;
import com._blog.backend.entity.Report;
import com._blog.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReportResponseDto>> getOpenReports() {
        return ResponseEntity.ok(adminService.getOpenReports());
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users/{userId}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> banUser(@PathVariable Long userId) {
        adminService.banUser(userId);
        return ResponseEntity.ok(Map.of("message", "User has been banned successfully."));
    }

    @DeleteMapping("/posts/{postId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePost(@PathVariable Long postId) {
        adminService.deletePost(postId);
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully."));
    }

    @GetMapping("/posts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PostResponseDto>> getAllPosts() {
        return ResponseEntity.ok(adminService.getAllPosts());
    }

    @PostMapping("/reports/{reportId}/action")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resolveReport(@PathVariable Long reportId, @RequestParam String action) {
        adminService.resolveReport(reportId, action);
        return ResponseEntity.ok(Map.of("message", "Report status updated successfully."));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminAnalyticsDto> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    @PostMapping("/users/{userId}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> unbanUser(@PathVariable Long userId) {
        adminService.unbanUser(userId);
        return ResponseEntity.ok(Map.of("message", "User has been unbanned successfully."));
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(Map.of("message", "User and all associated data deleted successfully."));
    }
}