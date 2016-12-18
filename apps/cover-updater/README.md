# duck-cover-id
Storing Inducks cover info in a MariaDB database and processing them through Pastec

Forked from [bperel/mariadb-server-setup-helper](https://github.com/bperel/mariadb-server-setup-helper)

### Requirements

* A running [coa-box](https://github.com/bperel/coa-box-docker) Docker container
* A running [pastec](https://github.com/Visu4link/pastec) Docker container running on the same network as the coa-box : `docker run --restart always -d --net=dm_network --name pastec pastec`

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
chmod a+x scripts/*
docker exec -it duck-cover-id-box-1 /bin/bash -c "bash /home/scripts/run-query.sh \"/home/scripts/ddl.sql"\"
```

### Provisionning

```bash
docker exec -it duck-cover-id-box-1 /bin/bash -c "/home/scripts/import-covers.sh"
docker exec -it duck-cover-id-box-1 /bin/bash -c "/home/scripts/process-covers.sh"
```