## how to install the two docker setup

1. build the sico_net image and save it
   - `docker build -t sico_net -f sico_network.dockerfile .`
   - `docker save sico_net > sico_net.tar`
   - `gzip -f sico_net.tar`
2. build the sico_api image (this uses the image built in the previous step):
   - `docker build -t sico_api -f sico_api.dockerfile .`
   - `docker save sico_api > sico_api.tar`
   - `gzip -f sico_api.tar`
3. make the file `sico_api.tar.gz` available somewhere for the switch to download
4. install and run the sico_api package on the switch:
   - `app-hosting install appid sico_api package http://<some_ip>/sico_api.tar.gz`
   - configure the `sico_api` app, including the restconf creds
   - `app-hosting activate appid sico_api`
   - `app-hosting start appid sico_api`
5. check the progress of deployment of the `sico_net` app
   - `app-hosting connect appid sico_api session sh`
   - `tail -f /tmp/api.log`
6. both the `sico_api` and `sico_net` apps should be running on the switch
