FROM alpine:3.13 AS sico_net

#Packages
RUN apk add --no-cache strongswan supervisor jq tcpdump

#Strongswan
COPY docker/ipsec.ini /etc/supervisor.d/
COPY docker/ipsec_reload.sh /usr/local/sbin/
COPY docker/ipsec_reload.ini /etc/supervisor.d/
COPY docker/strongswan_content/no_route.conf /etc/strongswan.d/no_route.conf
COPY docker/ipsec_reload.ini /etc/supervisor.d/
COPY docker/ipsec_reload.sh /usr/local/sbin/

RUN ln -s /etc/swanctl/conf.d /opt/ipsec
RUN ln -s /etc/swanctl/x509ca /opt/ipsec/x509ca
RUN ln -s /etc/swanctl/x509 /opt/ipsec/x509
RUN ln -s /etc/swanctl/rsa /opt/ipsec/rsa

RUN chown -R ipsec:ipsec /etc/swanctl

#FRR
COPY docker/frr_content/frr-7.5.1.apk /tmp/
COPY docker/frr.sh /usr/local/sbin/
COPY docker/frr.ini /etc/supervisor.d/
COPY docker/reload_vtysh.ini /etc/supervisor.d/
RUN apk add --allow-untrusted /tmp/frr-7.5.1.apk
RUN rm /tmp/frr-7.5.1.apk
RUN rm /etc/frr/*
COPY docker/frr_content/daemons /etc/frr/daemons
COPY docker/frr_content/frr.conf /etc/frr/
COPY docker/frr_content/vtysh.conf /etc/frr/
COPY docker/reload_vtysh.sh /usr/local/sbin/

#Supervisor
COPY docker/supervisord_net.conf /etc/supervisord.conf
COPY docker/supervisor_content/ipsec.sh /usr/local/sbin/

CMD /usr/bin/supervisord -n -c /etc/supervisord.conf
