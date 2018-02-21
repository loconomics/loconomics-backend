FROM node:9-alpine
ENV NODE_ENV production
RUN mkdir /app
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY ./ ./
RUN adduser -DHS app
USER app
CMD node .
