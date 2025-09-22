package com._blog.backend.repository;

import com._blog.backend.entity.Report;
import com._blog.backend.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    // finds reports by status 
    List<Report> findAllByStatus(ReportStatus status);
}