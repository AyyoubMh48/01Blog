package com._blog.backend.controller;

import com._blog.backend.dto.CommentRequestDto;
import com._blog.backend.dto.CommentResponseDto;
import com._blog.backend.service.CommentService;
import com._blog.backend.config.RateLimitConfig;
import io.github.bucket4j.Bucket;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private RateLimitConfig rateLimitConfig;

    // Create a new comment on a specific post (Secure)
    @PostMapping
    public ResponseEntity<?> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequestDto commentDto,
            Principal principal,
            HttpServletRequest request) {
        
        String userEmail = principal.getName();
        
        // Check rate limit
        Bucket bucket = rateLimitConfig.resolveCommentBucket(userEmail);
        Map<String, Object> rateLimitError = rateLimitConfig.checkRateLimit(bucket, "Too many comments posted");
        if (rateLimitError != null) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(rateLimitError);
        }

        CommentResponseDto createdComment = commentService.addComment(postId, commentDto, userEmail);
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    // Get all comments for a specific post (Public)
    @GetMapping
    public ResponseEntity<List<CommentResponseDto>> getCommentsForPost(@PathVariable Long postId) {
        List<CommentResponseDto> comments = commentService.getCommentsForPost(postId);
        return ResponseEntity.ok(comments);
    }
}