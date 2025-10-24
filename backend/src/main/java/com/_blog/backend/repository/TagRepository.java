package com._blog.backend.repository;

import com._blog.backend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByName(String name);

    // to find the top N tags by usage count
    @Query("SELECT t FROM Tag t JOIN Post p ON t MEMBER OF p.tags GROUP BY t ORDER BY COUNT(p) DESC LIMIT :limit")
    List<Tag> findPopularTags(int limit);
}