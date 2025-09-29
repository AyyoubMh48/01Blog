# 01Blog - Full-Stack Social Blogging Platform

01Blog is a complete social blogging platform built from the ground up, designed for users to share content, interact with each other, and build a community. This project features a secure, token-based REST API backend built with **Java Spring Boot** and a dynamic, responsive Single Page Application (SPA) frontend built with **Angular**.

## Features

* **User Authentication:** Secure user registration and login using JWTs.
* **Content Management:** Users can create, read, and delete posts with text and image uploads.
* **Social Interaction:**
    * Follow/Unfollow other users.
    * A personalized feed showing posts from followed users.
    * Like/Unlike posts.
    * Add and view comments on posts.
* **Media Handling:** Image uploads are handled by a cloud service (**Cloudinary**).
* **Admin & Moderation:**
    * Role-based access control (`ROLE_USER` vs. `ROLE_ADMIN`).
    * A protected admin dashboard to view all users and reports.
    * Admin actions to ban users, delete posts, and resolve user reports.
* **Notifications:** Users receive notifications for new follows, likes, and comments.

## Tech Stack

* **Backend:** Java 21, Spring Boot 3, Spring Security, Spring Data JPA, JWT, Maven
* **Frontend:** Angular 17+, TypeScript, RxJS
* **Database:** PostgreSQL (running in Docker)
* **Infrastructure:** Docker, Docker Compose
* **Cloud Services:** Cloudinary for media storage

## Getting Started

### Prerequisites

* Java JDK 21 or later
* Maven 3.8+
* Node.js 18+ and npm
* Angular CLI
* Docker and Docker Compose

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-github-repo-url>
    cd <your-project-folder>
    ```

2.  **Backend Setup:**
    * Navigate to the `backend` folder.
    * Create a `src/main/resources/application.properties` file from the `application.properties.example` template.
    * Fill in your PostgreSQL and Cloudinary credentials in `application.properties`.

3.  **Frontend Setup:**
    * Navigate to the `frontend` folder.
    * Install npm packages:
        ```bash
        npm install
        ```

### Running the Application

1.  **Start the Database:**
    * Navigate to the folder containing your `docker-compose.yml` file.
    * Run the command:
        ```bash
        docker-compose up -d
        ```

2.  **Start the Backend:**
    * Open the `backend` project in your IDE.
    * Run the main `BackendApplication.java` file.
    * The server will start on `http://localhost:8080`.

3.  **Start the Frontend:**
    * Navigate to the `frontend` folder in a new terminal.
    * Run the command:
        ```bash
        ng serve
        ```
    * Open your browser and go to `http://localhost:4200`.