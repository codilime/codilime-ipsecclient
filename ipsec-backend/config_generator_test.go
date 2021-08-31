package main

import (
	"encoding/json"
	"testing"

	"gorm.io/datatypes"
)

func TestGenerateStrongswanTemplate(t *testing.T) {
	vrf := generateExampleVrf()

	got, err := generateStrongswanTemplate(vrf)

	if err != nil {
		t.Fatalf("error = %v", err)
	}
	if got != expectedStrongswanConfig {
		t.Fatalf("got %v", got)
	}
}

func TestGenerateSupervisorTemplate(t *testing.T) {
	vrf := generateExampleVrf()

	got, err := generateSupervisorTemplate(vrf)

	if err != nil {
		t.Fatalf("error = %v", err)
	}
	if got != expectedSupervisorConfig {
		t.Fatalf("got %v", got)
	}
}

const expectedStrongswanConfig = `connections {

    1042_google_1 {
        remote_addrs = 192.168.0.42
        local {
            auth = psk
            id = 192.168.0.42
        }
        remote {
            auth = psk
            id = 192.168.0.42
        }
        children {
            site-cisco_1 {
                remote_ts = 0.0.0.0/0
                local_ts = 0.0.0.0/0
                if_id_in = 104201
                if_id_out = 104201
                esp_proposals = aes128gcm128-x25519
                start_action = start
            }
        }
        version = 2
        proposals = aes128-sha256-x25519
    }

    1042_google_2 {
        remote_addrs = 192.168.10.142
        local {
            auth = psk
            id = 192.168.10.142
        }
        remote {
            auth = psk
            id = 192.168.10.142
        }
        children {
            site-cisco_2 {
                remote_ts = 0.0.0.0/0
                local_ts = 0.0.0.0/0
                if_id_in = 104202
                if_id_out = 104202
                esp_proposals = aes128gcm128-x25519
                start_action = start
            }
        }
        version = 2
        proposals = aes128-sha256-x25519
    }

}
secrets {

    ike-1042_google_1 {
        id = 192.168.0.42
        secret = Qy0oakYuYzI+4n7N3GhDZIvOf81dywVD
    }

    ike-1042_google_2 {
        id = 192.168.10.142
        secret = Cty+3M9e82VV5NVgkIPu2PP3U7G8v5Ja
    }

}
`

const expectedSupervisorConfig = `[program:1042-google]
command=/usr/local/sbin/ipsec.sh
environment=PHYS_IF="ens192", VRF="1042", XFRM_IP="10.10.10.10 10.20.20.20", XFRM_PEER="10.10.10.20 10.20.20.30", NAT="NO YES", LAN_IP="10.10.10.10/30"
redirect_stderr=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes = 0
stderr_logfile_maxbytes = 0
`

func generateExampleVrf() *VrfWithEndpoints {
	endpoints := []Endpoint{
		{
			LocalIP:     "10.10.10.10",
			PeerIP:      "10.10.10.20",
			RemoteIPSec: "192.168.0.42",
			Authentication: EndpointAuth{
				Type: "psk",
				PSK:  "Qy0oakYuYzI+4n7N3GhDZIvOf81dywVD",
			},
			BGP: true,
			NAT: false,
		},
		{
			LocalIP:     "10.20.20.20",
			PeerIP:      "10.20.20.30",
			RemoteIPSec: "192.168.10.142",
			Authentication: EndpointAuth{
				Type: "psk",
				PSK:  "Cty+3M9e82VV5NVgkIPu2PP3U7G8v5Ja",
			},
			BGP: false,
			NAT: true,
		},
	}
	cryptoPh1 := []string{
		"aes128", "sha256", "x25519",
	}
	cryptoPh1Json, _ := json.Marshal(cryptoPh1)
	cryptoPh2 := []string{
		"aes128gcm128", "", "x25519",
	}
	cryptoPh2Json, _ := json.Marshal(cryptoPh2)
	data, _ := json.Marshal(endpoints)
	vrf := Vrf{
		ClientName:        "google",
		Vlan:              1042,
		CryptoPh1:         cryptoPh1Json,
		CryptoPh2:         cryptoPh2Json,
		PhysicalInterface: "ens192",
		LocalAs:           65001,
		LanIP:             "10.10.10.10/30",
		Endpoints:         datatypes.JSON(data),
	}
	return &VrfWithEndpoints{
		Vrf:       vrf,
		Endpoints: endpoints,
	}
}
