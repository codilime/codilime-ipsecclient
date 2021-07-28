pipeline {
    agent none

    stages {
        stage('test') {
            agent any
            steps {
                dir("${env.WORKSPACE}"){
                    sh '''
                    cd test
                    ./test.sh
                    '''
                }
            }
        }
    }
}
