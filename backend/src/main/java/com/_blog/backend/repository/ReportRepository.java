package com._blog.backend.repository;

import com._blog.backend.entity.Report;
import com._blog.backend.entity.ReportStatus;
import com._blog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    // finds reports by status 
    List<Report> findAllByStatus(ReportStatus status);

    @Modifying
    @Query("DELETE FROM Report r WHERE r.reporter = :user OR r.reportedUser = :user")
    void deleteAllByUser(@Param("user") User user);
}