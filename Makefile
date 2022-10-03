
LOWJS_FILE ?= lowjs-linux-aarch64-20210228_3479cc6.tar.gz

.PHONY: clean build

all: build


build:
	rm -Rf lowjs-linux-aarch64
	wget -N https://www.neonious-iot.com/lowjs/downloads/${LOWJS_FILE}
	tar xzvf lowjs-linux-aarch64*.gz
	mv `find . -type d -name "lowjs-linux-aarch64*"` lowjs-linux-aarch64
	docker -D buildx build --platform linux/arm64/v8 --tag escontainer_api_demo_armv8 .

clean: 
	rm -Rf lowjs-linux-aarch64
	rm -f lowjs-linux-aarch64*.gz
