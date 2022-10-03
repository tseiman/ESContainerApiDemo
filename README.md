# ESContainerApiDemo
Demonstration how to build a Docker container for the Sierra Wireless Docker enabled routers
The demo will setup a docker image with a LowJS which is a small version of NodeJS. The WebApplicaiton LowJs provides (and which is accessible under 8080 for HTTP and 8443 for HTTPS).
The router will give the container an own IP address such as 192.168.1.100 - so you should be able to reach the application under https://192.168.1.100:8443

## Target Platforms
- Armv8 based Docker routers such as Sierra Wireless XR80, XR90

The scripts can be easily adopted to other architectures like armv7 e.g. built in Sierra Wirleess RV55 

## requires:
- linux build environment
- docker buildx   (check with ```docker builx version```)
- wget
- openssl for selfsigned certificates

## What does this do ?
this setup will download the __lowjs__ Armv8 implementation from the LowJS distribution webpage. It will extract LowJS and bundle it wit hhte WebApplication
