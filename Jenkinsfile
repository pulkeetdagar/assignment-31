pipeline {
    agent any
    stages {
        stage('Build Docker Images') {
            steps {
                sh 'docker-compose -f docker-compose.jenkins.yml build'
            }
        }
        stage('Run Containers') {
            steps {
                sh 'docker-compose -f docker-compose.jenkins.yml up -d'
            }
        }
    }
}
