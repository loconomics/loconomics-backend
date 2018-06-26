FROM node:9-alpine
ENV NODE_ENV production
EXPOSE 1337
WORKDIR /home/node
COPY package.json yarn.lock ./
RUN yarn
COPY ./ ./
USER node
CMD node .
