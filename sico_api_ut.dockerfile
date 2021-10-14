FROM golang:1.16.3-alpine3.13 AS sico_api_ut

#Packages
RUN apk add nginx build-base

COPY ipsec-backend /run
WORKDIR /run
RUN go build

CMD go test -v
