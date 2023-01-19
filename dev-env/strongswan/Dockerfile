# 	Copyright (c) 2021 Cisco and/or its affiliates
#
# 	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# 	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

FROM alpine:latest
ARG CONFIG

RUN apk add --no-cache strongswan

COPY content/$CONFIG/entrypoint.sh /
RUN chmod 0755 /entrypoint.sh

COPY content/$CONFIG/*.conf /etc/swanctl/conf.d/
COPY content/$CONFIG/peerCert*.pem /etc/swanctl/x509/
COPY content/$CONFIG/peerKey*.pem /etc/swanctl/rsa/
RUN chown -R ipsec:ipsec /etc/swanctl

COPY content/no_route.conf /etc/strongswan.d/no_route.conf

#COPY content/xfrm.sh /xfrm.sh
#RUN chmod 0755 /xfrm.sh

#RUN echo '%ipsec ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/ipsec
#RUN chmod 0440 /etc/sudoers.d/ipsec

#ENTRYPOINT ["/entrypoint.sh"]
CMD /entrypoint.sh