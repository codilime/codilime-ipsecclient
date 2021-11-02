FROM docker:20.10.9-alpine3.14

WORKDIR /usr/src/app

RUN apk add --no-cache python3 py3-pip ansible

COPY ./test .
COPY ./ipsec-backend/ansible ./ansible
COPY ./test/ansible/vars.yml ./ansible
RUN pip3 install --no-cache-dir -r requirements.txt

ENTRYPOINT [ "pytest", "-s" ]
# CMD [ "pytest", "-s" ]
# CMD [ "pytest", "-s", "-o", "log_cli=true", "--log-cli-level=INFO" ]
# CMD [ "pytest", "-s", "--log-cli-level=INFO" ]
# CMD [ "tail", "-f", "/dev/null" ]
