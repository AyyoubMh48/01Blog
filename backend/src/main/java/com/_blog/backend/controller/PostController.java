package com._blog.backend.controller;

import com._blog.backend.service.PostService;
import com._blog.backend.config.RateLimitConfig;
import io.github.bucket4j.Bucket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import com._blog.backend.dto.PostResponseDto;
import com._blog.backend.dto.TrendingPostDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Map;
import java.util.List;


@RestController
@RequestMapping("/api/posts")
@Validated
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private RateLimitConfig rateLimitConfig;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPost(@RequestParam("title") String title, @RequestParam("content") String content, @RequestParam(value = "file", required = false) MultipartFile file, @RequestParam(value = "tags", required = false) String tags, Principal principal, HttpServletRequest request) {
        
        String userEmail = principal.getName();
        
        // Check rate limit
        Bucket bucket = rateLimitConfig.resolvePostBucket(userEmail);
        Map<String, Object> rateLimitError = rateLimitConfig.checkRateLimit(bucket, "Too many posts created");
        if (rateLimitError != null) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(rateLimitError);
        }

        PostResponseDto createdPost = postService.createPost(title, content, file, tags, userEmail);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }
    
    @PutMapping("/{postId}")
    public ResponseEntity<PostResponseDto> updatePost(
            @PathVariable Long postId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "tags", required = false) String tags, 
            Principal principal) {
        
        PostResponseDto updatedPost = postService.updatePost(postId,title, content, file,tags, principal.getName());
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId, Principal principal) {
        postService.deletePost(postId, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully."));
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<PostResponseDto>> getPersonalizedFeed(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            Principal principal) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PostResponseDto> feedPage = postService.getFeedForUser(principal.getName(), pageable);
        return ResponseEntity.ok(feedPage);
    }

    @GetMapping
    public ResponseEntity<Page<PostResponseDto>> getAllPosts(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            Principal principal) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String currentUserEmail = (principal != null) ? principal.getName() : null;
        Page<PostResponseDto> postPage = postService.getAllPosts(currentUserEmail, pageable);
        return ResponseEntity.ok(postPage);
    }
    
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPostById(@PathVariable Long postId, Principal principal) {
        String currentUserEmail = (principal != null) ? principal.getName() : null;
        PostResponseDto post = postService.getPostById(postId, currentUserEmail);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/my-posts")
    public ResponseEntity<Page<PostResponseDto>> getMyPosts(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            Principal principal) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PostResponseDto> postPage = postService.getPostsByUser(principal.getName(), pageable);
        return ResponseEntity.ok(postPage);
    }

   @GetMapping("/trending")
    public ResponseEntity<List<TrendingPostDto>> getTrendingPosts(
            @RequestParam(defaultValue = "5") @Min(1) @Max(50) int limit) {
        return ResponseEntity.ok(postService.getTrendingPosts(limit));
    }
    
}