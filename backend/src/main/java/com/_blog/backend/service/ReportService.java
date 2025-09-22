package com._blog.backend.service;

import com._blog.backend.dto.ReportRequestDto;
import com._blog.backend.entity.Report;
import com._blog.backend.entity.User;
import com._blog.backend.exception.SubscriptionException;
import com._blog.backend.repository.ReportRepository;
import com._blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void createReport(String reporterEmail, Long reportedUserId, ReportRequestDto reportDto) {
        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Reporter not found"));
        User reportedUser = userRepository.findById(reportedUserId)
                .orElseThrow(() -> new UsernameNotFoundException("Reported user not found"));

        if (reporter.getId().equals(reportedUser.getId())) {
            throw new SubscriptionException("You cannot report yourself.");
        }

        Report report = new Report();
        report.setReason(reportDto.getReason());
        report.setReporter(reporter);
        report.setReportedUser(reportedUser);

        reportRepository.save(report);
    }
}