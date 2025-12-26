pipeline {
    agent any
    
    tools {
        // Assure-toi que le nom 'MAVEN_HOME' correspond au nom 
        // configuré dans "Administrer Jenkins" -> "Tools"
        maven 'MAVEN_HOME'
    }

    stages {
        stage('Initialisation') {
            steps {
                echo 'Démarrage de l\'analyse pour DataPredict...'
            }
        }

        stage('Analyse Qualité (SonarQube)') {
            steps {
                // Utilisation de 'sh' au lieu de 'bat' pour Linux
                sh 'mvn clean verify org.sonarsource.scanner.maven:sonar-maven-plugin:3.10.0.2594:sonar "-Dsonar.token=sqp_2741a19aec932f571304d6a9f2096557c0f2d3a7" -DskipTests'
            }
        }
    }

    post {
        success {
            echo 'Analyse terminée avec succès !'
        }
        failure {
            echo 'Le pipeline a échoué. Vérifiez les logs ci-dessus.'
        }
    }
}