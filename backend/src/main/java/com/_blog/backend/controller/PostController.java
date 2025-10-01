package com._blog.backend.controller;

import com._blog.backend.dto.PostDto;
import com._blog.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import com._blog.backend.dto.PostResponseDto;
import com._blog.backend.entity.Post;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponseDto> createPost(@RequestParam("content") String content, @RequestParam(value = "file", required = false) MultipartFile file,Principal principal) {
        String authorEmail = principal.getName();
        PostResponseDto createdPost = postService.createPost(content,file, authorEmail);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }
    
    @PutMapping("/{postId}")
    public ResponseEntity<PostResponseDto> updatePost(
            @PathVariable Long postId,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Principal principal) {
        
        PostResponseDto updatedPost = postService.updatePost(postId, content, file, principal.getName());
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId, Principal principal) {
        postService.deletePost(postId, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully."));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostResponseDto>> getPersonalizedFeed(Principal principal) {
        List<PostResponseDto> feed = postService.getFeedForUser(principal.getName());
        return ResponseEntity.ok(feed);
    }

    @GetMapping
    public ResponseEntity<List<PostResponseDto>> getAllPosts(Principal principal) {
        String currentUserEmail = (principal != null) ? principal.getName() : null;

        List<PostResponseDto> posts = postService.getAllPosts(currentUserEmail);
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPostById(@PathVariable Long postId, Principal principal) {
        String currentUserEmail = (principal != null) ? principal.getName() : null;
        PostResponseDto post = postService.getPostById(postId, currentUserEmail);
        return ResponseEntity.ok(post);
    }
    
}