
APP_NAME ?= escontainer_api_demo_armv8

# DATE = $(shell date +%Y%m%d%H%M%S)
FILE_NAME ?= ${APP_NAME}_$(shell date +%Y%m%d%H%M%S).tar

.PHONY: clean build app image

all: build

image:
	docker save ${APP_NAME} -o ${FILE_NAME}

build: app
	docker -D buildx build --platform linux/arm64/v8 --tag ${APP_NAME} .

app:
	cd src && npm install

clean: 
	rm -Rf *.tar /src/node_modules
