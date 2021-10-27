pipeline {
    agent {label 'sico-node'}
    stages {
        stage('Run e2e tests') {
            steps {
                sh 'python3 -u run_e2e_tests.py'
            }
        }
    }
}
