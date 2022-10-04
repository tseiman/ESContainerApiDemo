FROM alpine:latest
RUN apk update && apk add libc6-compat nodejs
COPY src  /app
EXPOSE 8080/tcp
EXPOSE 8443/tcp
CMD /usr/bin/node --max_old_space_size=128 /app/index.js
