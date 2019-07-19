# coa-updater
A simple way to setup and provision a COA database.

### Provisinning

Provisioning is executed when the container starts.

### Related projects

* [DucksManager](https://github.com/bperel/DucksManager) is a free and open-source website enabling comic book collectors to manage their Disney collection.
* [dm-server](https://github.com/bperel/dm-server) is the back-end project that DucksManager reads and writes data from/to.
* [WhatTheDuck](https://github.com/bperel/WhatTheDuck) is the mobile app of DucksManager, allowing users to check the contents of their collection on a mobile and add issues to the collection by photographing comic book covers.
* [Duck cover ID](https://github.com/bperel/duck-cover-id) is a collection of shell scripts launched by a daily cronjob, allowing to retrieve comic book covers from the Inducks website and add the features of these pictures to a Pastec index. This index is searched whn taking a picture of a cover in the WhatTheDuck app.
* [COA updater](https://github.com/bperel/coa-updater) is a shell script launched by a daily cronjob, allowing to retrieve the structure and the contents of the Inducks database and to create a copy of this database locally.
* [DucksManager-stats](https://github.com/bperel/DucksManager-stats) contains a list of scripts launched by a daily cronjob, allowing to calculate statistics about issues that are recommended to users on DucksManager, depending on the authors that they prefer.

![DucksManager architecture](https://raw.githubusercontent.com/bperel/DucksManager/master/server_architecture.png)
