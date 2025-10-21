package com._blog.backend.repository;

import com._blog.backend.entity.Media;
import com._blog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {
    Optional<Media> findByPublicId(String publicId);
    List<Media> findAllByUploader(User uploader);
    
}