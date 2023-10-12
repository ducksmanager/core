import { DataSource } from 'typeorm';
import 'reflect-metadata';

import sqliteConnection from '~/persistence/database';
import { InducksCountryname } from '~/persistence/models/coa/InducksCountryname';
import { InducksIssueWithCoverUrl } from '~/persistence/models/coa/InducksIssueWithCoverUrl';
import { InducksIssuequotation } from '~/persistence/models/coa/InducksIssuequotation';
import { InducksPerson } from '~/persistence/models/coa/InducksPerson';
import { InducksPublication } from '~/persistence/models/coa/InducksPublication';
import { InducksStory } from '~/persistence/models/coa/InducksStory';
import { SuggestedIssueSimple } from '~/persistence/models/composite/SuggestedIssueSimple';
import { AuthorUser } from '~/persistence/models/dm/AuthorUser';
import { ContributionTotalPoints } from '~/persistence/models/dm/ContributionTotalPoints';
import { Issue } from '~/persistence/models/dm/Issue';
import { IssuePopularity } from '~/persistence/models/dm/IssuePopularity';
import { NotificationCountry } from '~/persistence/models/dm/NotificationCountry';
import { Purchase } from '~/persistence/models/dm/Purchase';
import { User } from '~/persistence/models/dm/User';
import { Sync } from '~/persistence/models/internal/Sync';

export default new DataSource({
  name: 'wtdConnection',
  type: 'capacitor',
  driver: sqliteConnection,
  database: 'wtd',
  entities: [
    AuthorUser,
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
    SuggestedIssueSimple,
    Sync,
  ],
  migrations: [],
  logging: ['error', 'query', 'schema'],
  synchronize: true,
  migrationsRun: false,
});
