# ESContainerApiDemo for Container enabled Sierra Wireless AirLink OS (such as on XR80/90 or RV55)
Demonstration how to build a Docker container for the Sierra Wireless Docker enabled routers
The demo will setup a docker image with NodeJS. The WebApplication running on NodeJS provides an example GUI which indirectely will make use of the router API for WiFi Client managment (and which is accessible under 8080 for HTTP and 8443 for HTTPS).
The router will give the container an own IP address such as 192.168.1.100 - so you should be able to reach the application under https://192.168.1.100:8443

## Content
  * [Target Platforms](#target-platforms)
  * [ToDo](#todo)
  * [requires:](#requires-)
  * [What does this do ?](#what-does-this-do--)
  * [build & run & archive](#build---run---archive)
    + [Run image on AirLink OS](#run-image-on-airlink-os)
  * [security](#security)

## Target Platforms
- Armv8 based Docker routers such as Sierra Wireless XR80, XR90
The scripts can be easily adopted to other architectures like armv7 e.g. built in Sierra Wireless RV55 

## ToDo
- Enable a WiFi selection - currently only wifi networks are listed

## requires:
- linux environment
- docker buildx   (check availability with ```docker builx version```) if you do not have *docker buildx* installed you may follow buildx installation steps, binary installation might be the easiest one:
https://github.com/docker/buildx#binary-release
- we want to build on likely different platform (e.g. amd64) the docker image as it is targeted for (e.g. Armv8) - so everything needs to be preapred for cross image build which requires typically qemu on ubuntu you install this with: ```sudo apt install qemu qemu-user-static qemu-user binfmt-support``` 
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
Finally a comand is set to execute NodeJS with the WebApplication.

## build & run & archive
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
this will create a tar file (escontainer_api_demo_armv8_<date>.tar) containing the docker image - this can be directly uploaded to the Armv8 XR80 (or with adaptaions to Armv7 RV55)

### Run image on AirLink OS
Log in (locally - e.g. by accessing the defualt IP https://192.168.1.1) and navigate to **[Apps]** --> **[Images]**
Upload the **tar** image to the router (the ready made image might be ZIPed and needs to be unzipped before):
![Loading the image](/doc/image_loading_screenshot.png)
Wait until the status is marked as ready.
Now instanciate the image to a running container:
![container instanceiation](/doc/container_creation_screenshot.png)
![container instanceiation](/doc/container_creation2_screenshot.png)
1. Fill a name for the container
2. select the image loaded previously
3. set the command ```/usr/bin/node --max_old_space_size=128 /app/index.js -a https://<IP of the Router> -u <user with api rights> -p <somepasword for the user>``` - e.g. ```/usr/bin/node --max_old_space_size=128 /app/index.js -a https://192.168.1.1 -u admin -p somepassword``` - please note it is not recommended to use the adin user and password to access the API.
4. click create ad check if the container status changes to *"running"* after a while

You can now access the WebUI of the Demo by accessing the IP of the container. You can check this from the **[Networking]** --> **[DHCP (Assignment)]** Page:
![DHCP container IP assignment](/doc/networking_dhcp_screenshot.png)
You might change the IP to something more useful from here.
In that case you can access the container by http://192.168.1.100


## security
__Please note: the setup comes with default certificates - which are snake oil. For any security please substitute those trough useful ones!__
Please do not use admin user for API access
