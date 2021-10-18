pipeline {
    agent none

    stages {
        stage('test') {
            agent any
            steps {
                sh '''
                cat /etc/os-release
                docker build -t sico_api -f sico_api.dockerfile .
                ./run_api.sh
                '''
            }
        }
    }
}
