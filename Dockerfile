FROM node:6-alpine
RUN mkdir /app
WORKDIR /app
ADD package.json ./
ADD yarn.lock ./
RUN yarn
#hack react-native/local-cli/setup_env.sh
RUN echo "#!/usr/bin/env sh" > /tmp/setup_env.sh &&\
    cat /app/node_modules/react-native/local-cli/setup_env.sh >> /tmp/setup_env.sh &&\
    mv  /tmp/setup_env.sh  /app/node_modules/react-native/local-cli/setup_env.sh &&\
    chmod +x  /app/node_modules/react-native/local-cli/setup_env.sh
ADD .babelrc ./
ADD index* ./
ADD src ./
CMD yarn start
