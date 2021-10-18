# sico-ipsec

## building the dockers

`docker build -t sico_api -f sico_api.dockerfile . && docker build -t sico_net -f sico_net.dockerfile .`

## running the dockers

- `./run_api.sh`
- `./run_net.sh`

The app should be available on http://localhost:80

## enviroment variables for ipsec_backend binary

- `LOG_LEVEL` - specify logging level. Three levels available : error, info, debug.

## building docker for API unit tests

`docker build -t sico_api_ut -f sico_api_ut.dockerfile .`

## running API unit tests

`./run_api_ut.sh`
