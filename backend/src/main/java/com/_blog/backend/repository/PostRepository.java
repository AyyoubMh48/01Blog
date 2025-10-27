package com._blog.backend.repository;

import com._blog.backend.entity.Post;
import com._blog.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByAuthor(User author);
    Page<Post> findByAuthorInOrderByCreatedAtDesc(List<User> authors, Pageable pageable);
    Page<Post> findAllByAuthorOrderByCreatedAtDesc(User author,Pageable pageable);
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    void deleteAllByAuthor(User author);
    Page<Post> findByTags_NameIgnoreCaseOrderByCreatedAtDesc(String tagName, Pageable pageable);
    @Query("SELECT p FROM Post p ORDER BY SIZE(p.likes) DESC LIMIT :limit")
    List<Post> findTrendingPosts(int limit);
}