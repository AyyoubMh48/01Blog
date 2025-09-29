package com._blog.backend.service;

import com._blog.backend.dto.UserDto;
import com._blog.backend.dto.AuthorDto;
import com._blog.backend.dto.ReportResponseDto;
import com._blog.backend.entity.Report;
import com._blog.backend.entity.ReportStatus;
import com._blog.backend.entity.User;
import com._blog.backend.repository.ReportRepository;
import com._blog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ReportResponseDto> getOpenReports() {
        return reportRepository.findAllByStatus(ReportStatus.OPEN)
                .stream()
                .map(this::mapToReportDto) // Convert each report to a DTO
                .collect(Collectors.toList());
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        user.setBanned(true);
        userRepository.save(user);
    }

    private UserDto mapToUserDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setUsername(user.getOriginalUsername());
        userDto.setEmail(user.getEmail());
        userDto.setRole(user.getRole());
        userDto.setBanned(user.isBanned());
        return userDto;
    }

    private ReportResponseDto mapToReportDto(Report report) {
        ReportResponseDto dto = new ReportResponseDto();
        dto.setId(report.getId());
        dto.setReason(report.getReason());
        dto.setStatus(report.getStatus());
        dto.setCreatedAt(report.getCreatedAt());

        AuthorDto reporterDto = new AuthorDto();
        reporterDto.setId(report.getReporter().getId());
        reporterDto.setUsername(report.getReporter().getOriginalUsername());
        dto.setReporter(reporterDto);

        AuthorDto reportedUserDto = new AuthorDto();
        reportedUserDto.setId(report.getReportedUser().getId());
        reportedUserDto.setUsername(report.getReportedUser().getOriginalUsername());
        dto.setReportedUser(reportedUserDto);

        return dto;
    }
}