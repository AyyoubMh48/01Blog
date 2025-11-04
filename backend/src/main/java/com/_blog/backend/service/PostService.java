package com._blog.backend.service;

import com._blog.backend.dto.AuthorDto;
import com._blog.backend.dto.PostResponseDto;
import com._blog.backend.entity.Post;
import com._blog.backend.entity.PostStatus; 
import com._blog.backend.entity.User;
import com._blog.backend.dto.TagDto;
import com._blog.backend.dto.TrendingPostDto;
import com._blog.backend.entity.Tag;
import com._blog.backend.repository.CommentRepository;
import com._blog.backend.repository.LikeRepository;
import com._blog.backend.repository.MediaRepository;
import com._blog.backend.repository.PostRepository;
import com._blog.backend.repository.SubscriptionRepository;
import com._blog.backend.repository.TagRepository;
import com._blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com._blog.backend.entity.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com._blog.backend.exception.ResourceNotFoundException;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private LikeRepository likeRepository;
    @Autowired
    private FileStorageService fileStorageService;
    @Autowired
    private SubscriptionRepository subscriptionRepository;
    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public PostResponseDto createPost(String title, String content, MultipartFile file, String tags,
            String authorEmail) {

            if (title == null || title.trim().isEmpty()) {
                throw new IllegalArgumentException("Post title cannot be empty.");
            }
            if (title.length() > 100) { 
                throw new IllegalArgumentException("Post title cannot exceed 100 characters.");
            }
            if (content == null || content.trim().isEmpty()) {
                throw new IllegalArgumentException("Post content cannot be empty.");
            }
            if (content.length() > 10000) { 
                throw new IllegalArgumentException("Post content cannot exceed 10000 characters.");
            }

        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + authorEmail));

        String mediaUrl = null;
        if (file != null && !file.isEmpty()) {
            mediaUrl = fileStorageService.storeFile(file, authorEmail);
        }

        Post newPost = new Post();
        newPost.setTitle(title);
        newPost.setContent(content);
        newPost.setAuthor(author);
        newPost.setMediaUrl(mediaUrl);

        Set<Tag> tagSet = parseAndSaveTags(tags);
        newPost.setTags(tagSet);

        Post savedPost = postRepository.save(newPost);

        List<Subscription> subscriptions = subscriptionRepository.findAllByFollowing(author);

        String message = author.getOriginalUsername() + " published a new post: " + savedPost.getTitle();
        for (Subscription sub : subscriptions) {
            User follower = sub.getFollower();
            notificationService.createNotification(author, follower, message, "/post/" + savedPost.getId());
        }

        return mapToDto(savedPost, author);
    }

    @Transactional(readOnly = true)
    public Page<PostResponseDto> getAllPosts(String currentUserEmail, Pageable pageable) {
        User currentUser = (currentUserEmail != null) ? userRepository.findByEmail(currentUserEmail).orElse(null) : null;
        Page<Post> postPage = postRepository.findAllByStatusOrderByCreatedAtDesc(PostStatus.PUBLISHED, pageable);
        return postPage.map(post -> mapToDto(post, currentUser));
    }

    @Transactional(readOnly = true)
    public PostResponseDto getPostById(Long postId, String userEmail) {
        User currentUser = (userEmail != null) ? userRepository.findByEmail(userEmail).orElse(null) : null;
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        // Security Check: Only show non-published posts to admins or the author
        if (post.getStatus() != PostStatus.PUBLISHED) {
            if (currentUser == null || (!currentUser.getRole().equals("ROLE_ADMIN") && !post.getAuthor().getId().equals(currentUser.getId()))) {
                throw new ResourceNotFoundException("Post not found"); // Hide it
            }
        }
        
        return mapToDto(post, currentUser);
    }

    @Transactional(readOnly = true)
    public Page<PostResponseDto> getFeedForUser(String userEmail, Pageable pageable) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        List<User> authorsToFetch = subscriptionRepository.findAllByFollower(currentUser)
                .stream()
                .map(Subscription::getFollowing)
                .collect(Collectors.toList());

        Page<Post> postPage = postRepository.findByAuthorInAndStatusOrderByCreatedAtDesc(authorsToFetch, PostStatus.PUBLISHED, pageable);
        return postPage.map(post -> mapToDto(post, currentUser));
    }

    @Transactional(readOnly = true)
    public Page<PostResponseDto> getPostsByUser(String userEmail, Pageable pageable) {
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));
        Page<Post> postPage = postRepository.findAllByAuthorOrderByCreatedAtDesc(author,pageable);
        return postPage.map(post -> mapToDto(post, author));
    }

    @Transactional
    public PostResponseDto updatePost(Long postId, String title, String content, MultipartFile file, String tags,
            String userEmail) {


            if (title == null || title.trim().isEmpty()) {
                throw new IllegalArgumentException("Post title cannot be empty.");
            }
            if (title.length() > 100) { 
                throw new IllegalArgumentException("Post title cannot exceed 100 characters.");
            }
            if (content == null || content.trim().isEmpty()) {
                throw new IllegalArgumentException("Post content cannot be empty.");
            }
            if (content.length() > 10000) { 
                throw new IllegalArgumentException("Post content cannot exceed 10000 characters.");
            }

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to edit this post.");
        }

        post.setTitle(title);
        post.setContent(content);

        Set<Tag> tagSet = parseAndSaveTags(tags);
        post.setTags(tagSet);

        String mediaUrl = null;
        if (file != null && !file.isEmpty()) {
            mediaUrl = fileStorageService.storeFile(file, userEmail);
        }

        Post updatedPost = postRepository.save(post);
        return mapToDto(updatedPost, currentUser);
    }

    @Transactional
    public void deletePost(Long postId, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to delete this post.");
        }

        commentRepository.deleteAllByPost(post);
        likeRepository.deleteAllByPost(post);
        postRepository.delete(post);
    }

    private Set<Tag> parseAndSaveTags(String tagsString) {
        Set<Tag> tags = new HashSet<>();
        if (tagsString == null || tagsString.trim().isEmpty()) {
            return tags;
        }

        String[] tagNames = tagsString.split(",");

        if (tagNames.length > 4) {
            throw new IllegalArgumentException("You can add a maximum of 4 tags.");
        }

        for (String name : tagNames) {
            String trimmedName = name.trim().toLowerCase();
            if (trimmedName.isEmpty())
                continue;

            Tag tag = tagRepository.findByName(trimmedName).orElseGet(() -> {
                Tag newTag = new Tag();
                newTag.setName(trimmedName);
                return tagRepository.save(newTag);
            });
            tags.add(tag);
        }
        return tags;
    }

    @Transactional(readOnly = true)
    public List<TrendingPostDto> getTrendingPosts(int limit) {
        return postRepository.findTrendingPosts(limit).stream()
                .map(post -> {
                    TrendingPostDto dto = new TrendingPostDto();
                    dto.setId(post.getId());
                    dto.setTitle(post.getTitle());
                    Set<TagDto> tagDtos = post.getTags().stream().map(tag -> {
                        TagDto tagDto = new TagDto();
                        tagDto.setId(tag.getId());
                        tagDto.setName(tag.getName());
                        return tagDto;
                    }).collect(Collectors.toSet());
                    dto.setTags(tagDtos);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public PostResponseDto mapToDto(Post post, User currentUser) {
        PostResponseDto dto = new PostResponseDto();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setMediaUrl(post.getMediaUrl());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setStatus(post.getStatus());

        AuthorDto authorDto = new AuthorDto();
        authorDto.setId(post.getAuthor().getId());
        authorDto.setUsername(post.getAuthor().getOriginalUsername());
        authorDto.setAvatarUrl(post.getAuthor().getAvatarUrl());
        dto.setAuthor(authorDto);

        dto.setLikeCount(likeRepository.countByPost(post));
        dto.setCommentCount(commentRepository.countByPost(post));

        boolean isLiked = (currentUser != null) && likeRepository.findByPostAndUser(post, currentUser).isPresent();
        dto.setLikedByCurrentUser(isLiked);

        // Convert Tag entities to TagDto objects
        Set<TagDto> tagDtos = post.getTags().stream().map(tag -> {
            TagDto tagDto = new TagDto();
            tagDto.setId(tag.getId());
            tagDto.setName(tag.getName());
            return tagDto;
        }).collect(Collectors.toSet());
        dto.setTags(tagDtos);


        return dto;
    }
}