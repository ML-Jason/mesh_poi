FROM keymetrics/pm2:12-stretch
# FROM node:12-stretch
# EXPOSE 80

RUN apt-get update
RUN apt-get -y install vim

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . .
# Install app dependencies
WORKDIR /usr/src/app/frontend
# RUN cd /usr/src/app/frontend
RUN npm install
RUN npm run build

WORKDIR /usr/src/app/backend
# RUN cd /usr/src/app/backend
RUN npm install
# RUN npm run build
RUN rm -rf /usr/src/app/frontend

CMD pm2-runtime start server/pm2/production.json
