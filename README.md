# sico-ipsec

## deployment

There are two `docker-compose.yml` files. The one in the `enviroment/` directory sets up a mock IPSec infrastructure. The one in the main directory builds and deploys our application. To run the app, first run `docker-compose up -d` in the `environment/` directory and then in the main directory. The frontend should be accessible on port 80.

You can build the docker images using `docker-compose build` (in both cases). However this step is performed as needed during `docker-compose up -d`, so there is no need to do that manually.
