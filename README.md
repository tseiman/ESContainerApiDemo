# ESContainerApiDemo
Demonstration how to build a Docker container for the Sierra Wireless Docker enabled routers
The demo will setup a docker image with NodeJS. The WebApplication basedrunning on NodeJS provides an example GUI which indirectely will make use of the router API for WiFi Client managment (and which is accessible under 8080 for HTTP and 8443 for HTTPS).
The router will give the container an own IP address such as 192.168.1.100 - so you should be able to reach the application under https://192.168.1.100:8443

## Target Platforms
- Armv8 based Docker routers such as Sierra Wireless XR80, XR90

The scripts can be easily adopted to other architectures like armv7 e.g. built in Sierra Wirleess RV55 

## requires:
- linux environment
- docker buildx   (check with ```docker builx version```)

## What does this do ?
this setup will download the __lowjs__ Armv8 implementation from the LowJS distribution webpage. It will extract LowJS and bundle it wit hhte WebApplication

## build
```make build```

## security
**Please note: the setup comes with default certificates - which are snake oil. For any security please substitute those trough useful ones!*
*