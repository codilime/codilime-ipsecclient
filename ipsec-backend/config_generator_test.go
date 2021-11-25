package main

import (
	"ipsec_backend/mock"
	"os"
	"testing"

	"github.com/golang/mock/gomock"
)

const (
	fileMode = os.FileMode(0644)

	strongswanConfigPath = "/opt/ipsec/conf/vrf2.conf"
	supervisorConfigPath = "/opt/super_net/vrf2.ini"
	frrConfigPath        = "/opt/frr/vtysh.conf"

	supervisorConfig = `[program:test vrf]
command=/usr/local/sbin/ipsec.sh
# todo: fix this
environment=PHYS_IF="test_interface", VRF_ID="2", XFRM_IP="0.0.0.1", XFRM_PEER="10.42.0.1", NAT="YES", VLANS_IPS="1000 11.11.0.0/30 2000 22.22.0.0/30 ", ENDPOINT_IDS="1", DISABLE_PEER_IPS="false"
redirect_stderr=true
stdout_logfile=/opt/logs/test vrf.log
#stdout_logfile_maxbytes = 0
`
	frrConfigCreate = `router bgp 3 vrf vrf-2
  no bgp ebgp-requires-policy
  neighbor 10.42.0.1 remote-as external
  address-family ipv4 unicast
    redistribute connected
  exit-address-family`
	frrConfigRemove = `no router bgp 3 vrf vrf-2
`

	localCert  = `local cert 123`
	remoteCert = `remote cert abc`
	privateKey = `private key 123`

	localCertPath  = "/opt/ipsec/x509/test vrf-0.0.0.1.pem"
	remoteCertPath = "/opt/ipsec/x509/test vrf-10.42.0.1.pem"
	privateKeyPath = "/opt/ipsec/rsa/test vrf-10.42.0.1.key.pem"
)

func TestGenerateTemplatePsk(t *testing.T) {
	vrfConf := []byte(`connections {

    test vrf_1 {
        remote_addrs = 192.168.0.1
        local {
            
                auth = psk
                id = 192.168.0.1
            
        }
        remote {
            
                auth = psk
                id = 192.168.0.1
            
        }
        children {
            site-cisco_1 {
                remote_ts = 0.0.0.0/0
                local_ts = 0.0.0.0/0
                if_id_in = 1
                if_id_out = 1
                esp_proposals = cast128-sha512-modp1024
                start_action = start
                updown=/usr/local/bin/status.sh test vrf-1-192.168.0.1
                copy_dscp = out
            }
        }
        version = 2
        proposals = aes128-sha256-modp2048
    }

}
secrets {

    ike-test vrf_1 {
        
            id = 192.168.0.1
            secret = psk23
        
    }

}
`)

	ctrl := gomock.NewController(t)
	fileHandler := mock.NewMockFileHandlerInterface(ctrl)
	supervisor := mock.NewMockSupervisorInterface(ctrl)

	fileHandler.
		EXPECT().
		WriteFile(gomock.Eq(strongswanConfigPath), gomock.Eq(vrfConf), gomock.Eq(fileMode)).
		Return(nil)
	fileHandler.
		EXPECT().
		WriteFile(gomock.Eq(supervisorConfigPath), gomock.Eq([]byte(supervisorConfig)), gomock.Eq(fileMode)).
		Return(nil)
	fileHandler.
		EXPECT().
		WriteFile(gomock.Eq(frrConfigPath), gomock.Eq([]byte(frrConfigCreate)), gomock.Eq(fileMode)).
		Return(nil)
	supervisor.EXPECT().ReloadVtysh().Return(nil)
	supervisor.EXPECT().ReloadSupervisor().Return(nil)
	supervisor.EXPECT().ReloadStrongswan().Return(nil)

	vrf := createTestVrf()
	vrf.CryptoPh1 = []byte(`["aes128","sha256","modp2048"]`)
	vrf.CryptoPh2 = []byte(`["cast128","sha512","modp1024"]`)
	vrf.Endpoints[0].Authentication.Type = "psk"

	generator := FileGenerator{fileHandler, supervisor}

	generator.GenerateConfigs(vrf)
}

func TestGenerateTemplateCert(t *testing.T) {
	vrfConf := []byte(`connections {

    test vrf_1 {
        remote_addrs = 192.168.0.1
        local {
            
                auth = pubkey
                certs = test vrf-0.0.0.1.pem
            
        }
        remote {
            
                auth = pubkey
                certs = test vrf-10.42.0.1.pem
            
        }
        children {
            site-cisco_1 {
                remote_ts = 0.0.0.0/0
                local_ts = 0.0.0.0/0
                if_id_in = 1
                if_id_out = 1
                esp_proposals = cast128-sha512-modp1024
                start_action = start
                updown=/usr/local/bin/status.sh test vrf-1-192.168.0.1
                copy_dscp = out
            }
        }
        version = 2
        proposals = aes128-sha256-modp2048
    }

}
secrets {

    ike-test vrf_1 {
        
            file = test vrf-10.42.0.1.key.pem
        
    }

}
`)

	ctrl := gomock.NewController(t)
	fileHandler := mock.NewMockFileHandlerInterface(ctrl)
	supervisor := mock.NewMockSupervisorInterface(ctrl)

	fileHandler.
		EXPECT().
		WriteFile(gomock.Eq(remoteCertPath), gomock.Eq([]byte(remoteCert)), gomock.Eq(fileMode)).
		Return(nil)
	fileHandler.
		EXPECT().
		WriteFile(gomock.Eq(localCertPath), gomock.Eq([]byte(localCert)), gomock.Eq(fileMode)).
		Return(nil)
	fileHandler.
		EXPECT().
		WriteFile(gomock.Eq(privateKeyPath), gomock.Eq([]byte(privateKey)), gomock.Eq(fileMode)).
		Return(nil)
	fileHandler.
		EXPECT().
		WriteFile(gomock.Eq(strongswanConfigPath), gomock.Eq(vrfConf), gomock.Eq(fileMode)).
		Return(nil)
	fileHandler.
		EXPECT().
		WriteFile(gomock.Eq(supervisorConfigPath), gomock.Eq([]byte(supervisorConfig)), gomock.Eq(fileMode)).
		Return(nil)
	fileHandler.
		EXPECT().
		WriteFile(gomock.Eq(frrConfigPath), gomock.Eq([]byte(frrConfigCreate)), gomock.Eq(fileMode)).
		Return(nil)
	supervisor.EXPECT().ReloadVtysh().Return(nil)
	supervisor.EXPECT().ReloadSupervisor().Return(nil)
	supervisor.EXPECT().ReloadStrongswan().Return(nil)

	vrf := createTestVrf()
	vrf.CryptoPh1 = []byte(`["aes128","sha256","modp2048"]`)
	vrf.CryptoPh2 = []byte(`["cast128","sha512","modp1024"]`)
	vrf.Endpoints[0].Authentication.Type = "certs"
	vrf.Endpoints[0].Authentication.LocalCert = localCert
	vrf.Endpoints[0].Authentication.RemoteCert = remoteCert
	vrf.Endpoints[0].Authentication.PrivateKey = privateKey

	generator := FileGenerator{fileHandler, supervisor}

	generator.GenerateConfigs(vrf)
}

func TestDeleteTemplateCert(t *testing.T) {
	ctrl := gomock.NewController(t)
	fileHandler := mock.NewMockFileHandlerInterface(ctrl)
	supervisor := mock.NewMockSupervisorInterface(ctrl)

	fileHandler.
		EXPECT().
		RemoveAll(gomock.Eq(strongswanConfigPath)).
		Return(nil)
	fileHandler.
		EXPECT().
		RemoveAll(gomock.Eq(supervisorConfigPath)).
		Return(nil)
	fileHandler.
		EXPECT().
		WriteFile(gomock.Eq(frrConfigPath), gomock.Eq([]byte(frrConfigRemove)), gomock.Eq(fileMode)).
		Return(nil)
	supervisor.EXPECT().ReloadVtysh().Return(nil)
	supervisor.EXPECT().ReloadStrongswan().Return(nil)
	supervisor.EXPECT().ReloadSupervisor().Return(nil)
	fileHandler.
		EXPECT().
		Remove(gomock.Eq(localCertPath)).
		Return(nil)
	fileHandler.
		EXPECT().
		Remove(gomock.Eq(remoteCertPath)).
		Return(nil)
	fileHandler.
		EXPECT().
		Remove(gomock.Eq(privateKeyPath)).
		Return(nil)

	vrf := createTestVrf()
	vrf.Endpoints[0].Authentication.Type = "certs"

	generator := FileGenerator{fileHandler, supervisor}

	generator.DeleteConfigs(vrf)
}

func TestDeleteTemplatePsk(t *testing.T) {
	ctrl := gomock.NewController(t)
	fileHandler := mock.NewMockFileHandlerInterface(ctrl)
	supervisor := mock.NewMockSupervisorInterface(ctrl)

	fileHandler.
		EXPECT().
		RemoveAll(gomock.Eq(strongswanConfigPath)).
		Return(nil)
	fileHandler.
		EXPECT().
		RemoveAll(gomock.Eq(supervisorConfigPath)).
		Return(nil)
	fileHandler.
		EXPECT().
		WriteFile(gomock.Eq(frrConfigPath), gomock.Eq([]byte(frrConfigRemove)), gomock.Eq(fileMode)).
		Return(nil)
	supervisor.EXPECT().ReloadVtysh().Return(nil)
	supervisor.EXPECT().ReloadStrongswan().Return(nil)
	supervisor.EXPECT().ReloadSupervisor().Return(nil)

	vrf := createTestVrf()
	vrf.Endpoints[0].Authentication.Type = "psk"

	generator := FileGenerator{fileHandler, supervisor}

	generator.DeleteConfigs(vrf)
}
