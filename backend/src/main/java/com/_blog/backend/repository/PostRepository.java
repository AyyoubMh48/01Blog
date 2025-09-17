package com._blog.backend.repository;

import com._blog.backend.entity.Post;
import com._blog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // Spring Data JPA automatically creates a query from this method name
    List<Post> findAllByAuthor(User author);
}