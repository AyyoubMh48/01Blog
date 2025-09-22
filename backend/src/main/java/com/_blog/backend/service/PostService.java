package com._blog.backend.service;

import com._blog.backend.dto.AuthorDto;
import com._blog.backend.dto.PostDto;
import com._blog.backend.dto.PostResponseDto;
import com._blog.backend.entity.Post;
import com._blog.backend.entity.User;
import com._blog.backend.repository.LikeRepository;
import com._blog.backend.repository.PostRepository;
import com._blog.backend.repository.SubscriptionRepository;
import com._blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com._blog.backend.entity.Subscription;
import org.springframework.web.multipart.MultipartFile;

import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private LikeRepository likeRepository;

    @Transactional //ensures all database operations inside this method are atomic (all succeed or all fail).
    public PostResponseDto createPost(String content, MultipartFile file, String authorEmail) {
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + authorEmail));

        String mediaUrl = null;
        // If a file was provided, upload it
        if (file != null && !file.isEmpty()) {
            mediaUrl = fileStorageService.storeFile(file);
        }

        Post newPost = new Post();
        newPost.setContent(content);
        newPost.setAuthor(author);
        newPost.setMediaUrl(mediaUrl);


        Post savedPost = postRepository.save(newPost);
        return mapToDto(savedPost, author);
    }
    

   @Transactional(readOnly = true)
    public List<PostResponseDto> getAllPosts(String currentUserEmail) {
        User currentUser = (currentUserEmail != null) ? userRepository.findByEmail(currentUserEmail).orElse(null) : null;
        return postRepository.findAll()
                .stream()
                .map(post -> mapToDto(post, currentUser))
                .toList();
    }


   @Transactional(readOnly = true)
    public List<PostResponseDto> getFeedForUser(String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        List<User> authorsToFetch = subscriptionRepository.findAllByFollower(currentUser)
                .stream()
                .map(Subscription::getFollowing)
                .collect(Collectors.toCollection(ArrayList::new)); 
        authorsToFetch.add(currentUser);

        List<Post> posts = postRepository.findByAuthorInOrderByCreatedAtDesc(authorsToFetch);

        return posts.stream()
                .map(post -> mapToDto(post, currentUser))
                .toList();
    }


    public PostResponseDto mapToDto(Post post, User currentUser) {
        PostResponseDto dto = new PostResponseDto();
        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setMediaUrl(post.getMediaUrl());

        AuthorDto authorDto = new AuthorDto();
        authorDto.setId(post.getAuthor().getId());
        authorDto.setUsername(post.getAuthor().getUsername());
        
        dto.setAuthor(authorDto);

        dto.setLikeCount(likeRepository.countByPost(post));
        
        boolean isLiked = (currentUser != null) && likeRepository.findByPostAndUser(post, currentUser).isPresent();
        dto.setLikedByCurrentUser(isLiked);
        
        return dto;
    }
}