Spring Boot minimal login backend

How to build & run:

Requirements: Java 17+, Maven

Build:

mvn -f Backend/springboot clean package

Run:

java -jar Backend/springboot/target/login-backend-0.0.1-SNAPSHOT.jar

The server listens on port 3000 and exposes POST /api/login which returns plain text 'ok' when username and password are present.
