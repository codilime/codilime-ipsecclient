### STAGE 1a: Build Front ###
FROM node:12.7-alpine AS frontend-build
WORKDIR /usr/src/app
COPY ipsec-ui/package.json ipsec-ui/package-lock.json ./
RUN npm install
COPY ipsec-ui/src /usr/src/app/src/
COPY ipsec-ui/angular.json ipsec-ui/tsconfig.app.json ipsec-ui/tsconfig.json ipsec-ui/tsconfig.spec.json /usr/src/app/
RUN npm run dist

### STAGE 1b: Build API ###
FROM golang:1.16.3-alpine3.13 AS middleware-build
WORKDIR /usr/src/app
RUN apk add build-base
COPY ipsec-backend/go.mod .
COPY ipsec-backend/go.sum .
RUN go mod download
COPY ipsec-backend/ .
RUN go build

### STAGE 1c: Build go supervisor ###
FROM golang:1.16.3-alpine3.13 AS supervisor-build
WORKDIR /usr/src/app
RUN apk add build-base && apk add git && git clone https://github.com/ochinchina/supervisord && cd supervisord && git checkout v0.7.3 && go build

### Stage 2: create monolith ###

FROM alpine:3.13 AS sico_api

#Packages
RUN apk add --no-cache nginx gettext

#Supervisor
COPY --from=supervisor-build /usr/src/app/supervisord/supervisord /supervisord
COPY two_dockers/supervisord.conf /etc/supervisord.conf

#API
RUN mkdir -p /iox_data/appdata
COPY ipsec-backend/templates /templates
ADD "https://www.random.org/cgi-bin/randbyte?nbytes=10&format=h" skipcache
COPY --from=middleware-build /usr/src/app/ipsec_backend /usr/local/sbin/ipsec_api
COPY monolith/api.ini /etc/supervisor.d/

#Front
RUN mkdir /run/nginx
COPY ipsec-ui/nginx.conf /etc/nginx/conf.d/default.conf.template
COPY --from=frontend-build /usr/src/app/dist/ipsec-ui /usr/share/nginx/html
COPY monolith/front.ini /etc/supervisor.d/
COPY monolith/nginx.sh /usr/local/sbin/

CMD /supervisord
