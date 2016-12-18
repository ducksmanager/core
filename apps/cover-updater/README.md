# duck-cover-id
Storing Inducks cover info in a MariaDB database and processing them through Pastec

Forked from [bperel/mariadb-server-setup-helper](https://github.com/bperel/mariadb-server-setup-helper)

### Requirements

* A running [coa-box](https://github.com/bperel/coa-box-docker) Docker container
* A running [pastec](https://github.com/Visu4link/pastec) Docker container

### Image creation

```bash
bash util/docker-create-image.sh duck-cover-id
```

### Container creation

For instance:

```bash
bash util/docker-create-container.sh duck-cover-id duck-cover-id-box-1 44008 dm_network
```

### DB creation
```bash
docker exec -it duck-cover-id-box-1 /bin/bash -c "bash -c \". /home/container.properties && mysql -uroot -p$DB_PASSWORD < /home/scripts/ddl.sql\""
```

### Provisionning

```bash

```