# DM stats

Daily stats calculation for DucksManager

### Provisioning

Provisioning is executed when the container starts.

Required environment variables :
* `MYSQL_HOST` : The hostname of the DB
* `MYSQL_PASSWORD` : The password to access databases
* `MYSQL_DM_DATABASE` : The name of the DM DB
* `MYSQL_DM_STATS_DATABASE` : The name of the DM stats DB
* `MYSQL_COA_DATABASE` : The name of the COA DB

### Related projects
* [DucksManager](https://github.com/bperel/DucksManager) is a free and open-source website enabling comic book collectors to manage their Disney collection.
* [dm-server](https://github.com/bperel/dm-server) is the back-end project that DucksManager reads and writes data from/to.
* [WhatTheDuck](https://github.com/bperel/WhatTheDuck) is the mobile app of DucksManager, allowing users to check the contents of their collection on a mobile and add issues to the collection by photographing comic book covers.
* [EdgeCreator](https://github.com/bperel/EdgeCreator) is a project allowing users to upload photos of edges and create models out of them in order to generate edge pictures.
* [Duck cover ID](https://github.com/bperel/duck-cover-id) is a collection of shell scripts launched by a daily cronjob, allowing to retrieve comic book covers from the Inducks website and add the features of these pictures to a Pastec index. This index is searched whn taking a picture of a cover in the WhatTheDuck app.
* [COA updater](https://github.com/bperel/coa-updater) is a shell script launched by a daily cronjob, allowing to retrieve the structure and the contents of the Inducks database and to create a copy of this database locally.

![DucksManager architecture](https://raw.githubusercontent.com/bperel/DucksManager/master/server_architecture.png)
