
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
} = require('./runtime/library')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.2.0
 * Query Engine version: 2804dc98259d2ea960602aca6b8e7fdc03c1758f
 */
Prisma.prismaVersion = {
  client: "5.2.0",
  engine: "2804dc98259d2ea960602aca6b8e7fdc03c1758f"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}


  const path = require('path')

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AuthorStoryScalarFieldEnum = {
  id: 'id',
  personcode: 'personcode',
  storycode: 'storycode'
};

exports.Prisma.AuthorUserForStatsScalarFieldEnum = {
  id: 'id',
  personcode: 'personcode',
  userId: 'userId',
  notation: 'notation'
};

exports.Prisma.Histoires_publicationsScalarFieldEnum = {
  ID: 'ID',
  storycode: 'storycode',
  publicationcode: 'publicationcode',
  issuenumber: 'issuenumber',
  issuecode: 'issuecode',
  oldestdate: 'oldestdate'
};

exports.Prisma.MissingStoryForUserScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  personcode: 'personcode',
  storycode: 'storycode'
};

exports.Prisma.Utilisateurs_publications_manquantesScalarFieldEnum = {
  ID: 'ID',
  ID_User: 'ID_User',
  personcode: 'personcode',
  storycode: 'storycode',
  publicationcode: 'publicationcode',
  issuenumber: 'issuenumber',
  oldestdate: 'oldestdate',
  Notation: 'Notation'
};

exports.Prisma.SuggestedIssueForUserScalarFieldEnum = {
  ID: 'ID',
  userId: 'userId',
  publicationcode: 'publicationcode',
  issuenumber: 'issuenumber',
  oldestdate: 'oldestdate',
  score: 'score'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  authorStory: 'authorStory',
  authorUserForStats: 'authorUserForStats',
  histoires_publications: 'histoires_publications',
  missingStoryForUser: 'missingStoryForUser',
  utilisateurs_publications_manquantes: 'utilisateurs_publications_manquantes',
  suggestedIssueForUser: 'suggestedIssueForUser'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/media/bruno/workspace/var/www/html/DucksManager/packages/api/dist/prisma/client_dm_stats",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "debian-openssl-1.1.x",
        "native": true
      },
      {
        "fromEnvVar": null,
        "value": "debian-openssl-1.1.x"
      },
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x"
      }
    ],
    "previewFeatures": [],
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": "../../../.env",
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.2.0",
  "engineVersion": "2804dc98259d2ea960602aca6b8e7fdc03c1758f",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "mysql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL_DM_STATS",
        "value": null
      }
    }
  },
  "inlineSchema": "Z2VuZXJhdG9yIGNsaWVudCB7CiAgcHJvdmlkZXIgICAgICA9ICJwcmlzbWEtY2xpZW50LWpzIgogIG91dHB1dCAgICAgICAgPSAiLi4vZGlzdC9wcmlzbWEvY2xpZW50X2RtX3N0YXRzIgogIGJpbmFyeVRhcmdldHMgPSBbIm5hdGl2ZSIsICJkZWJpYW4tb3BlbnNzbC0xLjEueCIsICJkZWJpYW4tb3BlbnNzbC0zLjAueCJdCn0KCmRhdGFzb3VyY2UgZGIgewogIHByb3ZpZGVyID0gIm15c3FsIgogIHVybCAgICAgID0gZW52KCJEQVRBQkFTRV9VUkxfRE1fU1RBVFMiKQp9Cgptb2RlbCBhdXRob3JTdG9yeSB7CiAgaWQgICAgICAgICBJbnQgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIHBlcnNvbmNvZGUgU3RyaW5nIEBkYi5WYXJDaGFyKDc5KQogIHN0b3J5Y29kZSAgU3RyaW5nIEBkYi5WYXJDaGFyKDE5KQoKICBAQHVuaXF1ZShbcGVyc29uY29kZSwgc3Rvcnljb2RlXSwgbWFwOiAidW5pcXVlX2luZGV4IikKICBAQGluZGV4KFtzdG9yeWNvZGVdLCBtYXA6ICJpbmRleF9zdG9yeWNvZGUiKQogIEBAbWFwKCJhdXRldXJzX2hpc3RvaXJlcyIpCn0KCm1vZGVsIGF1dGhvclVzZXJGb3JTdGF0cyB7CiAgaWQgICAgICAgICBJbnQgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIHBlcnNvbmNvZGUgU3RyaW5nIEBtYXAoIk5vbUF1dGV1ckFicmVnZSIpIEBkYi5WYXJDaGFyKDc5KQogIHVzZXJJZCAgICAgSW50ICAgIEBtYXAoIklEX3VzZXIiKQogIG5vdGF0aW9uICAgSW50ICAgIEBkZWZhdWx0KC0xKSBAbWFwKCJOb3RhdGlvbiIpCgogIEBAdW5pcXVlKFt1c2VySWQsIHBlcnNvbmNvZGVdLCBtYXA6ICJhdXRldXJzX3BzZXVkb3NfdWluZGV4IikKICBAQGluZGV4KFt1c2VySWRdLCBtYXA6ICJhdXRldXJzX3BzZXVkb3NfSURfdXNlcl9pbmRleCIpCiAgQEBtYXAoImF1dGV1cnNfcHNldWRvcyIpCn0KCm1vZGVsIGhpc3RvaXJlc19wdWJsaWNhdGlvbnMgewogIElEICAgICAgICAgICAgICBJbnQgICAgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBzdG9yeWNvZGUgICAgICAgU3RyaW5nICAgIEBkYi5WYXJDaGFyKDE5KQogIHB1YmxpY2F0aW9uY29kZSBTdHJpbmcgICAgQGRiLlZhckNoYXIoMTIpCiAgaXNzdWVudW1iZXIgICAgIFN0cmluZyAgICBAZGIuVmFyQ2hhcigxMikKICBpc3N1ZWNvZGUgICAgICAgU3RyaW5nICAgIEBkYi5WYXJDaGFyKDI1KQogIG9sZGVzdGRhdGUgICAgICBEYXRlVGltZT8gQGRiLkRhdGUKCiAgQEB1bmlxdWUoW2lzc3VlY29kZSwgc3Rvcnljb2RlXSwgbWFwOiAidW5pcXVlX2luZGV4IikKICBAQGluZGV4KFtpc3N1ZWNvZGVdLCBtYXA6ICJpbmRleF9pc3N1ZSIpCiAgQEBpbmRleChbb2xkZXN0ZGF0ZV0sIG1hcDogImluZGV4X29sZGVzdGRhdGUiKQogIEBAaW5kZXgoW3N0b3J5Y29kZV0sIG1hcDogImluZGV4X3N0b3J5IikKfQoKbW9kZWwgbWlzc2luZ1N0b3J5Rm9yVXNlciB7CiAgaWQgICAgICAgICBJbnQgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIHVzZXJJZCAgICAgSW50ICAgIEBtYXAoIklEX1VzZXIiKQogIHBlcnNvbmNvZGUgU3RyaW5nIEBkYi5WYXJDaGFyKDIyKQogIHN0b3J5Y29kZSAgU3RyaW5nIEBkYi5WYXJDaGFyKDE5KQoKICBAQHVuaXF1ZShbdXNlcklkLCBwZXJzb25jb2RlLCBzdG9yeWNvZGVdLCBtYXA6ICJtaXNzaW5nX2lzc3VlX2Zvcl91c2VyIikKICBAQG1hcCgidXRpbGlzYXRldXJzX2hpc3RvaXJlc19tYW5xdWFudGVzIikKfQoKbW9kZWwgdXRpbGlzYXRldXJzX3B1YmxpY2F0aW9uc19tYW5xdWFudGVzIHsKICBJRCAgICAgICAgICAgICAgSW50ICAgICAgIEBpZCBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgSURfVXNlciAgICAgICAgIEludAogIHBlcnNvbmNvZGUgICAgICBTdHJpbmcgICAgQGRiLlZhckNoYXIoNzkpCiAgc3Rvcnljb2RlICAgICAgIFN0cmluZyAgICBAZGIuVmFyQ2hhcigxOSkKICBwdWJsaWNhdGlvbmNvZGUgU3RyaW5nICAgIEBkYi5WYXJDaGFyKDEyKQogIGlzc3VlbnVtYmVyICAgICBTdHJpbmcgICAgQGRiLlZhckNoYXIoMTIpCiAgb2xkZXN0ZGF0ZSAgICAgIERhdGVUaW1lPyBAZGIuRGF0ZQogIE5vdGF0aW9uICAgICAgICBJbnQgICAgICAgQGRiLlVuc2lnbmVkVGlueUludAoKICBAQHVuaXF1ZShbSURfVXNlciwgcGVyc29uY29kZSwgc3Rvcnljb2RlLCBwdWJsaWNhdGlvbmNvZGUsIGlzc3VlbnVtYmVyXSwgbWFwOiAidW5pcXVlX2luZGV4IikKICBAQGluZGV4KFtJRF9Vc2VyLCBwdWJsaWNhdGlvbmNvZGUsIGlzc3VlbnVtYmVyXSwgbWFwOiAibWlzc2luZ191c2VyX2lzc3VlIikKICBAQGluZGV4KFtJRF9Vc2VyLCBwdWJsaWNhdGlvbmNvZGUsIGlzc3VlbnVtYmVyLCBvbGRlc3RkYXRlXSwgbWFwOiAic3VnZ2VzdGVkIikKICBAQGluZGV4KFtJRF9Vc2VyLCBwZXJzb25jb2RlLCBzdG9yeWNvZGVdLCBtYXA6ICJ1c2VyX3N0b3JpZXMiKQp9Cgptb2RlbCBzdWdnZXN0ZWRJc3N1ZUZvclVzZXIgewogIElEICAgICAgICAgICAgICBJbnQgICAgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICB1c2VySWQgICAgICAgICAgSW50ICAgICAgIEBtYXAoIklEX1VzZXIiKQogIHB1YmxpY2F0aW9uY29kZSBTdHJpbmcgICAgQGRiLlZhckNoYXIoMTIpCiAgaXNzdWVudW1iZXIgICAgIFN0cmluZyAgICBAZGIuVmFyQ2hhcigxMikKICBvbGRlc3RkYXRlICAgICAgRGF0ZVRpbWU/IEBkYi5EYXRlCiAgc2NvcmUgICAgICAgICAgIEludCAgICAgICBAbWFwKCJTY29yZSIpCgogIEBAdW5pcXVlKFt1c2VySWQsIHB1YmxpY2F0aW9uY29kZSwgaXNzdWVudW1iZXJdLCBtYXA6ICJzdWdnZXN0ZWRfaXNzdWVfZm9yX3VzZXIiKQogIEBAaW5kZXgoW3VzZXJJZF0sIG1hcDogInN1Z2dlc3RlZF9pc3N1ZV91c2VyIikKICBAQG1hcCgidXRpbGlzYXRldXJzX3B1YmxpY2F0aW9uc19zdWdnZXJlZXMiKQp9Cg==",
  "inlineSchemaHash": "cdfd737adb444fa2949da8f6476696ba44cece14dd66a03fb6fc03dbd0834418",
  "noEngine": false
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "dist/prisma/client_dm_stats",
    "prisma/client_dm_stats",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"authorStory\":{\"dbName\":\"auteurs_histoires\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"personcode\",\"storycode\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"personcode\",\"storycode\"]}],\"isGenerated\":false},\"authorUserForStats\":{\"dbName\":\"auteurs_pseudos\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personcode\",\"dbName\":\"NomAuteurAbrege\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_user\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notation\",\"dbName\":\"Notation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":-1,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"personcode\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"personcode\"]}],\"isGenerated\":false},\"histoires_publications\":{\"dbName\":null,\"fields\":[{\"name\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuenumber\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"oldestdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"issuecode\",\"storycode\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"issuecode\",\"storycode\"]}],\"isGenerated\":false},\"missingStoryForUser\":{\"dbName\":\"utilisateurs_histoires_manquantes\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_User\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"personcode\",\"storycode\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"personcode\",\"storycode\"]}],\"isGenerated\":false},\"utilisateurs_publications_manquantes\":{\"dbName\":null,\"fields\":[{\"name\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ID_User\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuenumber\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"oldestdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Notation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"ID_User\",\"personcode\",\"storycode\",\"publicationcode\",\"issuenumber\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"ID_User\",\"personcode\",\"storycode\",\"publicationcode\",\"issuenumber\"]}],\"isGenerated\":false},\"suggestedIssueForUser\":{\"dbName\":\"utilisateurs_publications_suggerees\",\"fields\":[{\"name\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_User\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuenumber\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"oldestdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"score\",\"dbName\":\"Score\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"publicationcode\",\"issuenumber\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"publicationcode\",\"issuenumber\"]}],\"isGenerated\":false}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)



const { warnEnvConflicts } = require('./runtime/library')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-1.1.x.so.node");
path.join(process.cwd(), "dist/prisma/client_dm_stats/libquery_engine-debian-openssl-1.1.x.so.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-3.0.x.so.node");
path.join(process.cwd(), "dist/prisma/client_dm_stats/libquery_engine-debian-openssl-3.0.x.so.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "dist/prisma/client_dm_stats/schema.prisma")
