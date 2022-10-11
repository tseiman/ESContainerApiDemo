# ESContainerApiDemo for Container enabled Sierra Wireless AirLink OS (such as on XR80/90 or RV55) 
Demonstration how to build a Docker container for the Sierra Wireless Docker enabled routers
The demo will setup a docker image with NodeJS. The WebApplication running on NodeJS provides an example GUI which indirectly will make use of the router API for WiFi Client management (and which is accessible under 8080 for HTTP and 8443 for HTTPS).
The router will give the container an own IP address such as 192.168.1.100 - so you should be able to reach the application under https://192.168.1.100:8443

## Content
  * [Target Platforms](#user-content-target-platforms)
  * [Demo Usecase](#user-content-demo-usecase)
    + [Architecture](#user-content-architecture)
  * [ToDo](#user-content-todo)
  * [requires:](#user-content-requires)
  * [What does this do ?](#user-content-what-does-this-do-)
  * [build & run & archive](#user-content-build--run--archive)
    + [Run image on AirLink OS](#user-content-run-image-on-airlink-os)
  * [security](#user-content-security)
    + [Browser blocking self signed demo certificate](#user-content-browser-blocking-self-signed-demo-certificate)

## Demo Usecase
![Demo Usecase](/doc/ESContainerAPIDemoUsecase.png)
This demo shows how a container application can be build and how such an application makes use of the AirLink OS API. A common use case for that can be a custom (3rd party branded (may web/http)) configuration user interfaces which help to change settings on the router in a more controlled and simple way as it would be possible through the normal configuration user interface. This demo shows the list of scanned WiFi stations the router received. This WiFi stations can be selected and configured (TBD).

### Architecture
An architectural overview:
![Demo Architecture](/doc/ESContainerDemoApp.png)

## Target Platforms
- Armv8 based Docker routers such as Sierra Wireless XR80, XR90
The scripts can be easily adopted to other architectures like armv7 e.g. built in Sierra Wireless RV55 

## ToDo
- Enable a WiFi selection - currently only wifi networks are listed

## Requires
For **building** the Container image from scratch the folowing things might be required:
- linux environment
- docker buildx   (check availability with ```docker buildx version```) if you do not have *docker buildx* installed you may follow buildx installation steps, binary installation might be the easiest one:
https://github.com/docker/buildx#binary-release
- we want to build on likely different platform (e.g. amd64) the docker image as it is targeted for (e.g. Armv8) - so everything needs to be prepared for cross image build which requires typically qemu on ubuntu you install this with: ```sudo apt install qemu qemu-user-static qemu-user binfmt-support``` 
Check proper binfmt config with:

```

cat /proc/sys/fs/binfmt_misc/qemu-aarch64
enabled
interpreter /usr/bin/qemu-aarch64-static
...
 
cat /proc/sys/fs/binfmt_misc/qemu-arm
enabled
interpreter /usr/bin/qemu-arm-static
...
```

## What does this do ?
this setup will install the NodeJS Armv8 package from Alpine Linux distribution. For the WebApplication from the *src* directory *npm* is executed to download required *node_modules*. Node_modules which need to be present in production and the WebApplication is then added to the docker image as well.
Finally a command is set to execute NodeJS with the WebApplication.

## Build & Run & Archive
Create the image on the local 
```
make build
```
For testing you can run the container locally and it will execute the Armv8 container in an qemu environment.
```
docker run -p 8080:8080 -p 8443:8443 escontainer_api_demo_armv8
```
this is a good way to debug and test locally. The Application is in that case available on https://localhost:8443 .

To export a loadable image you run

```
make image
```
this will create a tar file (escontainer_api_demo_armv8_<date>.tar) containing the docker image - this can be directly uploaded to the Armv8 XR80 (or with adaptations to Armv7 RV55)

### Run image on AirLink OS
Log in (locally - e.g. by accessing the default IP https://192.168.1.1) and navigate to **[Apps]** --> **[Images]**
Upload the **tar** image to the router (the ready made image might be ZIPed and needs to be unzipped before):
![Loading the image](/doc/image_loading_screenshot.png)
Wait until the status is marked as ready.
Now instantiate the image to a running container:
![container instantiation](/doc/container_creation_screenshot.png)
![container instantiation](/doc/container_creation2_screenshot.png)
1. Fill a name for the container
2. select the image loaded previously
3. set the command ```/usr/bin/node --max_old_space_size=128 /app/index.js -a https://<IP of the Router> -u <user with api rights> -p <somepasword for the user>``` - e.g. ```/usr/bin/node --max_old_space_size=128 /app/index.js -a https://192.168.1.1 -u admin -p somepassword``` - please note it is not recommended to use the admin user and password to access the API.
4. click create ad check if the container status changes to *"running"* after a while

You can now access the WebUI of the Demo by accessing the IP of the container. You can check this from the **[Networking]** --> **[DHCP (Assignment)]** Page:
![DHCP container IP assignment](/doc/networking_dhcp_screenshot.png)
You might change the IP to something more useful from here.
In that case you can access the container by http://192.168.1.100


## Security
__Please note: the setup comes with default certificates - which are snake oil. For any security please substitute those trough useful ones!__
Please do not use admin user for API access

### Browser blocking self signed demo certificate
Browsers will likely not accept the self signed certificate. It will come up with an error message like "This connection is not private" (Safari) or "Your connection is not secure" (Chrome). 
If you are sure you are accessing the demo you likely want to override that (you should be sure that you are accessing the container demo server).
Most of the browsers will offer you an "advanced" or "details" or similar button - after clicking that there is typically a button (like "Open the webpage" or "Proceed") to open the page anyhow. Nevertheless there are Chrome settings and versions which give you an error message *NET::ERR_CERT_INVALID* - here is no option given to proceed anyhow - but still you can proceed by __typing blindly into the window with the error message "thisisunsafe"__ and Chrome will proceed. 
