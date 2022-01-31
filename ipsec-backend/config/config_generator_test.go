/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package config

import (
	"fmt"
	"ipsec_backend/db"
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

	supervisorConfig = `# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

[program:test vrf]
command=/usr/local/sbin/ipsec.sh
environment=PHYS_IF="test_interface", VRF_ID="2", XFRM_IP="0.0.0.1", XFRM_PEER="10.42.0.1", NAT="YES", VLANS_IPS="1000 11.11.0.0/30 2000 22.22.0.0/30 ", ENDPOINT_IDS="1", DISABLE_PEER_IPS="false"
redirect_stderr=true
stdout_logfile=/opt/logs/test vrf.log
#stdout_logfile_maxbytes = 0
`
	frrConfigCreate = `# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

router bgp 3 vrf vrf-2
    no bgp ebgp-requires-policy
    neighbor ipsec peer-group
    neighbor ipsec remote-as external
    
    neighbor 10.42.0.1 peer-group ipsec
    
address-family ipv4 unicast
    redistribute connected
    neighbor ipsec activate
address-family ipv6 unicast
    redistribute connected
    neighbor ipsec activate


`
	frrConfigRemove = `no router bgp 3 vrf vrf-2
`

	localCert  = `local cert 123`
	remoteCert = `remote cert abc`
	privateKey = `private key 123`

	localCertPath  = "/opt/ipsec/x509/test vrf-0.0.0.1.pem"
	remoteCertPath = "/opt/ipsec/x509/test vrf-10.42.0.1.pem"
	privateKeyPath = "/opt/ipsec/rsa/test vrf-10.42.0.1.key.pem"

	remote_ip_sec = "192.168.0.1"
)

const config_psk = `#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

connections {

    test vrf_1 {
        remote_addrs = %s
        local {
                auth = psk
                    id = %s
        }
        remote {
                auth = psk
                id = %s
        }
        children {
            site-cisco_1 {
                
                remote_ts = 0.0.0.0/0
                local_ts = 0.0.0.0/0
                
                if_id_in = 1
                if_id_out = 1
                esp_proposals = cast128-sha512-modp1024
                start_action = start
                updown=/usr/local/bin/status.sh test vrf-1-%s
                copy_dscp = out
            }
        }
        version = 2
        proposals = aes128-sha256-modp2048
    }

}
secrets {
    ike-test vrf_1 {
                id = %s
            secret = psk23
    }

}
`

func _testGenerateTemplatePsk(vrf db.Vrf, vrfConf []byte, t *testing.T) {
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

	generator := SoftwareGenerator{fileHandler, supervisor}
	generator.GenerateConfigs(vrf)
}

func TestGenerateTemplatePsk(t *testing.T) {
	local_id := ""

	vrf := createTestVrf()
	vrf.Endpoints[0].RemoteIPSec = remote_ip_sec
	vrf.Endpoints[0].Authentication.Type = "psk"
	vrf.Endpoints[0].Authentication.LocalID = local_id

	vrfConf := []byte(fmt.Sprintf(config_psk, remote_ip_sec, remote_ip_sec, remote_ip_sec, remote_ip_sec, remote_ip_sec))
	_testGenerateTemplatePsk(vrf, vrfConf, t)
}

func TestGenerateTemplatePskLocalId(t *testing.T) {
	local_id := "test@codilime.com"

	vrf := createTestVrf()
	vrf.Endpoints[0].RemoteIPSec = remote_ip_sec
	vrf.Endpoints[0].Authentication.Type = "psk"
	vrf.Endpoints[0].Authentication.LocalID = local_id

	vrfConf := []byte(fmt.Sprintf(config_psk, remote_ip_sec, local_id, remote_ip_sec, remote_ip_sec, local_id))
	_testGenerateTemplatePsk(vrf, vrfConf, t)
}

func TestGenerateTemplateCert(t *testing.T) {
	vrfConf := []byte(`#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

connections {

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
	vrf.Endpoints[0].Authentication.Type = "certs"
	vrf.Endpoints[0].Authentication.LocalCert = localCert
	vrf.Endpoints[0].Authentication.RemoteCert = remoteCert
	vrf.Endpoints[0].Authentication.PrivateKey = privateKey

	generator := SoftwareGenerator{fileHandler, supervisor}

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

	generator := SoftwareGenerator{fileHandler, supervisor}

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

	generator := SoftwareGenerator{fileHandler, supervisor}

	generator.DeleteConfigs(vrf)
}

func TestTransformLocalID(t *testing.T) {
	transformLocalIdMatrix := [][]string{
		{"xyz=abc", "dn", ""},
		{"@#newkeyid", "key-id", "newkeyid"},
		{"@newfqdn", "fqdn", "newfqdn"},
		{"test@codilime.com", "email", "test@codilime.com"},
		{"2001:db8::1234:5678", "address", "2001:db8::1234:5678"},
		{"2001:db8::1234:", "key-id", "2001:db8::1234:"},
		{"127.10.10.20", "address", "127.10.10.20"},
		{"newfqdn", "fqdn", "newfqdn"},
	}
	for _, data := range transformLocalIdMatrix {
		if localIDtype := transformLocalIDType(data[0]); localIDtype != data[1] {
			t.Fatalf("expected local id type: %s got: %s\n", data[1], localIDtype)
		}
		if localID := transformLocalID(data[0]); localID != data[2] {
			t.Fatalf("expected local id: %s got: %s\n", data[2], localID)
		}
	}
}

func createTestVrf() db.Vrf {
	active := true
	disablePeerIps := false
	ospf := false
	return db.Vrf{
		2,
		"test vrf",
		[]byte(`[{"vlan":1000,"lan_ip":"11.11.0.0/30"},{"vlan":2000,"lan_ip":"22.22.0.0/30"}]`),
		[]byte(`["aes128","sha256","modp2048"]`),
		[]byte(`["cast128","sha512","modp1024"]`),
		"test_interface",
		&active,
		3,
		&disablePeerIps,
		&ospf,
		[]db.Endpoint{{
			1,
			2,
			"192.168.0.1",
			"0.0.0.1",
			"10.42.0.1",
			3,
			true,
			false,
			"eth3",
			db.EndpointAuth{"psk", "psk23", "", "", "", "", ""}}}}
}
