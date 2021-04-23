pipeline {
    agent none

    stages {
        stage('Build backend') {
            agent {
                docker {
                    image 'golang'
                    args '-u root:root'   
                }
            }
            steps {
                dir("${env.WORKSPACE}/ipsec-backend"){
                    sh 'go build'
                }
            }
        }
    }
}
