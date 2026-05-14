FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copy parent pom first for better layer caching
COPY pom.xml ./pom.xml
COPY monolith-service/pom.xml ./monolith-service/pom.xml
# Download dependencies (cached layer)
RUN mvn dependency:go-offline -pl monolith-service -am -q || true
# Copy source and build
COPY monolith-service/src ./monolith-service/src
RUN mvn clean package -pl monolith-service -am -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/monolith-service/target/*.jar app.jar
EXPOSE 8080

# Activate PostgreSQL profile when DB_URL is set to a postgres URL
ENTRYPOINT ["sh", "-c", \
  "if echo \"$DB_URL\" | grep -q postgresql; \
   then java -Dspring.profiles.active=postgresql -jar app.jar; \
   else java -jar app.jar; \
   fi"]
