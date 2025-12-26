# Run Stage
FROM eclipse-temurin:17-jdk-jammy
# Install Python and dependencies
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*
RUN pip3 install --no-cache-dir scikit-learn pandas numpy xgboost

WORKDIR /app
COPY target/*.jar app.jar
COPY src/main/resources/python /app/python

ENTRYPOINT ["java", "-jar", "app.jar"]
