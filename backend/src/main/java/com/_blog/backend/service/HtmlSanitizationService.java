package com._blog.backend.service;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.stereotype.Service;

@Service
public class HtmlSanitizationService {

    private final PolicyFactory policy;

    public HtmlSanitizationService() {

        this.policy = new HtmlPolicyBuilder()
                // Text formatting
                .allowElements("p", "br", "strong", "em", "u", "s", "span", "div")
                // Headings
                .allowElements("h1", "h2", "h3", "h4", "h5", "h6")
                // Lists
                .allowElements("ul", "ol", "li")
                // Links with protocols
                .allowElements("a")
                .allowAttributes("href").onElements("a")
                .allowUrlProtocols("http", "https")
                .requireRelNofollowOnLinks()
                // Images - allow Cloudinary URLs
                .allowElements("img")
                .allowAttributes("src", "alt", "width", "height", "style").onElements("img")
                // Videos - IMPORTANT for Cloudinary videos
                .allowElements("video")
                .allowAttributes("src", "controls", "width", "height", "style", "autoplay", "loop", "muted").onElements("video")
                // Code blocks
                .allowElements("code", "pre", "blockquote")
                // Tables
                .allowElements("table", "thead", "tbody", "tr", "th", "td")
                // Quill editor classes
                .allowAttributes("class").globally()
                .toFactory();
    }


    public String sanitize(String html) {
        if (html == null || html.isEmpty()) {
            return html;
        }
        return policy.sanitize(html);
    }


    public String escapeHtml(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#x27;")
                   .replace("/", "&#x2F;");
    }
}
