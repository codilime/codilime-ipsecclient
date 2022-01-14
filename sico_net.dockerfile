# 	Copyright (c) 2021 Cisco and/or its affiliates
#
# 	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# 	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

FROM alpine:3.13 AS sico_net

ARG VERSION=unspecified
LABEL APP_VERSION=$VERSION

#Packages
RUN apk add --no-cache strongswan supervisor jq tcpdump

#Strongswan
COPY docker/ipsec.ini /etc/supervisor.d/
COPY docker/ipsec_reload.sh /usr/local/sbin/
COPY docker/ipsec_reload.ini /etc/supervisor.d/
COPY docker/strongswan_content/no_route.conf /etc/strongswan.d/no_route.conf
COPY docker/strongswan_content/status.sh /usr/local/bin/
COPY docker/ipsec_reload.ini /etc/supervisor.d/
COPY docker/ipsec_reload.sh /usr/local/sbin/

RUN mkdir -p /opt/ipsec/conf && rm -rf /etc/swanctl/conf.d && ln -s /opt/ipsec/conf /etc/swanctl/conf.d && \
    mkdir /opt/ipsec/x509ca && rm -rf /etc/swanctl/x509ca && ln -s /opt/ipsec/x509ca /etc/swanctl/x509ca && \
    mkdir /opt/ipsec/x509 && rm -rf /etc/swanctl/x509 && ln -s /opt/ipsec/x509 /etc/swanctl/x509 && \
    mkdir /opt/ipsec/rsa && rm -rf /etc/swanctl/rsa && ln -s /opt/ipsec/rsa /etc/swanctl/rsa

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
