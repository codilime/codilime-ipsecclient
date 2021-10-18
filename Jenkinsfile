pipeline {
    agent none

    stages {
        stage('test') {
            agent any
            steps {
                sh '''
                cat /etc/os-release
                '''
            }
        }
    }
}
