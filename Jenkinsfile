pipeline {
    agent none

    stages {
        stage('Build frontend') {
            agent any
            steps {
                dir("${env.WORKSPACE}/ipsec-ui"){
                    script {
                        def customImage = docker.build("my-image:${env.BUILD_ID}")
                    }
                }
            }
        }
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
