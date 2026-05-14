FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy POMs first for dependency caching
COPY pom.xml ./pom.xml
COPY monolith-service/pom.xml ./monolith-service/pom.xml

# Pre-download dependencies (cached layer)
RUN mvn dependency:go-offline -pl monolith-service -am -q 2>/dev/null || true

# Copy source and build JAR
COPY monolith-service/src ./monolith-service/src
RUN mvn clean package -pl monolith-service -am -DskipTests -q

# ─── Runtime image ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/monolith-service/target/*.jar app.jar
EXPOSE 8080

# Profile is set via Railway startCommand: java -Dspring.profiles.active=postgresql -jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
