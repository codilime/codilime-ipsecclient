FROM alpine:latest
ARG CONFIG

RUN apk add --no-cache supervisor iproute2

COPY content/supervisord.conf /etc/
COPY content/$CONFIG/*.ini /etc/supervisor.d/
COPY content/ipsec.sh /usr/local/sbin/

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]