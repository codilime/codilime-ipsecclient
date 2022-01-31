# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

FROM docker:20.10.9-alpine3.14

WORKDIR /usr/src/app

RUN apk add --no-cache python3 py3-pip

COPY ./test .
COPY ./ipsec-backend/ansible ./ansible
RUN pip3 install --no-cache-dir -r requirements.txt

ENTRYPOINT [ "pytest", "-s" ]
# CMD [ "tail", "-f", "/dev/null" ]
