FROM alpine:latest
COPY lowjs-linux-aarch64  /lowjs-linux-aarch64 
COPY src  /app
EXPOSE 8080/tcp
EXPOSE 8443/tcp
CMD /lowjs-linux-aarch64/bin/low /app/index.js
