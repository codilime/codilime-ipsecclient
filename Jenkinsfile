/*
 *  Copyright (c) 2021 Cisco and/or its affiliates
 *
 *  This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *  available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

pipeline {
    agent {label 'sico-node'}
    stages {
        stage('Run CSR-VM and build') {
            steps {
                sh 'python3 -u build.py --clean --ut --csr-vm /home/jenkins/csr-vm/csr1000v-universalk9.17.03.03-serial.qcow2 /home/jenkins/csr-vm/csr_config.iso'
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
                        rm -f out/*
                        python3 -u build.py --pack /home/jenkins/credentials/credentials.json
                    '''
                    archiveArtifacts 'out/*.tar.gz'
                }
            }
        }
    }
}
