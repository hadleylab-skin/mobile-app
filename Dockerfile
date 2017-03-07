FROM node:6-alpine
RUN yarn global add react-native-cli@^2.0.1
RUN yarn global add http-server
RUN mkdir -p /app/dist
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
ADD src ./src
RUN react-native bundle --platform ios --dev false --entry-file index.ios.js --bundle-output /app/dist/index.ios.bundle --assets-dest /app/dist
CMD yarn assets
