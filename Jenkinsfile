pipeline {
    agent {label 'sico-node'}
    stages {
        stage('Run CSR-VM and build') {
            steps {
                sh 'python3 -u build.py --csr-vm /home/jenkins/csr-vm/csr1000v-universalk9.17.03.03-serial.qcow2 /home/jenkins/csr-vm/csr_config.iso --clean'
            }
        }
        stage('Run unit tests') {
            steps {
                sh './run_api_ut.sh'
            }
        }
        stage('Run e2e tests') {
            steps {
                sh 'python3 -u run_e2e_tests.py --csr-vm'
            }
        }
        stage('Stop CSR-VM') {
            steps {
                sh 'virsh -c qemu:///system destroy csr_vm; virsh -c qemu:///system undefine csr_vm'
            }
        }
    }
    post {
        success {
            script {
                if (env.BRANCH == null) // null = master
                {
                    sh '''
                        rm out/*
                        python3 -u build.py --pack
                    '''
                    archiveArtifacts 'out/*.tar.gz'
                }
            }
        }
    }
}
