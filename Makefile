
APP_NAME ?= escontainer_api_demo_armv8

# DATE = $(shell date +%Y%m%d%H%M%S)
FILE_NAME ?= ${APP_NAME}_$(shell date +%Y%m%d%H%M%S).tar

.PHONY: clean build app image clean_docker

all: build

image:
	docker save ${APP_NAME} -o ${FILE_NAME}

build: app
	docker -D buildx build --platform linux/arm64/v8 --tag ${APP_NAME} .

app: cert
	cd src && npm install

cert:
	cd src/cert && openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -sha256 -days 3650 -nodes -subj "/C=DE/O=github.com\/tseiman/OU=ESContainerApiDemo/CN=tseiman.de"


clean: 
	rm -Rf *.tar /src/node_modules

clean_docker:
	@echo -n "Are you sure? [y/N] " && read ans && [ $${ans:-N} = y ]
	docker stop $(docker ps -a -q); docker rm $(docker ps -a -q); docker rmi $(docker images -a -q)
