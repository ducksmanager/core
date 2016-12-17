# mariadb-server-setup-helper
A simple way to setup MariaDB databases talking to each other.

### Customization

* Add instruction to the `Dockerfile` if desired.
* Edit `container.properties` if desired. It contains the root password of the database that is to be created.

### Image creation

```bash
bash docker-create-image.sh <image_name>
```

Where 
* `<image_name>` is the desired name of the local image to build from the Dockerfile, for example `mariadb-server`.

### Container creation

```bash
bash docker-create-container.sh <image_name> <container_name> <host_port> <network_name>
```

Where
* `<image_name>` is the name of the local image previously built, for example `mariadb-server`.
* `<container_name>` is the desired name of the container, for example `mariadb-server-box-1`.
* `<host_port>` is the desired host port to bind to MySQL.
* `<network_name>` is the name of the network name. If two containers have the same network name they can talk to each other

### Provisionning

The scripts in ./scripts on the host are always synced with the container's /home/scripts/ scripts.
 
Don't forget to set the "+x" permission before executing scripts.

```bash
$ echo -e "#!/bin/bash\n\necho 'Hi'" > scripts/myscript.sh
$ docker exec -it <container_name> /bin/bash -c "/home/scripts/myscript.sh"
Hi
```

Where
* `<container_name>` is the name of the container.