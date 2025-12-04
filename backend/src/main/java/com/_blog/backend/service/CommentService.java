package com._blog.backend.service;

import com._blog.backend.dto.AuthorDto;
import com._blog.backend.dto.CommentRequestDto;
import com._blog.backend.dto.CommentResponseDto;
import com._blog.backend.entity.Comment;
import com._blog.backend.entity.Post;
import com._blog.backend.entity.User;
import com._blog.backend.repository.CommentRepository;
import com._blog.backend.repository.PostRepository;
import com._blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private HtmlSanitizationService htmlSanitizationService;

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public CommentResponseDto addComment(Long postId, CommentRequestDto commentDto, String userEmail) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Sanitize comment content to prevent XSS
        String sanitizedContent = htmlSanitizationService.escapeHtml(commentDto.getContent());

        Comment newComment = new Comment();
        newComment.setContent(sanitizedContent);
        newComment.setPost(post);
        newComment.setAuthor(author);
        
        Comment savedComment = commentRepository.save(newComment);
        
         String message = author.getOriginalUsername() + " commented on your post.";
        notificationService.createNotification(author ,post.getAuthor(), message, "/post/" + post.getId());

        return mapToDto(savedComment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponseDto> getCommentsForPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        return commentRepository.findAllByPostOrderByCreatedAtDesc(post)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId, String userEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        // Check if user is the comment author or an admin
        boolean isAuthor = comment.getAuthor().getId().equals(user.getId());
        boolean isAdmin = "ROLE_ADMIN".equals(user.getRole());
        
        if (!isAuthor && !isAdmin) {
            throw new RuntimeException("You are not authorized to delete this comment");
        }
        
        commentRepository.delete(comment);
    }

    private CommentResponseDto mapToDto(Comment comment) {
        CommentResponseDto dto = new CommentResponseDto();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        
        AuthorDto authorDto = new AuthorDto();
        authorDto.setId(comment.getAuthor().getId());
        authorDto.setUsername(comment.getAuthor().getOriginalUsername());
        authorDto.setAvatarUrl(comment.getAuthor().getAvatarUrl());
        dto.setAuthor(authorDto);
        
        return dto;
    }
}