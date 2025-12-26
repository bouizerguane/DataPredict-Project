# Build Stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -Dmaven.test.skip=true -U -Dhttp.keepAlive=false -Dmaven.wagon.http.pool=false -Dmaven.wagon.http.retryHandler.count=3

# Run Stage
FROM eclipse-temurin:17-jre
WORKDIR /app
# Install Python and dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*
RUN ln -s /usr/bin/python3 /usr/bin/python || true
RUN pip3 install --no-cache-dir pandas nltk --break-system-packages

COPY --from=build /app/target/*.jar app.jar
COPY text_tokenizer.py .

EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
