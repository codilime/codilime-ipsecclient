# sico-ipsec

## building the dockers

`docker build -t sico_api -f sico_api.dockerfile . && docker build -t sico_net -f sico_net.dockerfile .`

## running the dockers

- `./run_api.sh`
- `./run_net.sh`

The app should be available on http://localhost:80

## enviroment variables for ipsec_backend binary

- `LOG_LEVEL` - specify logging level. Three levels available : error, info, debug.
- `TZ` - specify time zone. You can do it by specifying exact time zone `TZ=America/Los_Angeles` or get the time zone from `/etc/timezone` `TZ=$(cat /etc/timezone)`. Time zone is used in the error time. 
- `ERR_ROT_DAYS` - error rotation - days. This value is used to trigger rotation based on days.
- `ERR_ROT_SIZE` - error rotation - database size in KB. This value is used to trigger rotation based on database size.

## check version of the app

`docker inspect -f {{.Config.Labels.APP_VERSION}} sico_api`
`docker inspect -f {{.Config.Labels.APP_VERSION}} sico_net`

## running API unit tests

`docker build -t sico_api_ut -f sico_api_ut.dockerfile .`  
`./run_api_ut.sh`  
or  
inside `ipsec-backend` directory run `CGO_CPPFLAGS="-DSQLITE_ENABLE_DBSTAT_VTAB=1" CGO_LDFLAGS="-lm" go test -v`

## additional scripts

Build the dockers:  
  
`./build.py [-h] [--csr-vm <csr-vm path> <csr_config.iso path>] [--clean] [--pack]`
- `--csr-vm <csr-vm path> <csr_config.iso path>` - run csr-vm
- `--clean` - remove docker images and containers
- `--pack` - create package in the `out` directory

Build and run e2e tests:  
  
`./run_e2e_tests.py [-h] [--csr-vm] [-k EXPRESSION]`
- `--csr-vm` - run test cases with csr-vm
- `-k EXPRESSION` pytest flag: only run tests which match the given substring expression. Example: -k 'test_method or test_other' matches all test functions and classes whose name contains 'test_method' or 'test_other'.
