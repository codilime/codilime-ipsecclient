FROM alpine:3.13 AS sico_net

#Packages
RUN apk add --no-cache strongswan supervisor jq tcpdump
RUN apk add --no-cache bird --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community/

#Strongswan
COPY monolith/ipsec.ini /etc/supervisor.d/
COPY monolith/ipsec_reload.sh /usr/local/sbin/
COPY monolith/ipsec_reload.ini /etc/supervisor.d/
COPY environment/strongswan/content/no_route.conf /etc/strongswan.d/no_route.conf
COPY monolith/ipsec_reload.ini /etc/supervisor.d/
COPY monolith/ipsec_reload.sh /usr/local/sbin/

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
