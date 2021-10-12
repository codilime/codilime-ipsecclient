FROM docker:20.10.9-alpine3.14

WORKDIR /usr/src/app

RUN apk add --no-cache python3 py3-pip

COPY . .
RUN pip3 install --no-cache-dir -r requirements.txt

CMD [ "pytest", "-s" ]
# CMD [ "tail", "-f", "/dev/null" ]
