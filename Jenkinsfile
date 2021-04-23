pipeline {
    agent {
        docker {
            image 'golang'
            args '-u root:root'   
        }
    }
    stages {
        stage('Build') {
            steps {
                dir("${env.WORKSPACE}/ipsec-backend"){
                    sh 'go build'
                }
            }
        }
    }
}
