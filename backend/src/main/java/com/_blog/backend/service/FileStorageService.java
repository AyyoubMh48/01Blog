package com._blog.backend.service;

import com._blog.backend.entity.Media;
import com._blog.backend.entity.User;
import com._blog.backend.repository.UserRepository;
import com._blog.backend.repository.MediaRepository;
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
    @Autowired
    private MediaRepository mediaRepository;


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
            String url = (String) result.get("secure_url");
            String publicId = (String) result.get("public_id");

            Media media = new Media();
            media.setPublicId(publicId);
            media.setUrl(url);
            media.setUploader(uploader);
            mediaRepository.save(media);

            return url;

        } catch (IOException e) {
            throw new RuntimeException("Could not store file. Please try again!", e);
        }
    }

    public void deleteFile(String publicId) {
        try {
            System.out.println("Attempting to delete Cloudinary file with public_id: " + publicId); // Debug log
            Map<?,?> result = cloudinary.uploader().destroy(publicId, Map.of());
             System.out.println("Cloudinary delete result: " + result.toString()); // Debug log
        } catch (IOException e) {
             System.err.println("Error deleting file from Cloudinary: " + publicId + ", Error: " + e.getMessage()); // Log error
        }
    }
}