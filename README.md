# sico-ipsec

## building the dockers

`docker build -t sico_api -f sico_api.dockerfile . && docker build -t sico_net -f sico_net.dockerfile .`
`docker network create --subnet 10.69.0.0/24 sico`
## running the dockers

- `./run_api.sh`
- `./run_net.sh`

The app should be available on http://localhost:80
