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

## additional scripts

Build the dockers. Pass `--clean` flag in order to remove docker images and containers. Pass `--csr-vm` flag followed by path to csr-vm and path to csr_config.iso in order to run csr-vm.  
- `./build.py [-h] [--csr-vm <csr-vm path> <csr_config.iso path>] [--clean]`

Build and run e2e tests. Pass `--csr-vm` in order to run test cases with csr-vm. Pass `-k` in order to run only tests which match the given substring expression.  
- `./run_e2e_tests.py [-h] [--csr-vm] [-k EXPRESSION]`
