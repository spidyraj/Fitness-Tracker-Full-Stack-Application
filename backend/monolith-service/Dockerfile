FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy POMs first for better layer caching (deps won't re-download on source changes)
COPY pom.xml ./pom.xml
COPY monolith-service/pom.xml ./monolith-service/pom.xml

# Pre-download all dependencies (cached layer — only invalidated when pom.xml changes)
RUN mvn dependency:go-offline -pl monolith-service -am -q 2>/dev/null || true

# Copy source and build
COPY monolith-service/src ./monolith-service/src
RUN mvn clean package -pl monolith-service -am -DskipTests -q

# ─── Runtime image (slim JRE) ─────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/monolith-service/target/*.jar app.jar

EXPOSE 8080

# Profile selection: if DB_URL contains 'postgresql', activate the postgresql profile
# Otherwise start with H2 defaults (local dev / CI)
ENTRYPOINT ["sh", "-c", "if echo \"${DB_URL:-}\" | grep -q 'postgresql'; then exec java -Dspring.profiles.active=postgresql -jar app.jar; else exec java -jar app.jar; fi"]
