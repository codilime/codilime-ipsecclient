#!/bin/bash

set -e

curl -v -XPATCH -H "Accept: application/yang-data+json" -H "Content-Type: application/yang-data+json" -k -u "admin:cisco123" https://10.5.0.10/restconf/data/Cisco-IOS-XE-native:native/crypto/ikev2/proposal -d @- <<EOF
{
  "proposal":
    {
      "name": "site2",
      "encryption": {
        "aes-cbc-128": [null]
      },
      "integrity": {
        "sha256": [null]
      },
      "group": {
        "fourteen": [null]
      }
    }
}
EOF

curl -v -XPATCH -H "Accept: application/yang-data+json" -H "Content-Type: application/yang-data+json" -k -u "admin:cisco123" https://10.5.0.10/restconf/data/Cisco-IOS-XE-native:native/crypto/ikev2/policy -d @- <<EOF
{
  "policy":
    {
      "name": "site2",
      "proposal": {
        "proposals": "site2"
      }
    }
}
EOF

curl -v -XPATCH -H "Accept: application/yang-data+json" -H "Content-Type: application/yang-data+json" -k -u "admin:cisco123" https://10.5.0.10/restconf/data/Cisco-IOS-XE-native:native/crypto/ikev2/keyring -d @- <<EOF
{
  "keyring":
    {
      "name": "site2",
      "peer": [
        {
          "name": "any",
          "address": {
            "ipv4": {
              "ipv4-address": "10.5.0.102"
            }
          },
          "pre-shared-key": {
            "key": "Cisco1234567890"
          }
        }
      ]
    }
}
EOF

curl -v -XPATCH -H "Accept: application/yang-data+json" -H "Content-Type: application/yang-data+json" -k -u "admin:cisco123" https://10.5.0.10/restconf/data/Cisco-IOS-XE-native:native/crypto/ikev2/profile -d @- <<EOF
{
   "profile": {
      "name": "site2",
      "authentication": {
        "local": {
          "pre-share": {
          }
        },
        "remote": {
          "pre-share": {
          }
        }
      },
      "keyring": {
        "local": {
          "name": "site2"
        }
      },
      "match": {
        "identity": {
          "remote": {
            "any": [null]
          }
        }
      }
    }
}
EOF

curl -v -XPATCH -H "Accept: application/yang-data+json" -H "Content-Type: application/yang-data+json" -k -u "admin:cisco123" https://10.5.0.10/restconf/data/Cisco-IOS-XE-native:native/crypto/ipsec/transform-set -d @- <<EOF
{
  "transform-set":
    {
      "tag": "site2",
      "esp": "esp-gcm",
      "mode": {
        "tunnel": [null]
      }
    }
}
EOF

curl -v -XPATCH -H "Accept: application/yang-data+json" -H "Content-Type: application/yang-data+json" -k -u "admin:cisco123" https://10.5.0.10/restconf/data/Cisco-IOS-XE-native:native/crypto/ipsec/profile -d @- <<EOF
{
  "profile":
    {
      "name": "site2",
      "set": {
        "ikev2-profile": "site2",
        "pfs": {
          "group": "group14"
        },
        "transform-set": ["site2"],
        "security-association": {
          "lifetime": {
            "kilobytes": "disable"
          }
        }
      }
    }
}
EOF

curl -v -XPATCH -H "Accept: application/yang-data+json" -H "Content-Type: application/yang-data+json" -k -u "admin:cisco123" https://10.5.0.10/restconf/data/Cisco-IOS-XE-native:native/interface -d @- <<EOF
{
  "interface": {
          "Tunnel":
      {
        "name": 100,
        "ip": {
          "address": {
            "primary": {
              "address": "10.0.0.1",
              "mask": "255.255.255.252"
            }
          }
        },
        "Cisco-IOS-XE-tunnel:tunnel": {
          "source": "GigabitEthernet1",
          "destination-config": {
            "ipv4": "10.5.0.102"
          },
          "mode": {
            "ipsec": {
              "ipv4": {
              }
            }
          },
          "protection": {
            "Cisco-IOS-XE-crypto:ipsec": {
              "profile-option": {
                "name": "site2"
              }
            }
          }
        }
      }
  }
}
EOF
