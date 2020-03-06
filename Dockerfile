FROM node:10.13
COPY . /app
WORKDIR /app
RUN npm install pm2@3.5.0 -g --registry=https://registry.npm.taobao.org
RUN make install-lib
RUN chmod +x /app/docker-entrypoint.sh
ONBUILD COPY ./config.yaml /app
ONBUILD RUN node ./config-parser.js
ONBUILD RUN make build-all
ENTRYPOINT [ "./docker-entrypoint.sh" ]
CMD ["pm2-runtime", "start", "process.json", "--env=docker"]
EXPOSE 7051
