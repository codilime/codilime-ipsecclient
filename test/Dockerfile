FROM python:3-alpine

WORKDIR /usr/src/app

COPY . .
RUN apk add build-base && pip install --no-cache-dir -r requirements.txt

CMD [ "pytest", "-vv", "-s" ]
