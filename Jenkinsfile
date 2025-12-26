pipeline {
    agent any

    environment {
        // On définit le token ici pour plus de clarté
        SONAR_TOKEN = 'sqp_2741a19aec932f571304d6a9f2096557c0f2d3a7'
    }

    stages {
        stage('Nettoyage et Initialisation') {
            steps {
                echo 'Début du pipeline pour DataPredict...'
            }
        }

        stage('Analyse Qualité (SonarQube)') {
            steps {
                script {
                    // On utilise la commande exacte qui a fonctionné manuellement
                    bat "mvn clean verify org.sonarsource.scanner.maven:sonar-maven-plugin:3.10.0.2594:sonar -Dsonar.token=${SONAR_TOKEN} -DskipTests"
                }
            }
        }
    }

    post {
        success {
            echo 'Félicitations ! L\'analyse SonarQube a été générée par Jenkins.'
        }
        failure {
            echo 'Le pipeline a échoué. Vérifiez les logs Maven ci-dessus.'
        }
    }
}