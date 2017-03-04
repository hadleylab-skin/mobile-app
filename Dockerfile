FROM node:6-alpine
RUN npm i -g yarn
RUN mkdir /app
WORKDIR /app
ADD package.json ./
ADD yarn.lock ./
RUN yarn
ADD .babelrc
ADD index* ./
ADD src ./
CMD yarn start

