import { DataSource } from 'typeorm';
import 'reflect-metadata';

import sqliteConnection from '../database';
import { InducksCountryname } from '../models/coa/InducksCountryname';
import { InducksIssueWithCoverUrl } from '../models/coa/InducksIssueWithCoverUrl';
import { InducksIssuequotation } from '../models/coa/InducksIssuequotation';
import { InducksPerson } from '../models/coa/InducksPerson';
import { InducksPublication } from '../models/coa/InducksPublication';
import { InducksStory } from '../models/coa/InducksStory';
import { ContributionTotalPoints } from '../models/dm/ContributionTotalPoints';
import { Issue } from '../models/dm/Issue';
import { IssuePopularity } from '../models/dm/IssuePopularity';
import { NotificationCountry } from '../models/dm/NotificationCountry';
import { Purchase } from '../models/dm/Purchase';
import { User } from '../models/dm/User';
import { Sync } from '../models/internal/Sync';

export default new DataSource({
  name: 'wtdConnection',
  type: 'capacitor',
  driver: sqliteConnection,
  database: 'wtd',
  entities: [
    InducksCountryname,
    InducksIssuequotation,
    InducksIssueWithCoverUrl,
    InducksPerson,
    InducksPublication,
    InducksStory,
    ContributionTotalPoints,
    Issue,
    IssuePopularity,
    NotificationCountry,
    Purchase,
    User,
    Sync,
  ],
  migrations: [],
  logging: ['error', 'query', 'schema'],
  synchronize: true,
  migrationsRun: false,
});
