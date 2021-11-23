pipeline {
    agent {label 'sico-node'}
    stages {
        stage('Run CSR-VM and build') {
            steps {
                echo 'Pulling...' + env.BRANCH
            }
        }
        // stage('Run CSR-VM and build') {
        //     steps {
        //         sh 'python3 -u build.py --pack --csr-vm /home/jenkins/csr-vm/csr1000v-universalk9.17.03.03-serial.qcow2 /home/jenkins/csr-vm/csr_config.iso --clean'
        //     }
        // }
        // stage('Run unit tests') {
        //     steps {
        //         sh './run_api_ut.sh'
        //     }
        // }
        // stage('Run e2e tests') {
        //     steps {
        //         sh 'python3 -u run_e2e_tests.py --csr-vm'
        //     }
        // }
    }
    post {
        success {
            script {
                if (env.BRANCH == 'null')
                {
                    archiveArtifacts 'out/*.tar.gz'
                }
            }
        }
    }
}
