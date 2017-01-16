# DM stats

Forked from https://github.com/bperel/mariadb-server-setup-helper

Daily stats for DucksManager

### Image creation

```bash
bash util/docker-create-image.sh dm-stats
```

### Container creation

```bash
bash util/docker-create-container.sh dm-stats dm-stats-1 44010 dm_network
chmod a+x scripts/*.sh
```

### Provisionning

Create database :
```bash
docker exec -it dm-stats-1 /bin/bash -c "bash -x /home/scripts/init-db.sh"
```

Calculate statistics :
```bash
docker exec -it dm-stats-1 /bin/bash -c "bash -x /home/scripts/calculate-stats.sh"
```