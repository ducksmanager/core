# coa-box-docker
A simple way to setup and provision a COA database.

Forked from [bperel/mariadb-server-setup-helper](https://github.com/bperel/mariadb-server-setup-helper)

### Image creation

```bash
bash util/docker-create-image.sh coa-box
```

### Container creation

For instance:

```bash
bash util/docker-create-container.sh coa-box coa-box-1 44000 dm_network
```

### Provisionning

```bash
chmod a+x scripts/coa-provision.sh
docker exec -it coa-box-1 /bin/bash -c "/home/scripts/coa-provision.sh"
```