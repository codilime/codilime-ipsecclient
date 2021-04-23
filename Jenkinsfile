pipeline {
    agent { docker { image 'golang' } }
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
