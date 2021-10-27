package main

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
)

const switchBase = "https://%s/restconf/data/"

func (a *App) restconfCreate(vrf Vrf) error {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	// Remove NAT-T as 9300X does not support it yet
	if err := a.tryRestconfDelete("Cisco-IOS-XE-native:native/crypto/ipsec/nat-transparency", client); err != nil {
		fmt.Println("NAT-T config already removed, skipping", err)
	}

	cryptoPh1, err := restconfGetCryptoStrings(string(vrf.CryptoPh1))
	if err != nil {
		return ReturnError(err)
	}

	cryptoPh2, err := restconfGetCryptoStrings(string(vrf.CryptoPh2))
	if err != nil {
		return ReturnError(err)
	}

	if err := a.restconfDoProposal(vrf, client, cryptoPh1); err != nil {
		return ReturnError(err)
	}
	if err := a.restconfDoPolicy(vrf, client); err != nil {
		return ReturnError(err)
	}
	if err := a.restconfDoEndpoints(vrf, client, vrf.Endpoints); err != nil {
		return ReturnError(err)
	}
	if err := a.restconfDoProfile(vrf, client); err != nil {
		return ReturnError(err)
	}
	if err := a.restconfDoTransformSet(vrf, cryptoPh2, client); err != nil {
		return ReturnError(err)
	}
	if err := a.restconfDoIpsecProfile(vrf, client, cryptoPh2[len(cryptoPh2)-1]); err != nil {
		return ReturnError(err)
	}
	if err := a.restconfDoTunnels(vrf, client, vrf.Endpoints); err != nil {
		return ReturnError(err)
	}
	if err := a.restconfDoBGP(vrf, client, vrf.Endpoints); err != nil {
		return ReturnError(err)
	}

	return nil
}

func (a *App) restconfDelete(vrf Vrf) error {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	// Ignore delete errors. Sometimes there is a leftover configuration left and some of the calls will return 404.
	// We just want to make sure that nothing in the configuration will conflict with what we're inserting
	if err := a.tryRestconfDelete(fmt.Sprintf("Cisco-IOS-XE-native:native/router/bgp=%d", vrf.LocalAs), client); err != nil {
		Error(err)
	}
	for _, e := range vrf.Endpoints {
		if err := a.tryRestconfDelete(fmt.Sprintf("Cisco-IOS-XE-native:native/interface/Tunnel=%d", e.ID), client); err != nil {
			Error(err)
		}
	}
	if err := a.tryRestconfDelete(fmt.Sprintf("Cisco-IOS-XE-native:native/crypto/ipsec/profile=%s", vrf.ClientName), client); err != nil {
		Error(err)
	}
	if err := a.tryRestconfDelete(fmt.Sprintf("Cisco-IOS-XE-native:native/crypto/ipsec/transform-set=%s", vrf.ClientName), client); err != nil {
		Error(err)
	}
	if err := a.tryRestconfDelete(fmt.Sprintf("Cisco-IOS-XE-native:native/crypto/ikev2/profile=%s", vrf.ClientName), client); err != nil {
		Error(err)
	}
	if err := a.tryRestconfDelete(fmt.Sprintf("Cisco-IOS-XE-native:native/crypto/ikev2/keyring=%s", vrf.ClientName), client); err != nil {
		Error(err)
	}
	if err := a.tryRestconfDelete(fmt.Sprintf("Cisco-IOS-XE-native:native/crypto/ikev2/policy=%s", vrf.ClientName), client); err != nil {
		Error(err)
	}
	if err := a.tryRestconfDelete(fmt.Sprintf("Cisco-IOS-XE-native:native/crypto/ikev2/proposal=%s", vrf.ClientName), client); err != nil {
		Error(err)
	}
	return nil
}

func (a *App) tryRestconfDelete(path string, client *http.Client) error {
	return ReturnError(a.tryRestconfRequest("DELETE", path, "", client))
}

func (a *App) restconfDoProposal(vrf Vrf, client *http.Client, cryptoPh1 []string) error {
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
	if err := a.tryRestconfPatch("Cisco-IOS-XE-native:native/crypto/ikev2/proposal", proposalData, client); err != nil {
		return ReturnError(err)
	}
	return nil
}

func (a *App) restconfDoPolicy(vrf Vrf, client *http.Client) error {
	policy := `{
		"policy": {
		  "name": "%s",
		  "match": {
			"fvrf": {
			  "any": [null]
			}
		  },
		  "proposal": {
		    "proposals": "%s"
		  }
		}
	}`
	policyData := fmt.Sprintf(policy, vrf.ClientName, vrf.ClientName)
	if err := a.tryRestconfPatch("Cisco-IOS-XE-native:native/crypto/ikev2/policy", policyData, client); err != nil {
		return ReturnError(err)
	}
	return nil
}

func (a *App) restconfDoEndpoints(vrf Vrf, client *http.Client, dbEndpoints []Endpoint) error {

	peers := make([]string, 0, len(dbEndpoints))
	for i, Endpoint := range dbEndpoints {
		if Endpoint.Authentication.Type == "certs" {
			log.Debugf("skipping a cert endpoint")
			continue
		}
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
		// TODO hw certs
		peerData := fmt.Sprintf(peer, vrf.ClientName+strconv.Itoa(i), Endpoint.RemoteIPSec, Endpoint.Authentication.PSK)
		peers = append(peers, peerData)
	}

	keyring := `{
		"keyring": {
		  "name": "%s",
		  "peer": %s
		}
	}`
	keyringData := fmt.Sprintf(keyring, vrf.ClientName, "["+strings.Join(peers, ",")+"]")
	if err := a.tryRestconfPatch("Cisco-IOS-XE-native:native/crypto/ikev2/keyring", keyringData, client); err != nil {
		return ReturnError(err)
	}
	return nil
}

func (a *App) restconfDoProfile(vrf Vrf, client *http.Client) error {
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
	if err := a.tryRestconfPatch("Cisco-IOS-XE-native:native/crypto/ikev2/profile", profileData, client); err != nil {
		return ReturnError(err)
	}
	return nil
}

func (a *App) restconfDoTransformSet(vrf Vrf, cryptoPh2 []string, client *http.Client) error {
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
			return ReturnError(fmt.Errorf("wrong encryption function format: %s", cryptoPh2[0]))
		}
		keyBit = fmt.Sprintf(`"key-bit": "%s",`, encFunc[1])
		esp = fmt.Sprintf("%s-%s", encFunc[0], encFunc[2])
	} else {
		esp = cryptoPh2[0]
	}
	if !strings.Contains(cryptoPh2[0], "gcm") {
		espHmac = fmt.Sprintf(`"esp-hmac":"%s",`, cryptoPh2[1])
	}
	tunnelOptionName := "tunnel"
	if os.Getenv("CAF_SYSTEM_NAME") == "cat9300X" {
		tunnelOptionName = "tunnel-choice"
	}
	transformSet := `{
		"transform-set": {
		  "tag": "%s",
		  "esp": "%s",
		  %s
		  %s
		  "mode": {
		    "%s": [
		      null
		    ]
		  }
		}
		}`
	transformSetData := fmt.Sprintf(transformSet, vrf.ClientName, esp, keyBit, espHmac, tunnelOptionName)
	if err := a.tryRestconfPatch("Cisco-IOS-XE-native:native/crypto/ipsec/transform-set", transformSetData, client); err != nil {
		return ReturnError(err)
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

func (a *App) restconfDoIpsecProfile(vrf Vrf, client *http.Client, cryptoName string) error {
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
	if err := a.tryRestconfPatch("Cisco-IOS-XE-native:native/crypto/ipsec/profile", ipsecProfileData, client); err != nil {
		return ReturnError(err)
	}
	return nil
}

func (a *App) restconfDoTunnels(vrf Vrf, client *http.Client, dbEndpoints []Endpoint) error {
	for i, Endpoint := range dbEndpoints {
		if Endpoint.Authentication.Type == "certs" {
			log.Debugf("skipping a cert endpoint")
			continue
		}
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
		tunnelData := fmt.Sprintf(tunnel, Endpoint.ID, vrf.ClientName+strconv.Itoa(i),
			Endpoint.LocalIP, Endpoint.SourceInterface, Endpoint.RemoteIPSec, vrf.ClientName)
		if err := a.tryRestconfPatch("Cisco-IOS-XE-native:native/interface", tunnelData, client); err != nil {
			return ReturnError(err)
		}
	}
	return nil
}

func (a *App) restconfDoBGP(vrf Vrf, client *http.Client, dbEndpoints []Endpoint) error {
	bgp := `{
		"bgp": [
		  {
		    "id": %d,
		    "bgp": {
		      "log-neighbor-changes": true
		    },
		    "neighbor": [
		      %s
		    ],
		    "address-family":{
			"no-vrf":{
			   "ipv4":[
			      {
				 "af-name":"unicast",
				 "ipv4-unicast":{
				    "neighbor":[
					    %s
				    ],
				    "redistribute":{
				       "connected":{}
				    }
				 }
			      }
			   ]
			}
		     }
		  }
		]
	      }`
	neighbors := []string{}
	neighbors2 := []string{}
	neighbor := `{
		"id": "%s",
		"remote-as": %d
	      }`
	neighbor2 := `{
		"id":"%s",
		"activate":[
		   null
		]
	     }`
	for _, Endpoint := range dbEndpoints {
		if Endpoint.Authentication.Type == "certs" {
			log.Debugf("skipping a cert endpoint")
			continue
		}
		if !Endpoint.BGP {
			continue
		}
		neighbors = append(neighbors, fmt.Sprintf(neighbor, Endpoint.PeerIP, Endpoint.RemoteAS))
		neighbors2 = append(neighbors2, fmt.Sprintf(neighbor2, Endpoint.PeerIP))
	}
	bgpData := fmt.Sprintf(bgp, vrf.LocalAs, strings.Join(neighbors, ","), strings.Join(neighbors2, ","))
	if err := a.tryRestconfPatch("Cisco-IOS-XE-native:native/router/bgp", bgpData, client); err != nil {
		return ReturnError(err)
	}
	return nil
}

func (a *App) tryRestconfPatch(path, data string, client *http.Client) error {
	return ReturnError(a.tryRestconfRequest("PATCH", path, data, client))
}

func (a *App) tryRestconfRequest(method, path, data string, client *http.Client) error {
	retries := 20
	for i := 0; i < retries; i++ {
		time.Sleep(time.Millisecond * 500)
		fmt.Printf("%s: %s (%d)\n", method, path, i)
		err := a.restconfDoRequest(method, path, data, client)
		if err == nil {
			fmt.Println(method, "successful")
			return nil
		} else {
			if strings.Contains(err.Error(), "lock-denied") {
				fmt.Println("lock denied")
				continue
			}
			fmt.Println("other error encountered")
			return ReturnError(err)
		}
	}
	fmt.Println("retry limit exceeded")
	return ReturnError(fmt.Errorf("%s: retry limit %d exceeded", path, retries))
}

func (a *App) restconfDoRequest(method, path, data string, client *http.Client) error {
	fmt.Printf("%s: %s\n%s\n", method, path, data)
	fullPath := fmt.Sprintf(switchBase, os.Getenv("SWITCH_ADDRESS")) + path
	req, err := http.NewRequest(method, fullPath, strings.NewReader(data))
	if err != nil {
		return ReturnError(err)
	}
	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(a.switchUsername, a.switchPassword)
	resp, err := client.Do(req)
	if err != nil {
		return ReturnError(err)
	}
	if resp.StatusCode >= 400 {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return ReturnError(err)
		}
		return ReturnError(errors.New("call to " + path + " failed (" + strconv.Itoa(resp.StatusCode) + "): " + string(body)))
	}
	return nil
}

func (a *App) restconfGetData(path string, client *http.Client) (map[string]interface{}, error) {
	fmt.Printf("GET: %s\n", path)
	ret := map[string]interface{}{}
	fullPath := fmt.Sprintf(switchBase, os.Getenv("SWITCH_ADDRESS")) + path
	req, err := http.NewRequest("GET", fullPath, nil)
	if err != nil {
		return ret, ReturnError(err)
	}
	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(a.switchUsername, a.switchPassword)
	resp, err := client.Do(req)
	if err != nil {
		return ret, ReturnError(err)
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return ret, ReturnError(err)
	}
	if resp.StatusCode >= 400 {
		return ret, ReturnError(errors.New("get on " + path + " failed (" + strconv.Itoa(resp.StatusCode) + "): " + string(body)))
	}
	if strings.TrimSpace(string(body)) == "" {
		return nil, nil
	}
	if err := json.Unmarshal(body, &ret); err != nil {
		fmt.Println("failed to unmarshal:", string(body))
		return ret, ReturnError(err)
	}
	return ret, nil
}

func restconfGetCryptoStrings(cryptoString string) ([]string, error) {
	crypto := []string{}
	if err := json.Unmarshal([]byte(cryptoString), &crypto); err != nil {
		return nil, ReturnError(err)
	}

	if len(crypto) < 2 {
		return nil, ReturnError(errors.New("malformed crypto: " + strings.Join(crypto, ", ")))
	}
	return crypto, nil
}