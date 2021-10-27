pipeline {
    agent {label 'sico-node'}
    stages {
        stage('Run csr-vm and build') {
            steps {
                sh 'python3 -u run_vm_and_build.py /home/jenkins/csr-vm/csr1000v-universalk9.17.03.03-serial.qcow2 /home/jenkins/csr-vm/csr_config.iso'
            }
        }
        stage('Run e2e tests') {
            steps {
                sh 'python3 -u run_e2e_tests.py'
            }
        }
    }
}
