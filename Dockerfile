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

### Stage 2: create monolith ###

FROM alpine:3.13 AS monolith

#Packages
RUN apk add --no-cache strongswan nginx supervisor gettext jq
RUN apk add --no-cache bird --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community/

#API
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

#Strongswan
COPY monolith/ipsec.ini /etc/supervisor.d/
COPY monolith/ipsec_reload.sh /usr/local/sbin/
COPY monolith/ipsec_reload.ini /etc/supervisor.d/
COPY environment/strongswan/content/no_route.conf /etc/strongswan.d/no_route.conf

RUN ln -s /etc/swanctl/conf.d /opt/ipsec
RUN chown -R ipsec:ipsec /etc/swanctl

#Bird
COPY environment/bird/content/bird.conf /etc/bird.conf
COPY monolith/bird.ini /etc/supervisor.d/
RUN mkdir /etc/bird.d/
RUN ln -s /etc/bird.d /opt/bird

#Supervisor
COPY environment/supervisor/content/supervisord.conf /etc/
COPY environment/supervisor/content/ipsec.sh /usr/local/sbin/
RUN ln -s /etc/supervisor.d /opt/super

CMD /usr/bin/supervisord -n -c /etc/supervisord.conf
