### STAGE 1a: Build Front ###
FROM node:14.18-alpine AS frontend-build
WORKDIR /usr/src/app
COPY ipsec-ui-react/package.json ./
COPY ipsec-ui-react/webpack.config.prod.js /usr/src/app/
COPY ipsec-ui-react/tsconfig.json /usr/src/app/
RUN npm install -g webpack webpack-cli && npm install
COPY ipsec-ui-react/package-lock.json ./
COPY ipsec-ui-react/src /usr/src/app/src/
COPY ipsec-ui-react/public /usr/src/app/public/
RUN npm run build


### STAGE 1b: Build API ###
FROM golang:1.16.3-alpine3.13 AS middleware-build
ENV CGO_CPPFLAGS="-DSQLITE_ENABLE_DBSTAT_VTAB=1"
ENV CGO_LDFLAGS="-lm"
WORKDIR /usr/src/app
RUN apk add build-base
COPY ipsec-backend/go.mod .
COPY ipsec-backend/go.sum .
RUN go mod download
COPY ipsec-backend/ .
RUN go build

### Stage 2: create the sico_api docker ###

FROM alpine:3.13 AS sico_api

ARG VERSION=unspecified
LABEL APP_VERSION=$VERSION
ENV APP_VERSION=$VERSION

#Packages
RUN apk add --no-cache nginx gettext supervisor curl sqlite tzdata strongswan jq tcpdump haproxy curl

#volumes
RUN mkdir -p /opt/ipsec/ && \
    mkdir -p /opt/frr/ && \
    mkdir -p /opt/super/ && \
    mkdir -p /opt/super_net/ && \
    mkdir -p /opt/super_api/ && \
    mkdir -p /opt/logs/

#API
RUN mkdir -p /iox_data/appdata
ADD "https://www.random.org/cgi-bin/randbyte?nbytes=10&format=h" skipcache
COPY ipsec-backend/config/templates /templates
COPY ipsec-backend/config/hw_templates /hw_templates
COPY --from=middleware-build /usr/src/app/ipsec_backend /usr/local/sbin/ipsec_api
COPY docker/api.ini /etc/supervisor.d/

#Front
RUN mkdir /run/nginx
COPY ipsec-ui-react/nginx.conf /etc/nginx/conf.d/default.conf.template
COPY ipsec-ui-react/selfsigned.crt /etc/ssl/certs/nginx-selfsigned.crt
COPY ipsec-ui-react/selfsigned.key /etc/ssl/private/nginx-selfsigned.key
COPY ipsec-ui-react/dhparam.pem /etc/ssl/certs/dhparam.pem
COPY --from=frontend-build /usr/src/app/dist/ /usr/share/nginx/html
COPY docker/front.ini /etc/supervisor.d/
COPY docker/nginx.sh /usr/local/sbin/

#Strongswan
COPY docker/ipsec.ini /etc/supervisor.d/
COPY docker/ipsec_reload.sh /usr/local/sbin/
COPY docker/ipsec_reload.ini /etc/supervisor.d/
COPY docker/strongswan_content/no_route.conf /etc/strongswan.d/no_route.conf
COPY docker/strongswan_content/status.sh /usr/local/bin/
COPY docker/ipsec_reload.ini /etc/supervisor.d/
COPY docker/ipsec_reload.sh /usr/local/sbin/

RUN mkdir -p /opt/ipsec/conf && rm -rf /etc/swanctl/conf.d && ln -s /opt/ipsec/conf /etc/swanctl/conf.d && \
    mkdir /opt/ipsec/x509ca && rm -rf /etc/swanctl/x509ca && ln -s /opt/ipsec/x509ca /etc/swanctl/x509ca && \
    mkdir /opt/ipsec/x509 && rm -rf /etc/swanctl/x509 && ln -s /opt/ipsec/x509 /etc/swanctl/x509 && \
    mkdir /opt/ipsec/rsa && rm -rf /etc/swanctl/rsa && ln -s /opt/ipsec/rsa /etc/swanctl/rsa

RUN chown -R ipsec:ipsec /etc/swanctl



#FRR
COPY docker/frr_content/frr-7.5.1.apk /tmp/
COPY docker/frr.sh /usr/local/sbin/
COPY docker/frr.ini /etc/supervisor.d/
COPY docker/reload_vtysh.ini /etc/supervisor.d/
RUN apk add --allow-untrusted /tmp/frr-7.5.1.apk
RUN rm /tmp/frr-7.5.1.apk
RUN rm /etc/frr/*
COPY docker/frr_content/daemons /etc/frr/daemons
COPY docker/frr_content/frr.conf /etc/frr/
COPY docker/frr_content/vtysh.conf /etc/frr/
COPY docker/reload_vtysh.sh /usr/local/sbin/

#Supervisor API
COPY docker/supervisord.conf /etc/supervisord.conf
RUN ln -s /etc/supervisor.d /opt/super_api
COPY docker/supervisor_content/ipsec.sh /usr/local/sbin/

COPY docker/start_script.sh /usr/local/sbin/

CMD /usr/local/sbin/start_script.sh
