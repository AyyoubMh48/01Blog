package com._blog.backend.repository;

import com._blog.backend.entity.Post;
import com._blog.backend.entity.PostStatus; 
import com._blog.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    void deleteAllByAuthor(User author);
    
    Page<Post> findAllByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);

    List<Post> findAllByAuthor(User author);
    
    // Find all posts by author ordered by newest first (for profile/block page)
    List<Post> findAllByAuthorOrderByCreatedAtDesc(User author);

    Page<Post> findAllByAuthorAndStatusOrderByCreatedAtDesc(User author, PostStatus status, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.author IN :authors AND p.status = :status ORDER BY p.createdAt DESC")
    List<Post> findByAuthorInAndStatusWithAuthor(List<User> authors, PostStatus status);

    Page<Post> findByAuthorInAndStatusOrderByCreatedAtDesc(List<User> authors, PostStatus status, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.status = :status ORDER BY p.createdAt DESC")
    List<Post> findAllByStatusWithAuthor(PostStatus status, Pageable pageable);

    Page<Post> findAllByStatusOrderByCreatedAtDesc(PostStatus status, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN FETCH p.author JOIN p.tags t WHERE LOWER(t.name) = LOWER(:tagName) AND p.status = :status ORDER BY p.createdAt DESC")
    List<Post> findByTagNameAndStatusWithAuthor(String tagName, PostStatus status, Pageable pageable);

    Page<Post> findByTags_NameIgnoreCaseAndStatusOrderByCreatedAtDesc(String tagName, PostStatus status, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN FETCH p.author LEFT JOIN FETCH p.tags WHERE p.status = 'PUBLISHED' ORDER BY SIZE(p.likes) DESC")
    List<Post> findTrendingPostsWithAuthor();

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' ORDER BY SIZE(p.likes) DESC")
    List<Post> findTrendingPosts();
}