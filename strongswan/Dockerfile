FROM alpine:latest
ARG CONFIG

RUN set -xe \
    && apk add --no-cache strongswan sudo

COPY content/entrypoint.sh /entrypoint.sh
RUN chmod 0755 /entrypoint.sh

COPY content/$CONFIG /etc/swanctl/swanctl.conf
COPY content/no_route.conf /etc/strongswan.d/no_route.conf

COPY content/xfrm.sh /xfrm.sh
RUN chmod 0755 /xfrm.sh

RUN echo '%ipsec ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/ipsec
RUN chmod 0440 /etc/sudoers.d/ipsec

ENTRYPOINT ["/entrypoint.sh"]
