# duck-cover-id
Store cover info from a COA database and process them through Pastec.

### Requirements

* Make the scripts executable first: `chmod -R +x scripts`
* An accessible COA database (see [schema](https://github.com/bperel/dm-server/blob/master/sql/schema-coa.sql))
* A running [pastec](https://github.com/Visu4link/pastec) instance : `docker run --restart always -d --name pastec bperel/pastec-ubuntu-1704-timestamps`

### Execution

The COA database and Pastec need to be accessible to make the importation and the processing of the covers work. In the following examples we suppose that both are on a Docker network named `dmserver_cover-id-network`.

When created, the container runs the following steps :
* Import the covers from a COA database and store them into a Covers database (takes a few minutes)
* Process the covers (takes ~ 0.1 second per cover).

```bash
docker run -it --rm \
           --network dmserver_cover-id-network \
           --env-file .env \
           bperel/duck-cover-id-updater \
           bash -c "bash -c /home/scripts/import-covers.sh && bash -c /home/scripts/process-covers.sh"
```

### Related projects

* [DucksManager](https://github.com/bperel/DucksManager) is a free and open-source website enabling comic book collectors to manage their Disney collection.
* [dm-server](https://github.com/bperel/dm-server) is the back-end project that DucksManager reads and writes data from/to.
* [WhatTheDuck](https://github.com/bperel/WhatTheDuck) is the mobile app of DucksManager, allowing users to check the contents of their collection on a mobile and add issues to the collection by photographing comic book covers.
* [EdgeCreator](https://github.com/bperel/EdgeCreator) is a project allowing users to upload photos of edges and create models out of them in order to generate edge pictures.
* [COA updater](https://github.com/bperel/coa-updater) is a shell script launched by a daily cronjob, allowing to retrieve the structure and the contents of the Inducks database and to create a copy of this database locally.
* [DucksManager-stats](https://github.com/bperel/DucksManager-stats) contains a list of scripts launched by a daily cronjob, allowing to calculate statistics about issues that are recommended to users on DucksManager, depending on the authors that they prefer.

![DucksManager architecture](https://raw.githubusercontent.com/bperel/DucksManager/master/server_architecture.png)
