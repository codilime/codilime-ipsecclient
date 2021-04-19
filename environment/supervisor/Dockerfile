FROM alpine:latest

RUN set -xe \
    && apk add --no-cache supervisor iproute2

COPY content/ipsec.sh /usr/local/sbin/
COPY content/ipsec-01.ini /etc/supervisor.d/


CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]