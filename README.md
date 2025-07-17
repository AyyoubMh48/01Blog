# 01Blog

/01blog/
│
├── backend/
│   ├── src/main/java/com/yourdomain/blog/  # Your Java source code
│   │   ├── controller/                     # REST APIs (e.g., PostController)
│   │   ├── model/                          # Data entities (e.g., User, Post)
│   │   ├── repository/                     # Database interaction (JPA)
│   │   ├── service/                        # Business logic (e.g., PostService)
│   │   ├── security/                       # JWT, WebSecurityConfig
│   │   └── O1blogApplication.java          # Main Spring Boot application file
│   │
│   ├── src/main/resources/
│   │   └── application.properties          # Database, server config
│   │
│   └── pom.xml                             # Backend dependencies (Maven)
│
├── frontend/                               # Your Angular application (already exists)
│   ├── src/
│   │   ├── app/                            # Your Angular components and services
│   │   ├── assets/                         # Images, icons, etc.
│   │   └── ...
│   └── ...
│
├── .gitignore                              # Main gitignore for the whole project
│
└── README.md                               # Project documentation
