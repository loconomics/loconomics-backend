FROM node:9-alpine
ENV NODE_ENV production
EXPOSE 3000
RUN mkdir /app
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY ./ ./
USER node
CMD node .
