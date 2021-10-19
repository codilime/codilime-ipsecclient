pipeline {
    agent none

    stages {
        stage('test') {
            agent any
            steps {
                sh '''
                ss -tulpn | grep LISTEN
                cd test
                ./test.sh
                '''
            }
        }
    }
}
