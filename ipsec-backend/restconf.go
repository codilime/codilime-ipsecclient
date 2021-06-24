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
	"time"
)

const switchBase = "https://%s/restconf/data/Cisco-IOS-XE-native:native/"

type endpoint struct {
	RemoteIPSec     string `json:"remote_ip_sec"`
	LocalIP         string `json:"local_ip"`
	PeerIP          string `json:"peer_ip"`
	PSK             string `json:"psk"`
	RemoteAS        int    `json:"remote_as"`
	NAT             bool   `json:"nat"`
	BGP             bool   `json:"bgp"`
	SourceInterface string `json:"source_interface"`
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

	cryptoPh1, err := restconfGetCryptoStrings(string(vrf.CryptoPh1))
	if err != nil {
		return err
	}

	cryptoPh2, err := restconfGetCryptoStrings(string(vrf.CryptoPh2))
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
	if err := restconfDoTransformSet(vrf, cryptoPh2, client); err != nil {
		return err
	}
	if err := restconfDoIpsecProfile(vrf, client, cryptoPh2[len(cryptoPh2)-1]); err != nil {
		return err
	}
	if err := restconfDoTunnels(vrf, client, dbEndpoints); err != nil {
		return err
	}
	if err := restconfDoBGP(vrf, client, dbEndpoints); err != nil {
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
	if err := tryRestconfDelete(fmt.Sprintf("router/bgp=%d", vrf.LocalAs), client); err != nil {
		fmt.Println("delete error occured:", err)
	}
	for i := range dbEndpoints {
		tunName := (hash(vrf.ClientName) + i) % 65536
		if err := tryRestconfDelete(fmt.Sprintf("interface/Tunnel=%d", tunName), client); err != nil {
			fmt.Println("delete error occured:", err)
		}
	}
	if err := tryRestconfDelete(fmt.Sprintf("crypto/ipsec/profile=%s", vrf.ClientName), client); err != nil {
		fmt.Println("delete error occured:", err)
	}
	if err := tryRestconfDelete(fmt.Sprintf("crypto/ipsec/transform-set=%s", vrf.ClientName), client); err != nil {
		fmt.Println("delete error occured:", err)
	}
	if err := tryRestconfDelete(fmt.Sprintf("crypto/ikev2/profile=%s", vrf.ClientName), client); err != nil {
		fmt.Println("delete error occured:", err)
	}
	if err := tryRestconfDelete(fmt.Sprintf("crypto/ikev2/keyring=%s", vrf.ClientName), client); err != nil {
		fmt.Println("delete error occured:", err)
	}
	if err := tryRestconfDelete(fmt.Sprintf("crypto/ikev2/policy=%s", vrf.ClientName), client); err != nil {
		fmt.Println("delete error occured:", err)
	}
	if err := tryRestconfDelete(fmt.Sprintf("crypto/ikev2/proposal=%s", vrf.ClientName), client); err != nil {
		fmt.Println("delete error occured:", err)
	}
	return nil
}

func tryRestconfDelete(path string, client *http.Client) error {
	return tryRestconfRequest("DELETE", path, "", client)
}

func restconfDoProposal(vrf Vrf, client *http.Client, cryptoPh1 []string) error {
	proposal := `{
		"proposal": {
		  "name": "%s",
		  "encryption": {
		    "%s": [null]
		  },
		  "integrity": {
		    "%s": [null]
		  },
		  "prf": {
		    "%s": [null]
		  },
		  "group": {
		    "%s": [null]
		  }
		}
	}`
	proposalData := fmt.Sprintf(proposal, vrf.ClientName, cryptoPh1[0], cryptoPh1[1], cryptoPh1[1], cryptoPh1[2])
	if err := tryRestconfPatch("crypto/ikev2/proposal", proposalData, client); err != nil {
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
	if err := tryRestconfPatch("crypto/ikev2/policy", policyData, client); err != nil {
		return err
	}
	return nil
}

func restconfDoEndpoints(vrf Vrf, client *http.Client, dbEndpoints []endpoint) error {

	peers := make([]string, 0, len(dbEndpoints))
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
		peers = append(peers, peerData)
	}

	keyring := `{
		"keyring": {
		  "name": "%s",
		  "peer": %s
		}
	}`
	keyringData := fmt.Sprintf(keyring, vrf.ClientName, "["+strings.Join(peers, ",")+"]")
	if err := tryRestconfPatch("crypto/ikev2/keyring", keyringData, client); err != nil {
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
	if err := tryRestconfPatch("crypto/ikev2/profile", profileData, client); err != nil {
		return err
	}
	return nil
}

func restconfDoTransformSet(vrf Vrf, cryptoPh2 []string, client *http.Client) error {
	// esp: always present
	// key-bit: when it's gcm or aes
	keyBit := ""
	// esp-hmac: when it's not gcm
	espHmac := ""
	esp := ""
	if containsADigit(cryptoPh2[0]) {
		// this is gcm or aes
		encFunc := strings.Split(cryptoPh2[0], "-")
		if len(encFunc) < 3 {
			return fmt.Errorf("wrong encryption function format: %s", cryptoPh2[0])
		}
		keyBit = fmt.Sprintf(`"key-bit": "%s",`, encFunc[1])
		esp = fmt.Sprintf("%s-%s", encFunc[0], encFunc[2])
	} else {
		esp = cryptoPh2[0]
	}
	if !strings.Contains(cryptoPh2[0], "gcm") {
		espHmac = fmt.Sprintf(`"esp-hmac":"%s",`, cryptoPh2[1])
	}
	transformSet := `{
		"transform-set": {
		  "tag": "%s",
		  "esp": "%s",
		  %s
		  %s
		  "mode": {
		    "tunnel": [
		      null
		    ]
		  }
		}
		}`
	transformSetData := fmt.Sprintf(transformSet, vrf.ClientName, esp, keyBit, espHmac)
	if err := tryRestconfPatch("crypto/ipsec/transform-set", transformSetData, client); err != nil {
		return err
	}
	return nil
}

func containsADigit(str string) bool {
	for _, c := range str {
		if c >= '0' && c <= '9' {
			return true
		}
	}
	return false
}

func restconfDoIpsecProfile(vrf Vrf, client *http.Client, cryptoName string) error {
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
	ipsecProfileData := fmt.Sprintf(ipsecProfile, vrf.ClientName, vrf.ClientName, cryptoName, vrf.ClientName)
	if err := tryRestconfPatch("crypto/ipsec/profile", ipsecProfileData, client); err != nil {
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
			      "source": "%s",
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
			endpoint.LocalIP, endpoint.SourceInterface, endpoint.RemoteIPSec, vrf.ClientName)
		if err := tryRestconfPatch("interface", tunnelData, client); err != nil {
			return err
		}
	}
	return nil
}

func restconfDoBGP(vrf Vrf, client *http.Client, dbEndpoints []endpoint) error {
	bgp := `{
		"bgp": [
		  {
		    "id": %d,
		    "bgp": {
		      "log-neighbor-changes": true
		    },
		    "neighbor": [
		      %s
		    ]
		  }
		]
	      }`
	neighbors := []string{}
	for _, endpoint := range dbEndpoints {
		if !endpoint.BGP {
			continue
		}
		neighbor := `{
			"id": "%s",
			"remote-as": %d
		      }`
		neighbors = append(neighbors, fmt.Sprintf(neighbor, endpoint.PeerIP, endpoint.RemoteAS))
	}
	bgpData := fmt.Sprintf(bgp, vrf.LocalAs, strings.Join(neighbors, ","))
	if err := tryRestconfPatch("router/bgp", bgpData, client); err != nil {
		return err
	}
	return nil
}

func tryRestconfPatch(path, data string, client *http.Client) error {
	return tryRestconfRequest("PATCH", path, data, client)
}

func tryRestconfRequest(method, path, data string, client *http.Client) error {
	retries := 20
	for i := 0; i < retries; i++ {
		time.Sleep(time.Millisecond * 500)
		fmt.Printf("%s: %s (%d)\n", method, path, i)
		err := restconfDoRequest(method, path, data, client)
		if err == nil {
			fmt.Println(method, "successful")
			return nil
		} else {
			if strings.Contains(err.Error(), "lock-denied") {
				fmt.Println("lock denied")
				continue
			}
			fmt.Println("other error encountered")
			return err
		}
	}
	fmt.Println("retry limit exceeded")
	return fmt.Errorf("%s: retry limit %d exceeded", path, retries)
}

func restconfDoRequest(method, path, data string, client *http.Client) error {
	fmt.Printf("%s: %s\n%s\n", method, path, data)
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

func restconfGetCryptoStrings(cryptoString string) ([]string, error) {
	crypto := []string{}
	if err := json.Unmarshal([]byte(cryptoString), &crypto); err != nil {
		return nil, err
	}

	cryptoLen := len(crypto)
	if cryptoLen < 2 {
		return nil, errors.New("malformed crypto: " + strings.Join(crypto, ", "))
	}
	return crypto, nil
}

func hash(s string) int {
	h := fnv.New32a()
	h.Write([]byte(s))
	return int(h.Sum32())
}
