FROM alpine:3.13 AS sico_net

#Packages
RUN apk add --no-cache strongswan supervisor jq tcpdump
RUN apk add --no-cache bird --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community/

#Strongswan
COPY docker/ipsec.ini /etc/supervisor.d/
COPY docker/ipsec_reload.sh /usr/local/sbin/
COPY docker/ipsec_reload.ini /etc/supervisor.d/
COPY docker/strongswan_content/no_route.conf /etc/strongswan.d/no_route.conf
COPY docker/ipsec_reload.ini /etc/supervisor.d/
COPY docker/ipsec_reload.sh /usr/local/sbin/

RUN ln -s /etc/swanctl/conf.d /opt/ipsec
RUN chown -R ipsec:ipsec /etc/swanctl

#Bird
COPY docker/bird_content/bird.conf /etc/bird.conf
COPY docker/bird.ini /etc/supervisor.d/
RUN mkdir /etc/bird.d/
RUN ln -s /etc/bird.d /opt/bird

#Supervisor
COPY docker/supervisord_net.conf /etc/supervisord.conf
COPY docker/supervisor_content/ipsec.sh /usr/local/sbin/

CMD /usr/bin/supervisord -n -c /etc/supervisord.conf
