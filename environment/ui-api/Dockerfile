FROM ubuntu:20.04

RUN apt update && apt install -y nginx

COPY nginx_default /etc/nginx/sites-available/default
COPY ipsec_backend /ipsec_backend
COPY frontend /frontend
COPY entrypoint.sh /
RUN chmod 0755 /entrypoint.sh

CMD ["/entrypoint.sh"]
