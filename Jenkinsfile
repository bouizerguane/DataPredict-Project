pipeline {
    agent any
    
    tools {
        maven 'MAVEN_HOME'
    }

    stages {
        stage('Analyse Qualité (SonarQube)') {
            steps {
                sh 'mvn clean verify org.sonarsource.scanner.maven:sonar-maven-plugin:3.10.0.2594:sonar ' +
                   '-Dsonar.host.url=http://host.docker.internal:9000 ' +
                   '-Dsonar.token=sqp_2741a19aec932f571304d6a9f2096557c0f2d3a7 ' +
                   '-DskipTests'
            }
        }
    }
}