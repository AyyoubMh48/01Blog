package com._blog.backend.service;

import com._blog.backend.dto.UserDto;
import com._blog.backend.dto.AdminAnalyticsDto;
import com._blog.backend.dto.AuthorDto;
import com._blog.backend.dto.PostResponseDto;
import com._blog.backend.dto.ReportResponseDto;
import com._blog.backend.entity.Post;
import com._blog.backend.entity.PostStatus;
import com._blog.backend.entity.Report;
import com._blog.backend.entity.ReportStatus;
import com._blog.backend.entity.User;
import com._blog.backend.exception.ResourceNotFoundException;
import com._blog.backend.repository.CommentRepository;
import com._blog.backend.repository.LikeRepository;
import com._blog.backend.repository.MediaRepository;
import com._blog.backend.repository.NotificationRepository;
import com._blog.backend.repository.PostRepository;
import com._blog.backend.repository.ReportRepository;
import com._blog.backend.repository.SubscriptionRepository;
import com._blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com._blog.backend.entity.Media;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;
    @Autowired
    private LikeRepository likeRepository;
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostService postService;

    @Autowired
    private SubscriptionRepository subscriptionRepository;
    @Autowired
    private MediaRepository mediaRepository;
    @Autowired
    private FileStorageService fileStorageService;
    @Autowired
    private NotificationRepository notificationRepository;

    public List<ReportResponseDto> getOpenReports() {
        return reportRepository.findAllByStatusOrderByCreatedAtDesc(ReportStatus.OPEN)
                .stream()
                .map(this::mapToReportDto) // Convert each report to a DTO
                .collect(Collectors.toList());
    }

    public List<UserDto> getAllUsers() {
        // Get all users ordered by newest first (by ID descending)
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponseDto> getAllPosts() {
        // Get all posts ordered by newest first
        return postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(post -> postService.mapToDto(post, null))
                .toList();
    }

    @Transactional
    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        user.setBanned(true);
        userRepository.save(user);
    }

    @Transactional
    public void unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        user.setBanned(false);
        userRepository.save(user);
    }

    @Transactional
    public void deletePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // First, delete all associated likes and comments
        commentRepository.deleteAllByPost(post);
        likeRepository.deleteAllByPost(post);

        // Finally, delete the post itself
        postRepository.delete(post);
    }

    @Transactional
    public void hidePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        post.setStatus(PostStatus.HIDDEN_BY_ADMIN);
        postRepository.save(post);
    }

    // to re-publish a post
    @Transactional
    public void publishPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        post.setStatus(PostStatus.PUBLISHED);
        postRepository.save(post);
    }

    @Transactional
    public void resolveReport(Long reportId, String action) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if ("RESOLVE".equalsIgnoreCase(action)) {
            report.setStatus(ReportStatus.RESOLVED);
        } else if ("IGNORE".equalsIgnoreCase(action)) {
            report.setStatus(ReportStatus.IGNORED);
        } else {
            throw new IllegalArgumentException("Invalid action: " + action);
        }
        reportRepository.save(report);
    }

    public AdminAnalyticsDto getAnalytics() {
        AdminAnalyticsDto analytics = new AdminAnalyticsDto();
        analytics.setTotalUsers(userRepository.count());
        analytics.setTotalPosts(postRepository.count());
        analytics.setOpenReports(reportRepository.findAllByStatus(ReportStatus.OPEN).size());
        return analytics;
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if ("ROLE_ADMIN".equals(user.getRole())) {
            throw new AccessDeniedException("Cannot delete an administrator account.");
        }


        // Delete media files from Cloudinary and DB
        List<Media> userMedia = mediaRepository.findAllByUploader(user);
        for (Media media : userMedia) {
            try {
                fileStorageService.deleteFile(media.getPublicId());
            } catch (Exception e) {
                System.err.println("Error deleting Cloudinary file " + media.getPublicId() + ": " + e.getMessage());
            }
        }
        mediaRepository.deleteAll(userMedia); 

        List<Post> userPosts = postRepository.findAllByAuthor(user);
        for (Post post : userPosts) {
            commentRepository.deleteAllByPost(post);
            likeRepository.deleteAllByPost(post);
        }
        postRepository.deleteAll(userPosts);

        commentRepository.deleteAllByAuthor(user);

        likeRepository.deleteAllByUser(user);

        subscriptionRepository.deleteAllByUser(user); 

        reportRepository.deleteAllByUser(user);

        notificationRepository.deleteAllByRecipient(user);

        userRepository.delete(user);
    }

    private UserDto mapToUserDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setUsername(user.getOriginalUsername());
        userDto.setEmail(user.getEmail());
        userDto.setRole(user.getRole());
        userDto.setBanned(user.isBanned());
        return userDto;
    }

    private ReportResponseDto mapToReportDto(Report report) {
        ReportResponseDto dto = new ReportResponseDto();
        dto.setId(report.getId());
        dto.setReason(report.getReason());
        dto.setStatus(report.getStatus());
        dto.setCreatedAt(report.getCreatedAt());

        AuthorDto reporterDto = new AuthorDto();
        reporterDto.setId(report.getReporter().getId());
        reporterDto.setUsername(report.getReporter().getOriginalUsername());
        dto.setReporter(reporterDto);

        AuthorDto reportedUserDto = new AuthorDto();
        reportedUserDto.setId(report.getReportedUser().getId());
        reportedUserDto.setUsername(report.getReportedUser().getOriginalUsername());
        dto.setReportedUser(reportedUserDto);

        return dto;
    }
}