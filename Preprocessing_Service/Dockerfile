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
RUN mvn clean package -Dmaven.test.skip=true -o

# Run Stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Install Python for Preprocessing scripts
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Create symlink for python
RUN ln -s /usr/bin/python3 /usr/bin/python || true

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

COPY --from=build /app/target/*.jar app.jar
COPY src/main/resources/scripts ./scripts/

# Set env var for script path used by PreprocessingService
ENV APP_PYTHON_SCRIPT_PATH=scripts/

EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
