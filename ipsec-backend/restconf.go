package main

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"hash/fnv"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
)

const (
	switchBase     = "https://10.5.0.10/restconf/data/Cisco-IOS-XE-native:native/"
	switchUsername = "admin"
	switchPassword = "cisco123"
)

func restconfDoPatch(path string, data string, client *http.Client) error {
	req, err := http.NewRequest("PATCH", switchBase+path, strings.NewReader(data))
	if err != nil {
		return err
	}
	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(switchUsername, switchPassword)
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	if resp.StatusCode >= 400 {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		return errors.New("call to " + path + " failed (" + strconv.Itoa(resp.StatusCode) + "): " + string(body))
	}
	return nil
}

var groupMap map[string]string = map[string]string{
	"modp_2048": "fourteen",
}

var ipsecGroupMap map[string]string = map[string]string{
	"modp_2048": "group14",
}

func hash(s string) int {
	h := fnv.New32a()
	h.Write([]byte(s))
	return int(h.Sum32())
}

func restconfCreate(vrf Vrf) error {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	cryptoPh1 := strings.Split(vrf.CryptoPh1, "#")
	if len(cryptoPh1) < 3 {
		return errors.New("malformed cryptoPh1: " + vrf.CryptoPh1)
	}
	groupMapping, ok := groupMap[cryptoPh1[2]]
	if !ok {
		return errors.New("could not find a group mapping for:" + cryptoPh1[2])
	}
	proposalData := `{
		"proposal": {
		  "name": "` + vrf.ClientName + `",
		  "encryption": {
		    "` + cryptoPh1[0] + `": [null]
		  },
		  "integrity": {
		    "` + cryptoPh1[1] + `": [null]
		  },
		  "group": {
		    "` + groupMapping + `": [null]
		  }
		}
	}`
	if err := restconfDoPatch("crypto/ikev2/proposal", proposalData, client); err != nil {
		return err
	}

	policyData := `{
		"policy": {
		  "name": "` + vrf.ClientName + `",
		  "proposal": {
		    "proposals": "` + vrf.ClientName + `"
		  }
		}
	}`
	if err := restconfDoPatch("crypto/ikev2/policy", policyData, client); err != nil {
		return err
	}

	type Endpoint struct {
		RemoteIPSec string `json:"remote_ip_sec"`
		LocalIP     string `json:"local_ip"`
		PeerIP      string `json:"peer_ip"`
		PSK         string `json:"psk"`
		NAT         bool   `json:"nat"`
		BGP         bool   `json:"bgp"`
	}

	dbEndpoints := make([]Endpoint, 0)
	if err := json.Unmarshal([]byte(vrf.Endpoints.String()), &dbEndpoints); err != nil {
		return err
	}

	peers := "["
	for i, endpoint := range dbEndpoints {
		peers +=
			`{
			"name": "` + vrf.ClientName + strconv.Itoa(i) + `",
			"address": {
			  "ipv4": {
			    "ipv4-address": "` + endpoint.PeerIP + `"
			  }
			},
			"pre-shared-key": {
			  "key": "` + endpoint.PSK + `"
			}
			}`
	}
	peers += "]"

	keyringData := `{
		"keyring": {
		  "name": "` + vrf.ClientName + `",
		  "peer": ` + peers + `
		}
	}`
	if err := restconfDoPatch("crypto/ikev2/keyring", keyringData, client); err != nil {
		return err
	}

	profileData := `{
		"profile": {
		  "name": "` + vrf.ClientName + `",
		  "authentication": {
		    "local": {
		      "pre-share": {}
		    },
		    "remote": {
		      "pre-share": {}
		    }
		  },
		  "keyring": {
		    "local": {
		      "name": "` + vrf.ClientName + `"
		    }
		  },
		  "match": {
		    "identity": {
		      "remote": {
			"any": [
			  null
			]
		      }
		    }
		  }
		}
		}`
	if err := restconfDoPatch("crypto/ikev2/profile", profileData, client); err != nil {
		return err
	}

	transformSetData := `{
		"transform-set": {
		  "tag": "` + vrf.ClientName + `",
		  "esp": "esp-gcm",
		  "mode": {
		    "tunnel": [
		      null
		    ]
		  }
		}
		}`
	if err := restconfDoPatch("crypto/ipsec/transform-set", transformSetData, client); err != nil {
		return err
	}

	groupMapping, ok = ipsecGroupMap[cryptoPh1[2]]
	if !ok {
		return errors.New("could not find an ipsec group mapping for:" + cryptoPh1[2])
	}
	ipsecProfileData := `{
		"profile": {
		  "name": "` + vrf.ClientName + `",
		  "set": {
		    "ikev2-profile": "` + vrf.ClientName + `",
		    "pfs": {
		      "group": "` + groupMapping + `"
		    },
		    "transform-set": [
		      "` + vrf.ClientName + `"
		    ],
		    "security-association": {
		      "lifetime": {
			"kilobytes": "disable"
		      }
		    }
		  }
		}
		}`
	if err := restconfDoPatch("crypto/ipsec/profile", ipsecProfileData, client); err != nil {
		return err
	}
	for i, endpoint := range dbEndpoints {
		tunName := (hash(vrf.ClientName) + i) % 65536
		tunnelData := `{
			"interface": {
			  "Tunnel": {
			    "name": ` + strconv.Itoa(tunName) + `,
			    "ip": {
			      "address": {
				"primary": {
				  "address": "` + endpoint.LocalIP + `",
				  "mask": "255.255.255.252"
				}
			      }
			    },
			    "Cisco-IOS-XE-tunnel:tunnel": {
			      "source": "GigabitEthernet1",
			      "destination-config": {
				"ipv4": "` + endpoint.PeerIP + `"
			      },
			      "mode": {
				"ipsec": {
				  "ipv4": {}
				}
			      },
			      "protection": {
				"Cisco-IOS-XE-crypto:ipsec": {
				  "profile-option": {
				    "name": "` + vrf.ClientName + `"
				  }
				}
			      }
			    }
			  }
			}
			}`
		if err := restconfDoPatch("interface", tunnelData, client); err != nil {
			return err
		}
	}
	return nil
}

func restconfDelete(vrf Vrf) error {
	return nil
}
