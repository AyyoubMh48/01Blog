package com._blog.backend.controller;

import com._blog.backend.dto.PostDto;
import com._blog.backend.entity.Post;
import com._blog.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import com._blog.backend.dto.PostResponseDto;


@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<PostResponseDto> createPost(@Valid @RequestBody PostDto postDto, Principal principal) {
        String authorEmail = principal.getName();
        PostResponseDto createdPost = postService.createPost(postDto, authorEmail);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostResponseDto>> getPersonalizedFeed(Principal principal) {
        List<PostResponseDto> feed = postService.getFeedForUser(principal.getName());
        return ResponseEntity.ok(feed);
    }

    @GetMapping
    public ResponseEntity<List<PostResponseDto>> getAllPosts() {
        List<PostResponseDto> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }
}