package com._blog.backend.service;

import com._blog.backend.entity.Report;
import com._blog.backend.entity.ReportStatus;
import com._blog.backend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private ReportRepository reportRepository;

    public List<Report> getOpenReports() {
        return reportRepository.findAllByStatus(ReportStatus.OPEN);
    }
}