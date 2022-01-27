# 	Copyright (c) 2021 Cisco and/or its affiliates
#
# 	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# 	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

FROM alpine:latest
ARG CONFIG

RUN apk add --no-cache bird --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community/

COPY content/bird.conf /etc/bird.conf
COPY content/$CONFIG/*.conf /etc/bird.d/

CMD bird -c /etc/bird.conf -d -s /etc/bird.d/bird.ctl