### STAGE 1: Build ###
FROM golang:1.16.3-alpine3.13 AS middleware-build
WORKDIR /usr/src/app
RUN apk add build-base
COPY go.mod .
COPY go.sum .
RUN go mod download
COPY . .
RUN go build

### STAGE 2: Run ###
FROM alpine:3.13.5 AS middleware-run
COPY templates /templates
ADD "https://www.random.org/cgi-bin/randbyte?nbytes=10&format=h" skipcache
COPY --from=middleware-build /usr/src/app/ipsec_backend /ipsec_backend

CMD /ipsec_backend
