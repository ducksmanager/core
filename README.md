## DucksManager

[Official website](https://www.ducksmanager.net)

DucksManager is a copylefted libre software (and gratis) website to manage Disney comic-book collections.

Translations:
<a href="https://hosted.weblate.org/engage/ducksmanager/">
<img src="https://hosted.weblate.org/widget/ducksmanager/multi-auto.svg" alt="Translation status" />
</a>

Related projects:

- [WhatTheDuck](apps/whattheduck) — DucksManager mobile app. Check collection content on mobile and add issues by taking pictures of comic-book covers.
- [EdgeCreator](apps/edgecreator) — Upload pictures of edges and creates complete edge-pictures from resulting models.
- [Duck cover ID](https://github.com/bperel/duck-cover-id) — Collection of shell scripts launched by a daily `cron` job, allowing retrival of [I.N.D.U.C.K.S](https://inducks.org/) comic-book covers. \
Adds picture features to a [Pastec](https://github.com/magwyz/pastec) index to be searched when taking a picture of a cover in the WhatTheDuck app.
- [COA updater](apps/coa-updater) — Retrieves the structure and the contents of the [I.N.D.U.C.K.S](https://inducks.org/) database to create a copy of this database locally as a daily `cron` job. 
- [DucksManager-stats](https://github.com/bperel/DucksManager-stats) — Calculate stats about issues recommended to users on DucksManager, depending on the authors that they prefer as a list of daily `cron`-job scripts.
- [dm-server](https://github.com/bperel/dm-server) (to be discontinued) — The back-end project WhatTheDuck v2 earlier used to read and write data from/to. \
Replaced with the [DucksManager API](packages/api) in WhatTheDuck v3 onwards.

![DucksManager architecture](https://raw.githubusercontent.com/bperel/DucksManager-next/master/server_architecture.png)

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/en/) 22
- [Docker](https://www.docker.com/)

- Some Unix or WSL 2 environment

Ensure your local repository auto-pulls submodules:

```bash
git config --global submodule.recurse true
```