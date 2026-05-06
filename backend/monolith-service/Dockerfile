FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -pl monolith-service -am -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/monolith-service/target/*.jar app.jar
EXPOSE 8080

# Auto-activate PostgreSQL profile if DB_URL contains postgresql
ENTRYPOINT ["sh", "-c", "if echo $DB_URL | grep -q postgresql; then java -jar -Dspring.profiles.active=postgresql app.jar; else java -jar app.jar; fi"]
