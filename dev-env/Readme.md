# Development environment

## Usage

- Bring dockers up using docker-compose
- There will be 4 endpoints:

1. 10.5.0.101 & 10.5.0.102 will be awaiting IPSEC tunnel authenticated via x509 certificates. 
2. Application should use certificates from UI directory
3. peerCert-1-loc.pem, peerKey-1-loc.pem, peerCert-1-rem.pem should be used for first container
4. peerCert-2-loc.pem, peerKey-2-loc.pem, peerCert-2-rem.pem should be used for second container
5. Third and fourth container has PSK set to: `Cisco-remote3` and `Cisco-remote4`

- each container has BGP daemon running
- Tunnel IPs for remote containers are as follows: 10.0.[1234].2/30 
- each endpoint has the following crypto PH1/PH2 set: `aes128-sha256-modp2048`

## Manual x509 creation

Rerun `gen_certs.sh` script. `pki` binary from strongswan-pki must be available

# More info

<https://wiki.strongswan.org/projects/strongswan/wiki/SimpleCA>