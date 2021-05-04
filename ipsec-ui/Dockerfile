### STAGE 1: Build ###
FROM node:12.7-alpine AS frontend-build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY src /usr/src/app/src/
COPY angular.json tsconfig.app.json tsconfig.json tsconfig.spec.json /usr/src/app/
RUN npm run build

### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=frontend-build /usr/src/app/dist/ipsec-ui /usr/share/nginx/html
