# 	Copyright (c) 2021 Cisco and/or its affiliates
#
# 	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# 	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

FROM golang:1.16.3-alpine3.13 AS ipsecclient_ut

#Packages
RUN apk add nginx build-base tzdata

ENV CGO_CPPFLAGS="-DSQLITE_ENABLE_DBSTAT_VTAB=1"
ENV CGO_LDFLAGS="-lm"
WORKDIR /run
COPY ipsec-backend/go.mod .
COPY ipsec-backend/go.sum .
RUN go mod download
COPY ipsec-backend /run
RUN go build

CMD go test -v ./...
