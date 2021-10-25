pipeline {
    agent none

    stages {
        stage('test') {
            agent {label 'sico-node'}
            steps {
                sh '''
                cd test
                ./test.sh
                '''
            }
        }
    }
}
