
APP_NAME ?= escontainer_api_demo_armv8

.PHONY: clean build app image

all: build

image:
	docker save ${APP_NAME} -o ${APP_NAME}.tar

build: app
	docker -D buildx build --platform linux/arm64/v8 --tag ${APP_NAME} .

app:
	cd src && npm install

clean: 
	rm -Rf *.tar /src/node_modules
