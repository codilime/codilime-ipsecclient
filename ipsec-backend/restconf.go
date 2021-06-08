package main

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"hash/fnv"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
)

const switchBase = "https://%s/restconf/data/Cisco-IOS-XE-native:native/"

type endpoint struct {
	RemoteIPSec string `json:"remote_ip_sec"`
	LocalIP     string `json:"local_ip"`
	PeerIP      string `json:"peer_ip"`
	PSK         string `json:"psk"`
	NAT         bool   `json:"nat"`
	BGP         bool   `json:"bgp"`
}

var groupMap map[string]string = map[string]string{
	"modp_2048": "fourteen",
}

var ipsecGroupMap map[string]string = map[string]string{
	"modp_2048": "group14",
}

func restconfCreate(vrf Vrf) error {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	dbEndpoints := make([]endpoint, 0)
	if err := json.Unmarshal([]byte(vrf.Endpoints.String()), &dbEndpoints); err != nil {
		return err
	}

	cryptoPh1, err := restconfGetCryptoPh1Strings(vrf)
	if err != nil {
		return err
	}

	if err := restconfDoProposal(vrf, client, cryptoPh1); err != nil {
		return err
	}
	if err := restconfDoPolicy(vrf, client); err != nil {
		return err
	}
	if err := restconfDoEndpoints(vrf, client, dbEndpoints); err != nil {
		return err
	}
	if err := restconfDoProfile(vrf, client); err != nil {
		return err
	}
	if err := restconfDoTransformSet(vrf, client); err != nil {
		return err
	}
	if err := restconfDoIpsecProfile(vrf, client, cryptoPh1[len(cryptoPh1)-1]); err != nil {
		return err
	}
	if err := restconfDoTunnels(vrf, client, dbEndpoints); err != nil {
		return err
	}

	return nil
}

func restconfDelete(vrf Vrf) error {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	dbEndpoints := make([]endpoint, 0)
	if err := json.Unmarshal([]byte(vrf.Endpoints.String()), &dbEndpoints); err != nil {
		return err
	}
	// Ignore delete errors. Sometimes there is a leftover configuration left and some of the calls will return 404.
	// We just want to make sure that nothing in the configuration will conflict with what we're inserting
	for i := range dbEndpoints {
		tunName := (hash(vrf.ClientName) + i) % 65536
		restconfDoDelete(fmt.Sprintf("interface/Tunnel=%d", tunName), "", client)
	}
	restconfDoDelete(fmt.Sprintf("crypto/ipsec/profile=%s", vrf.ClientName), "", client)
	restconfDoDelete(fmt.Sprintf("crypto/ipsec/transform-set=%s", vrf.ClientName), "", client)
	restconfDoDelete(fmt.Sprintf("crypto/ikev2/profile=%s", vrf.ClientName), "", client)
	restconfDoDelete(fmt.Sprintf("crypto/ikev2/keyring=%s", vrf.ClientName), "", client)
	restconfDoDelete(fmt.Sprintf("crypto/ikev2/policy=%s", vrf.ClientName), "", client)
	restconfDoDelete(fmt.Sprintf("crypto/ikev2/proposal=%s", vrf.ClientName), "", client)
	return nil
}

func restconfDoProposal(vrf Vrf, client *http.Client, cryptoPh1 []string) error {
	lastIndex := len(cryptoPh1) - 1
	groupMapping, ok := groupMap[cryptoPh1[lastIndex]]
	if !ok {
		return errors.New("could not find a group mapping for:" + cryptoPh1[lastIndex])
	}
	proposal := `{
		"proposal": {
		  "name": "%s",
		  "encryption": {
		    "%s": [null]
		  },
		  "integrity": {
		    "%s": [null]
		  },
		  "group": {
		    "%s": [null]
		  }
		}
	}`
	proposalData := fmt.Sprintf(proposal, vrf.ClientName, cryptoPh1[0], cryptoPh1[1], groupMapping)
	if err := restconfDoPatch("crypto/ikev2/proposal", proposalData, client); err != nil {
		return err
	}
	return nil
}

func restconfDoPolicy(vrf Vrf, client *http.Client) error {
	policy := `{
		"policy": {
		  "name": "%s",
		  "proposal": {
		    "proposals": "%s"
		  }
		}
	}`
	policyData := fmt.Sprintf(policy, vrf.ClientName, vrf.ClientName)
	if err := restconfDoPatch("crypto/ikev2/policy", policyData, client); err != nil {
		return err
	}
	return nil
}

func restconfDoEndpoints(vrf Vrf, client *http.Client, dbEndpoints []endpoint) error {

	peers := "["
	for i, endpoint := range dbEndpoints {
		peer :=
			`{
			"name": "%s",
			"address": {
			  "ipv4": {
			    "ipv4-address": "%s"
			  }
			},
			"pre-shared-key": {
			  "key": "%s"
			}
			}`
		peerData := fmt.Sprintf(peer, vrf.ClientName+strconv.Itoa(i), endpoint.RemoteIPSec, endpoint.PSK)
		peers += peerData
	}
	peers += "]"

	keyring := `{
		"keyring": {
		  "name": "%s",
		  "peer": %s
		}
	}`
	keyringData := fmt.Sprintf(keyring, vrf.ClientName, peers)
	if err := restconfDoPatch("crypto/ikev2/keyring", keyringData, client); err != nil {
		return err
	}
	return nil
}

func restconfDoProfile(vrf Vrf, client *http.Client) error {
	profile := `{
		"profile": {
		  "name": "%s",
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
		      "name": "%s"
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
	profileData := fmt.Sprintf(profile, vrf.ClientName, vrf.ClientName)
	if err := restconfDoPatch("crypto/ikev2/profile", profileData, client); err != nil {
		return err
	}
	return nil
}

func restconfDoTransformSet(vrf Vrf, client *http.Client) error {
	transformSet := `{
		"transform-set": {
		  "tag": "%s",
		  "esp": "esp-gcm",
		  "mode": {
		    "tunnel": [
		      null
		    ]
		  }
		}
		}`
	transformSetData := fmt.Sprintf(transformSet, vrf.ClientName)
	if err := restconfDoPatch("crypto/ipsec/transform-set", transformSetData, client); err != nil {
		return err
	}
	return nil
}

func restconfDoIpsecProfile(vrf Vrf, client *http.Client, cryptoName string) error {
	groupMapping, ok := ipsecGroupMap[cryptoName]
	if !ok {
		return errors.New("could not find an ipsec group mapping for:" + cryptoName)
	}
	ipsecProfile := `{
		"profile": {
		  "name": "%s",
		  "set": {
		    "ikev2-profile": "%s",
		    "pfs": {
		      "group": "%s"
		    },
		    "transform-set": [
		      "%s"
		    ],
		    "security-association": {
		      "lifetime": {
			"kilobytes": "disable"
		      }
		    }
		  }
		}
		}`
	ipsecProfileData := fmt.Sprintf(ipsecProfile, vrf.ClientName, vrf.ClientName, groupMapping, vrf.ClientName)
	if err := restconfDoPatch("crypto/ipsec/profile", ipsecProfileData, client); err != nil {
		return err
	}
	return nil
}

func restconfDoTunnels(vrf Vrf, client *http.Client, dbEndpoints []endpoint) error {
	for i, endpoint := range dbEndpoints {
		tunName := (hash(vrf.ClientName) + i) % 65536
		tunnel := `{
			"interface": {
			  "Tunnel": {
			    "name": %d,
			    "description": "%s",
			    "ip": {
			      "address": {
				"primary": {
				  "address": "%s",
				  "mask": "255.255.255.252"
				}
			      }
			    },
			    "Cisco-IOS-XE-tunnel:tunnel": {
			      "source": "GigabitEthernet1",
			      "destination-config": {
				"ipv4": "%s"
			      },
			      "mode": {
				"ipsec": {
				  "ipv4": {}
				}
			      },
			      "protection": {
				"Cisco-IOS-XE-crypto:ipsec": {
				  "profile-option": {
				    "name": "%s"
				  }
				}
			      }
			    }
			  }
			}
			}`
		tunnelData := fmt.Sprintf(tunnel, tunName, vrf.ClientName+strconv.Itoa(i),
			endpoint.LocalIP, endpoint.RemoteIPSec, vrf.ClientName)
		if err := restconfDoPatch("interface", tunnelData, client); err != nil {
			return err
		}
	}
	return nil
}

func restconfDoPatch(path string, data string, client *http.Client) error {
	return restconfDoRequest("PATCH", path, data, client)
}

func restconfDoDelete(path string, data string, client *http.Client) error {
	return restconfDoRequest("DELETE", path, data, client)
}

func restconfDoRequest(method, path, data string, client *http.Client) error {
	fullPath := fmt.Sprintf(switchBase, os.Getenv("SWITCH_ADDRESS")) + path
	req, err := http.NewRequest(method, fullPath, strings.NewReader(data))
	if err != nil {
		return err
	}
	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(os.Getenv("SWITCH_USERNAME"), os.Getenv("SWITCH_PASSWORD"))
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

func restconfGetCryptoPh1Strings(vrf Vrf) ([]string, error) {
	cryptoPh1 := []string{}
	if err := json.Unmarshal([]byte(vrf.CryptoPh1.String()), &cryptoPh1); err != nil {
		return nil, err
	}

	cryptoPh1Len := len(cryptoPh1)
	if cryptoPh1Len < 2 {
		return nil, errors.New("malformed cryptoPh1: " + strings.Join(cryptoPh1, ", "))
	}
	return cryptoPh1, nil
}

func hash(s string) int {
	h := fnv.New32a()
	h.Write([]byte(s))
	return int(h.Sum32())
}
