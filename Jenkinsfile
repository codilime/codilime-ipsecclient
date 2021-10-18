pipeline {
    agent none

    stages {
        stage('test') {
            agent any
            steps {
                sh '''
                cd test
                ./test.sh
                '''
            }
        }
    }
}
