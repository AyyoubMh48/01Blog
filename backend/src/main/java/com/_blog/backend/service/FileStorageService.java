package com._blog.backend.service;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

@Service
public class FileStorageService {

    @Autowired
    private Cloudinary cloudinary;

    public String storeFile(MultipartFile file) {
        try {
            // Upload the file to Cloudinary
            Map<String, Object> options = new HashMap<>();
            options.put("folder", "01blog_uploads"); // Optional: organize uploads in a folder

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

            // Get the secure URL of the uploaded file
            return (String) result.get("secure_url");

        } catch (IOException e) {
            throw new RuntimeException("Could not store file. Please try again!", e);
        }
    }
}