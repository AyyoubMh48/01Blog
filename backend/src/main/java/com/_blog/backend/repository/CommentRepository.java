package com._blog.backend.repository;

import com._blog.backend.entity.Comment;
import com._blog.backend.entity.Post;
import com._blog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // posts from oldest to newest
    //List<Comment> findAllByPostOrderByCreatedAtAsc(Post post);

    //posts from  newest to oldest
    List<Comment> findAllByPostOrderByCreatedAtDesc(Post post);

    void deleteAllByAuthor(User author);
    void deleteAllByPost(Post post);
    long countByPost(Post post);
}