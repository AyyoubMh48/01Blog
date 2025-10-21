package com._blog.backend.repository;

import com._blog.backend.entity.Notification;
import com._blog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Finds all notifications for a given user, ordered from newest to oldest
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    void deleteAllByRecipient(User recipient);
}