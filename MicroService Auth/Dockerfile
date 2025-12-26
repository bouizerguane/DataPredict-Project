# Build Stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Custom maven settings for slow connection
RUN mvn dependency:go-offline -B \
    -Dmaven.wagon.http.retryHandler.class=standard \
    -Dmaven.wagon.http.retryHandler.requestSentEnabled=true \
    -Dmaven.wagon.http.retryHandler.count=5 \
    -Dhttp.socketTimeout=300000 \
    -Dhttp.connectionTimeout=300000

COPY src ./src
RUN mvn clean package -Dmaven.test.skip=true


# Run Stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
