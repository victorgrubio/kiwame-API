FROM node:10.20.1-stretch-slim
# create destination directory
RUN mkdir -p /usr/src
# copy the app, note .dockerignore
COPY package.json /usr/src/
WORKDIR /usr/src
RUN npm install -g swagger gulp && \
    npm install basic-auth@1.1.0 basic-auth-connect@1.0.0 bcrypt@2.0.1 \
    body-parser csv-parser@2.3.2 \
    express@4.17.1 express-busboy@8.0.0 express-validator@2.21.0 \
    fast-stats@0.0.3 firebase-admin@8.11.0 fs@0.0.1-security \
    jimp@0.10.3 jsonwebtoken@8.5.1 kafka-node@5.0.0 mkdirp@1.0.4 \
    mongoose@5.9.12 mongoose-i18n-localize@0.3.0 \
    prompt@1.0.0 readable-stream@3.6.0 should@7.1.1 sparkpost@2.1.4 \
    supertest@1.2.0 swagger-express-mw@0.1.0 swagger-tools@0.10.4 \
    uuid@8.0.0 morgan-body@2.4.14 swagger-router@0.7.4 && \
    npm audit fix
COPY . /usr/src/
HEALTHCHECK --interval=5s --timeout=2s --start-period=30s \  
    CMD node /usr/src/healthcheck.js
ENTRYPOINT ["/bin/bash", "/usr/src/web_entrypoint.sh"]
