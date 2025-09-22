package com._blog.backend.controller;

import com._blog.backend.dto.CommentRequestDto;
import com._blog.backend.dto.CommentResponseDto;
import com._blog.backend.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // Create a new comment on a specific post (Secure)
    @PostMapping
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequestDto commentDto,
            Principal principal) {
        
        CommentResponseDto createdComment = commentService.addComment(postId, commentDto, principal.getName());
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    // Get all comments for a specific post (Public)
    @GetMapping
    public ResponseEntity<List<CommentResponseDto>> getCommentsForPost(@PathVariable Long postId) {
        List<CommentResponseDto> comments = commentService.getCommentsForPost(postId);
        return ResponseEntity.ok(comments);
    }
}