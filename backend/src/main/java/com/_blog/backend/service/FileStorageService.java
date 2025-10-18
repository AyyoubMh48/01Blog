package com._blog.backend.service;

import com._blog.backend.repository.MediaRepository;
import com._blog.backend.entity.User;
import com._blog.backend.repository.UserRepository;
import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

@Service
public class FileStorageService {

    @Autowired
    private Cloudinary cloudinary;

   
    @Autowired
    private UserRepository userRepository;


    public String storeFile(MultipartFile file, String uploaderEmail) {

        User uploader = userRepository.findByEmail(uploaderEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Uploader not found"));

        String contentType = file.getContentType();

        if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
            throw new RuntimeException("Invalid file type. Only images and videos are allowed.");
        }

        try {
            Map<String, Object> options = new HashMap<>();
            options.put("folder", "01blog_uploads"); 

            if (contentType.startsWith("video/")) {
                options.put("resource_type", "video");
            } else {
                options.put("resource_type", "image");
            }

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

            return (String) result.get("secure_url");

        } catch (IOException e) {
            throw new RuntimeException("Could not store file. Please try again!", e);
        }
    }
}