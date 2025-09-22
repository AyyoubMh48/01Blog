package com._blog.backend.repository;

import com._blog.backend.entity.Like;
import com._blog.backend.entity.Post;
import com._blog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    // Finds a specific like by a user on a post
    Optional<Like> findByPostAndUser(Post post, User user);

    // Efficiently counts the number of likes on a post
    long countByPost(Post post);
}