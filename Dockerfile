FROM node:9-alpine
ENV NODE_ENV production
EXPOSE 1337 2222
RUN apk add --no-cache openssh-server
RUN echo "root:Docker!" | chpasswd
ADD azure/etc/sshd_config /etc/ssh/
ADD azure/bin/start.sh /usr/bin/
RUN chmod +x /usr/bin/start.sh
RUN mkdir /opt/app
WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn
COPY ./ ./
CMD /usr/bin/start.sh
