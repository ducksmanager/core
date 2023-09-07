
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

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  country: 'country',
  magazine: 'magazine',
  startDate: 'startDate',
  endDate: 'endDate'
};

exports.Prisma.Abonnements_sortiesScalarFieldEnum = {
  Pays: 'Pays',
  Magazine: 'Magazine',
  Numero: 'Numero',
  Date_sortie: 'Date_sortie',
  Numeros_ajoutes: 'Numeros_ajoutes'
};

exports.Prisma.PurchaseScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  date: 'date',
  description: 'description'
};

exports.Prisma.AuthorUserScalarFieldEnum = {
  id: 'id',
  personcode: 'personcode',
  userId: 'userId',
  notation: 'notation'
};

exports.Prisma.Bibliotheque_contributeursScalarFieldEnum = {
  ID: 'ID',
  Nom: 'Nom',
  Texte: 'Texte'
};

exports.Prisma.BookcasePublicationOrderScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  publicationcode: 'publicationcode',
  order: 'order'
};

exports.Prisma.BookstoreScalarFieldEnum = {
  id: 'id',
  name: 'name',
  address: 'address',
  coordX: 'coordX',
  coordY: 'coordY'
};

exports.Prisma.BookstoreCommentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  comment: 'comment',
  creationDate: 'creationDate',
  isActive: 'isActive',
  bookstoreId: 'bookstoreId'
};

exports.Prisma.DemoScalarFieldEnum = {
  id: 'id',
  lastReset: 'lastReset'
};

exports.Prisma.MagazinesScalarFieldEnum = {
  PaysAbrege: 'PaysAbrege',
  NomAbrege: 'NomAbrege',
  NomComplet: 'NomComplet',
  RedirigeDepuis: 'RedirigeDepuis',
  NeParaitPlus: 'NeParaitPlus'
};

exports.Prisma.IssueScalarFieldEnum = {
  id: 'id',
  country: 'country',
  magazine: 'magazine',
  issuenumber: 'issuenumber',
  condition: 'condition',
  purchaseId: 'purchaseId',
  isOnSale: 'isOnSale',
  isToRead: 'isToRead',
  isSubscription: 'isSubscription',
  userId: 'userId',
  creationDate: 'creationDate'
};

exports.Prisma.IssuePopularityScalarFieldEnum = {
  country: 'country',
  magazine: 'magazine',
  issuenumber: 'issuenumber',
  popularity: 'popularity',
  id: 'id'
};

exports.Prisma.Tranches_doublonsScalarFieldEnum = {
  ID: 'ID',
  Pays: 'Pays',
  Magazine: 'Magazine',
  Numero: 'Numero',
  NumeroReference: 'NumeroReference',
  TrancheReference: 'TrancheReference'
};

exports.Prisma.EdgeScalarFieldEnum = {
  id: 'id',
  publicationcode: 'publicationcode',
  issuenumber: 'issuenumber',
  creationDate: 'creationDate',
  points: 'points',
  slug: 'slug',
  issuecode: 'issuecode'
};

exports.Prisma.Tranches_pretes_contributeursScalarFieldEnum = {
  publicationcode: 'publicationcode',
  issuenumber: 'issuenumber',
  contributeur: 'contributeur',
  contribution: 'contribution'
};

exports.Prisma.Tranches_pretes_contributionsScalarFieldEnum = {
  ID: 'ID',
  ID_tranche: 'ID_tranche',
  ID_user: 'ID_user',
  dateajout: 'dateajout',
  contribution: 'contribution',
  points_new: 'points_new',
  points_total: 'points_total'
};

exports.Prisma.EdgeSpriteScalarFieldEnum = {
  id: 'id',
  edgeId: 'edgeId',
  spriteName: 'spriteName',
  spriteSize: 'spriteSize'
};

exports.Prisma.EdgeSpriteSizeScalarFieldEnum = {
  id: 'id',
  spriteName: 'spriteName',
  size: 'size'
};

exports.Prisma.EdgeSpriteUrlScalarFieldEnum = {
  id: 'id',
  spriteName: 'spriteName',
  version: 'version'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  password: 'password',
  allowSharing: 'allowSharing',
  signupDate: 'signupDate',
  email: 'email',
  discordId: 'discordId',
  showRecommendations: 'showRecommendations',
  isBetaUser: 'isBetaUser',
  showPresentationVideo: 'showPresentationVideo',
  showDuplicatesInBookcase: 'showDuplicatesInBookcase',
  bookcaseTexture1: 'bookcaseTexture1',
  bookcaseSubTexture1: 'bookcaseSubTexture1',
  bookcaseTexture2: 'bookcaseTexture2',
  bookcaseSubTexture2: 'bookcaseSubTexture2',
  presentationText: 'presentationText',
  lastAccess: 'lastAccess',
  previousAccess: 'previousAccess',
  marketplaceAcceptsExchanges: 'marketplaceAcceptsExchanges'
};

exports.Prisma.UserContributionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  date: 'date',
  contribution: 'contribution',
  newPoints: 'newPoints',
  totalPoints: 'totalPoints',
  isEmailSent: 'isEmailSent',
  edgeId: 'edgeId',
  bookstoreId: 'bookstoreId',
  bookstoreCommentId: 'bookstoreCommentId'
};

exports.Prisma.UserOptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  optionName: 'optionName',
  optionValue: 'optionValue'
};

exports.Prisma.UserPasswordTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token'
};

exports.Prisma.UserPermissionScalarFieldEnum = {
  id: 'id',
  username: 'username',
  role: 'role',
  privilege: 'privilege'
};

exports.Prisma.Users_pointsScalarFieldEnum = {
  ID: 'ID',
  ID_Utilisateur: 'ID_Utilisateur',
  TypeContribution: 'TypeContribution',
  NbPoints: 'NbPoints'
};

exports.Prisma.UserSuggestionNotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  issuecode: 'issuecode',
  text: 'text',
  date: 'date'
};

exports.Prisma.RequestedIssueScalarFieldEnum = {
  id: 'id',
  issueId: 'issueId',
  buyerId: 'buyerId',
  isBooked: 'isBooked'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.issue_condition = exports.$Enums.issue_condition = {
  mauvais: 'mauvais',
  moyen: 'moyen',
  bon: 'bon',
  indefini: 'indefini'
};

exports.tranches_pretes_contributeurs_contribution = exports.$Enums.tranches_pretes_contributeurs_contribution = {
  photographe: 'photographe',
  createur: 'createur'
};

exports.tranches_pretes_contributions_contribution = exports.$Enums.tranches_pretes_contributions_contribution = {
  photographe: 'photographe',
  createur: 'createur'
};

exports.userOptionType = exports.$Enums.userOptionType = {
  suggestion_notification_country: 'suggestion_notification_country',
  sales_notification_publications: 'sales_notification_publications',
  marketplace_contact_methods: 'marketplace_contact_methods'
};

exports.users_permissions_privilege = exports.$Enums.users_permissions_privilege = {
  Admin: 'Admin',
  Edition: 'Edition',
  Affichage: 'Affichage'
};

exports.userContributionType = exports.$Enums.userContributionType = {
  photographe: 'photographe',
  createur: 'createur',
  duckhunter: 'duckhunter'
};

exports.Prisma.ModelName = {
  subscription: 'subscription',
  abonnements_sorties: 'abonnements_sorties',
  purchase: 'purchase',
  authorUser: 'authorUser',
  bibliotheque_contributeurs: 'bibliotheque_contributeurs',
  bookcasePublicationOrder: 'bookcasePublicationOrder',
  bookstore: 'bookstore',
  bookstoreComment: 'bookstoreComment',
  demo: 'demo',
  magazines: 'magazines',
  issue: 'issue',
  issuePopularity: 'issuePopularity',
  tranches_doublons: 'tranches_doublons',
  edge: 'edge',
  tranches_pretes_contributeurs: 'tranches_pretes_contributeurs',
  tranches_pretes_contributions: 'tranches_pretes_contributions',
  edgeSprite: 'edgeSprite',
  edgeSpriteSize: 'edgeSpriteSize',
  edgeSpriteUrl: 'edgeSpriteUrl',
  user: 'user',
  userContribution: 'userContribution',
  userOption: 'userOption',
  userPasswordToken: 'userPasswordToken',
  userPermission: 'userPermission',
  users_points: 'users_points',
  userSuggestionNotification: 'userSuggestionNotification',
  requestedIssue: 'requestedIssue'
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
      "value": "/media/bruno/workspace/var/www/html/DucksManager/packages/api/dist/prisma/client_dm",
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
        "fromEnvVar": "DATABASE_URL_DM",
        "value": null
      }
    }
  },
  "inlineSchema": "Z2VuZXJhdG9yIGNsaWVudCB7CiAgcHJvdmlkZXIgICAgICA9ICJwcmlzbWEtY2xpZW50LWpzIgogIG91dHB1dCAgICAgICAgPSAiLi4vZGlzdC9wcmlzbWEvY2xpZW50X2RtIgogIGJpbmFyeVRhcmdldHMgPSBbIm5hdGl2ZSIsICJkZWJpYW4tb3BlbnNzbC0xLjEueCIsICJkZWJpYW4tb3BlbnNzbC0zLjAueCJdCn0KCmRhdGFzb3VyY2UgZGIgewogIHByb3ZpZGVyID0gIm15c3FsIgogIHVybCAgICAgID0gZW52KCJEQVRBQkFTRV9VUkxfRE0iKQp9Cgptb2RlbCBzdWJzY3JpcHRpb24gewogIGlkICAgICAgICBJbnQgICAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKSBAbWFwKCJJRCIpCiAgdXNlcklkICAgIEludCAgICAgIEBtYXAoIklEX1V0aWxpc2F0ZXVyIikKICBjb3VudHJ5ICAgU3RyaW5nICAgQG1hcCgiUGF5cyIpIEBkYi5WYXJDaGFyKDMpCiAgbWFnYXppbmUgIFN0cmluZyAgIEBtYXAoIk1hZ2F6aW5lIikgQGRiLlZhckNoYXIoNikKICBzdGFydERhdGUgRGF0ZVRpbWUgQG1hcCgiRGF0ZV9kZWJ1dCIpIEBkYi5EYXRlCiAgZW5kRGF0ZSAgIERhdGVUaW1lIEBtYXAoIkRhdGVfZmluIikgQGRiLkRhdGUKICB1c2VycyAgICAgdXNlciAgICAgQHJlbGF0aW9uKGZpZWxkczogW3VzZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBtYXA6ICJhYm9ubmVtZW50c191c2Vyc19JRF9mayIpCgogIEBAdW5pcXVlKFtjb3VudHJ5LCBtYWdhemluZSwgdXNlcklkLCBzdGFydERhdGUsIGVuZERhdGVdLCBtYXA6ICJhYm9ubmVtZW50c191bmlxdWUiKQogIEBAaW5kZXgoW3VzZXJJZF0sIG1hcDogImFib25uZW1lbnRzX3VzZXJzX0lEX2ZrIikKICBAQG1hcCgiYWJvbm5lbWVudHMiKQp9Cgptb2RlbCBhYm9ubmVtZW50c19zb3J0aWVzIHsKICBQYXlzICAgICAgICAgICAgU3RyaW5nICAgQGRiLlZhckNoYXIoMykKICBNYWdhemluZSAgICAgICAgU3RyaW5nICAgQGRiLlZhckNoYXIoNikKICBOdW1lcm8gICAgICAgICAgU3RyaW5nICAgQGRiLlZhckNoYXIoOCkKICBEYXRlX3NvcnRpZSAgICAgRGF0ZVRpbWUgQGRiLkRhdGUKICBOdW1lcm9zX2Fqb3V0ZXMgQm9vbGVhbiAgQGRlZmF1bHQoZmFsc2UpCgogIEBAaWQoW1BheXMsIE1hZ2F6aW5lLCBOdW1lcm9dKQp9Cgptb2RlbCBwdXJjaGFzZSB7CiAgaWQgICAgICAgICAgSW50ICAgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSURfQWNxdWlzaXRpb24iKQogIHVzZXJJZCAgICAgIEludCAgICAgIEBtYXAoIklEX1VzZXIiKQogIGRhdGUgICAgICAgIERhdGVUaW1lIEBtYXAoIkRhdGUiKSBAZGIuRGF0ZQogIGRlc2NyaXB0aW9uIFN0cmluZyAgIEBtYXAoIkRlc2NyaXB0aW9uIikgQGRiLlZhckNoYXIoMTAwKQoKICBAQHVuaXF1ZShbdXNlcklkLCBkYXRlLCBkZXNjcmlwdGlvbl0sIG1hcDogInVzZXJfZGF0ZV9kZXNjcmlwdGlvbl91bmlxdWUiKQogIEBAbWFwKCJhY2hhdHMiKQp9Cgptb2RlbCBhdXRob3JVc2VyIHsKICBpZCAgICAgICAgIEludCAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKSBAbWFwKCJJRCIpCiAgcGVyc29uY29kZSBTdHJpbmcgQG1hcCgiTm9tQXV0ZXVyQWJyZWdlIikgQGRiLlZhckNoYXIoNzkpCiAgdXNlcklkICAgICBJbnQgICAgQG1hcCgiSURfdXNlciIpCiAgbm90YXRpb24gICBJbnQgICAgQGRlZmF1bHQoLTEpIEBtYXAoIk5vdGF0aW9uIikKCiAgQEB1bmlxdWUoW3VzZXJJZCwgcGVyc29uY29kZV0sIG1hcDogImF1dGV1cnNfcHNldWRvc191aW5kZXgiKQogIEBAbWFwKCJhdXRldXJzX3BzZXVkb3MiKQp9Cgptb2RlbCBiaWJsaW90aGVxdWVfY29udHJpYnV0ZXVycyB7CiAgSUQgICAgSW50ICAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIE5vbSAgIFN0cmluZz8gQGRiLlZhckNoYXIoMzApCiAgVGV4dGUgU3RyaW5nPyBAZGIuVGV4dAp9Cgptb2RlbCBib29rY2FzZVB1YmxpY2F0aW9uT3JkZXIgewogIGlkICAgICAgICAgICAgICBJbnQgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIHVzZXJJZCAgICAgICAgICBJbnQgICAgQG1hcCgiSURfVXRpbGlzYXRldXIiKQogIHB1YmxpY2F0aW9uY29kZSBTdHJpbmcgQGRiLlZhckNoYXIoMTIpCiAgb3JkZXIgICAgICAgICAgIEludCAgICBAbWFwKCJPcmRyZSIpCgogIEBAdW5pcXVlKFt1c2VySWQsIHB1YmxpY2F0aW9uY29kZV0sIG1hcDogImJpYmxpb3RoZXF1ZV9vcmRyZV9tYWdhemluZXNfdWluZGV4IikKICBAQG1hcCgiYmlibGlvdGhlcXVlX29yZHJlX21hZ2F6aW5lcyIpCn0KCm1vZGVsIGJvb2tzdG9yZSB7CiAgaWQgICAgICAgICAgICAgICAgICBJbnQgICAgICAgICAgICAgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIG5hbWUgICAgICAgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgIEBtYXAoIk5vbSIpIEBkYi5WYXJDaGFyKDMwKQogIGFkZHJlc3MgICAgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgIEBtYXAoIkFkcmVzc2VDb21wbGV0ZSIpIEBkYi5UZXh0CiAgY29vcmRYICAgICAgICAgICAgICBGbG9hdCAgICAgICAgICAgICAgQG1hcCgiQ29vcmRYIikKICBjb29yZFkgICAgICAgICAgICAgIEZsb2F0ICAgICAgICAgICAgICBAbWFwKCJDb29yZFkiKQogIGNvbW1lbnRzICAgICAgICAgICAgYm9va3N0b3JlQ29tbWVudFtdCiAgdXNlcnNfY29udHJpYnV0aW9ucyB1c2VyQ29udHJpYnV0aW9uW10KCiAgQEBtYXAoImJvdXF1aW5lcmllcyIpCn0KCm1vZGVsIGJvb2tzdG9yZUNvbW1lbnQgewogIGlkICAgICAgICAgICAgICAgICAgSW50ICAgICAgICAgICAgICAgIEBpZCBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpIEBtYXAoIklEIikKICB1c2VySWQgICAgICAgICAgICAgIEludD8gICAgICAgICAgICAgICBAbWFwKCJJRF9VdGlsaXNhdGV1ciIpCiAgY29tbWVudCAgICAgICAgICAgICBTdHJpbmcgICAgICAgICAgICAgQG1hcCgiQ29tbWVudGFpcmUiKSBAZGIuVGV4dAogIGNyZWF0aW9uRGF0ZSAgICAgICAgRGF0ZVRpbWUgICAgICAgICAgIEBkZWZhdWx0KG5vdygpKSBAbWFwKCJEYXRlQWpvdXQiKSBAZGIuVGltZXN0YW1wKDApCiAgaXNBY3RpdmUgICAgICAgICAgICBCb29sZWFuICAgICAgICAgICAgQGRlZmF1bHQoZmFsc2UpIEBtYXAoIkFjdGlmIikKICBib29rc3RvcmVJZCAgICAgICAgIEludCAgICAgICAgICAgICAgICBAbWFwKCJJRF9Cb3VxdWluZXJpZSIpCiAgYm91cXVpbmVyaWVzICAgICAgICBib29rc3RvcmUgICAgICAgICAgQHJlbGF0aW9uKGZpZWxkczogW2Jvb2tzdG9yZUlkXSwgcmVmZXJlbmNlczogW2lkXSwgb25VcGRhdGU6IFJlc3RyaWN0LCBtYXA6ICJib3VxdWluZXJpZXNfY29tbWVudGFpcmVzX2JvdXF1aW5lcmllc19JRF9mayIpCiAgdXNlciAgICAgICAgICAgICAgICB1c2VyPyAgICAgICAgICAgICAgQHJlbGF0aW9uKGZpZWxkczogW3VzZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBSZXN0cmljdCwgb25VcGRhdGU6IFJlc3RyaWN0LCBtYXA6ICJib3VxdWluZXJpZXNfY29tbWVudGFpcmVzX3VzZXJzX0lEX2ZrIikKICB1c2Vyc19jb250cmlidXRpb25zIHVzZXJDb250cmlidXRpb25bXQoKICBAQGluZGV4KFtib29rc3RvcmVJZF0sIG1hcDogImJvdXF1aW5lcmllc19jb21tZW50YWlyZXNfYm91cXVpbmVyaWVzX0lEX2ZrIikKICBAQGluZGV4KFt1c2VySWRdLCBtYXA6ICJib3VxdWluZXJpZXNfY29tbWVudGFpcmVzX3VzZXJzX0lEX2ZrIikKICBAQG1hcCgiYm91cXVpbmVyaWVzX2NvbW1lbnRhaXJlcyIpCn0KCm1vZGVsIGRlbW8gewogIGlkICAgICAgICBJbnQgICAgICBAaWQgQGRlZmF1bHQoMSkgQG1hcCgiSUQiKQogIGxhc3RSZXNldCBEYXRlVGltZSBAbWFwKCJEYXRlRGVybmllckluaXQiKSBAZGIuRGF0ZVRpbWUoMCkKfQoKbW9kZWwgbWFnYXppbmVzIHsKICBQYXlzQWJyZWdlICAgICBTdHJpbmcgICBAZGIuVmFyQ2hhcig0KQogIE5vbUFicmVnZSAgICAgIFN0cmluZyAgIEBkYi5WYXJDaGFyKDcpCiAgTm9tQ29tcGxldCAgICAgU3RyaW5nICAgQGRiLlZhckNoYXIoNzApCiAgUmVkaXJpZ2VEZXB1aXMgU3RyaW5nICAgQGRiLlZhckNoYXIoNykKICBOZVBhcmFpdFBsdXMgICBCb29sZWFuPwoKICBAQGlkKFtQYXlzQWJyZWdlLCBOb21BYnJlZ2UsIFJlZGlyaWdlRGVwdWlzXSkKfQoKbW9kZWwgaXNzdWUgewogIGlkICAgICAgICAgICAgIEludCAgICAgICAgICAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKSBAbWFwKCJJRCIpCiAgY291bnRyeSAgICAgICAgU3RyaW5nICAgICAgICAgIEBtYXAoIlBheXMiKSBAZGIuVmFyQ2hhcigzKQogIG1hZ2F6aW5lICAgICAgIFN0cmluZyAgICAgICAgICBAbWFwKCJNYWdhemluZSIpIEBkYi5WYXJDaGFyKDEwKQogIGlzc3VlbnVtYmVyICAgIFN0cmluZyAgICAgICAgICBAbWFwKCJOdW1lcm8iKSBAZGIuVmFyQ2hhcigxMikKICAvLyBpc3N1ZU51bWJlck5vU3BhY2UgU3RyaW5nPyAgICAgICAgIEBtYXAoIk51bWVyb19ub3NwYWNlIikgQGRiLlZhckNoYXIoMTIpIEBpZ25vcmVkCiAgY29uZGl0aW9uICAgICAgaXNzdWVfY29uZGl0aW9uIEBkZWZhdWx0KGluZGVmaW5pKSBAbWFwKCJFdGF0IikKICBwdXJjaGFzZUlkICAgICBJbnQ/ICAgICAgICAgICAgQGRlZmF1bHQoLTEpIEBtYXAoIklEX0FjcXVpc2l0aW9uIikKICBpc09uU2FsZSAgICAgICBCb29sZWFuICAgICAgICAgQG1hcCgiQVYiKQogIGlzVG9SZWFkICAgICAgIEJvb2xlYW4gICAgICAgICBAZGVmYXVsdChmYWxzZSkgQG1hcCgiQV9MaXJlIikgQGRiLlRpbnlJbnQKICBpc1N1YnNjcmlwdGlvbiBCb29sZWFuICAgICAgICAgQGRlZmF1bHQoZmFsc2UpIEBtYXAoIkFib25uZW1lbnQiKSBAZGIuVGlueUludAogIHVzZXJJZCAgICAgICAgIEludCAgICAgICAgICAgICBAbWFwKCJJRF9VdGlsaXNhdGV1ciIpCiAgY3JlYXRpb25EYXRlICAgRGF0ZVRpbWU/ICAgICAgIEBkZWZhdWx0KG5vdygpKSBAbWFwKCJEYXRlQWpvdXQiKSBAZGIuVGltZXN0YW1wKDApCiAgLy8gaXNzdWVjb2RlICAgICAgICAgIFN0cmluZz8gICAgICAgICBAZGIuVmFyQ2hhcigyNSkKICAvLyBAQGluZGV4KFtpc3N1ZWNvZGUsIHVzZXJJZF0sIG1hcDogIm51bWVyb3NfaXNzdWVjb2RlX0lEX1V0aWxpc2F0ZXVyX2luZGV4IikKICAvLyBAQGluZGV4KFtpc3N1ZWNvZGVdLCBtYXA6ICJudW1lcm9zX2lzc3VlY29kZV9pbmRleCIpCgogIEBAaW5kZXgoW2NvdW50cnksIG1hZ2F6aW5lLCBpc3N1ZW51bWJlciwgdXNlcklkXSwgbWFwOiAiTnVtZXJvX1V0aWxpc2F0ZXVyIikKICAvLyBAQGluZGV4KFtjb3VudHJ5LCBtYWdhemluZSwgaXNzdWVOdW1iZXJOb1NwYWNlLCB1c2VySWRdLCBtYXA6ICJOdW1lcm9fbm9zcGFjZV9VdGlsaXNhdGV1ciIpCiAgQEBpbmRleChbY291bnRyeSwgbWFnYXppbmUsIGlzc3VlbnVtYmVyXSwgbWFwOiAiUGF5c19NYWdhemluZV9OdW1lcm8iKQogIEBAaW5kZXgoW2NyZWF0aW9uRGF0ZSwgY291bnRyeSwgbWFnYXppbmUsIGlzc3VlbnVtYmVyXSwgbWFwOiAiUGF5c19NYWdhemluZV9OdW1lcm9fRGF0ZUFqb3V0IikKICBAQGluZGV4KFt1c2VySWRdLCBtYXA6ICJVdGlsaXNhdGV1ciIpCiAgQEBtYXAoIm51bWVyb3MiKQp9Cgptb2RlbCBpc3N1ZVBvcHVsYXJpdHkgewogIGNvdW50cnkgICAgIFN0cmluZyBAbWFwKCJQYXlzIikgQGRiLlZhckNoYXIoMykKICBtYWdhemluZSAgICBTdHJpbmcgQG1hcCgiTWFnYXppbmUiKSBAZGIuVmFyQ2hhcig2KQogIGlzc3VlbnVtYmVyIFN0cmluZyBAbWFwKCJOdW1lcm8iKSBAZGIuVmFyQ2hhcigxMikKICBwb3B1bGFyaXR5ICBJbnQgICAgQG1hcCgiUG9wdWxhcml0ZSIpCiAgaWQgICAgICAgICAgSW50ICAgIEBpZCBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpIEBtYXAoIklEIikKCiAgQEB1bmlxdWUoW2NvdW50cnksIG1hZ2F6aW5lLCBpc3N1ZW51bWJlcl0sIG1hcDogIm51bWVyb3NfcG9wdWxhcml0ZV91bmlxdWUiKQogIEBAbWFwKCJudW1lcm9zX3BvcHVsYXJpdGUiKQp9Cgptb2RlbCB0cmFuY2hlc19kb3VibG9ucyB7CiAgSUQgICAgICAgICAgICAgICBJbnQgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBQYXlzICAgICAgICAgICAgIFN0cmluZyBAZGIuVmFyQ2hhcigzKQogIE1hZ2F6aW5lICAgICAgICAgU3RyaW5nIEBkYi5WYXJDaGFyKDYpCiAgTnVtZXJvICAgICAgICAgICBTdHJpbmcgQGRiLlZhckNoYXIoMTIpCiAgTnVtZXJvUmVmZXJlbmNlICBTdHJpbmcgQGRiLlZhckNoYXIoMTIpCiAgVHJhbmNoZVJlZmVyZW5jZSBJbnQ/CgogIEBAdW5pcXVlKFtQYXlzLCBNYWdhemluZSwgTnVtZXJvXSwgbWFwOiAidHJhbmNoZXNfZG91YmxvbnNfUGF5c19NYWdhemluZV9OdW1lcm9fdWluZGV4IikKICBAQGluZGV4KFtUcmFuY2hlUmVmZXJlbmNlXSwgbWFwOiAidHJhbmNoZXNfZG91YmxvbnNfdHJhbmNoZXNfcHJldGVzX0lEX2ZrIikKfQoKbW9kZWwgZWRnZSB7CiAgaWQgICAgICAgICAgICAgICAgICBJbnQgICAgICAgICAgICAgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIHB1YmxpY2F0aW9uY29kZSAgICAgU3RyaW5nICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDEyKQogIGlzc3VlbnVtYmVyICAgICAgICAgU3RyaW5nICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDEyKQogIGNyZWF0aW9uRGF0ZSAgICAgICAgRGF0ZVRpbWUgICAgICAgICAgIEBkZWZhdWx0KG5vdygpKSBAbWFwKCJkYXRlYWpvdXQiKSBAZGIuVGltZXN0YW1wKDApCiAgcG9pbnRzICAgICAgICAgICAgICBJbnQ/CiAgc2x1ZyAgICAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgQGRiLlZhckNoYXIoMzApCiAgaXNzdWVjb2RlICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgQHVuaXF1ZShtYXA6ICJ0cmFuY2hlc19wcmV0ZXNfaXNzdWVjb2RlX3VpbmRleCIpIEBkYi5WYXJDaGFyKDIzKQogIHVzZXJzX2NvbnRyaWJ1dGlvbnMgdXNlckNvbnRyaWJ1dGlvbltdCgogIEBAdW5pcXVlKFtwdWJsaWNhdGlvbmNvZGUsIGlzc3VlbnVtYmVyXSwgbWFwOiAidHJhbmNoZXNwcmV0ZXNfdW5pcXVlIikKICBAQGluZGV4KFtjcmVhdGlvbkRhdGVdLCBtYXA6ICJ0cmFuY2hlc19wcmV0ZXNfZGF0ZWFqb3V0X2luZGV4IikKICBAQG1hcCgidHJhbmNoZXNfcHJldGVzIikKfQoKbW9kZWwgdHJhbmNoZXNfcHJldGVzX2NvbnRyaWJ1dGV1cnMgewogIHB1YmxpY2F0aW9uY29kZSBTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTUpCiAgaXNzdWVudW1iZXIgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigzMCkKICBjb250cmlidXRldXIgICAgSW50CiAgY29udHJpYnV0aW9uICAgIHRyYW5jaGVzX3ByZXRlc19jb250cmlidXRldXJzX2NvbnRyaWJ1dGlvbiBAZGVmYXVsdChjcmVhdGV1cikKCiAgQEBpZChbcHVibGljYXRpb25jb2RlLCBpc3N1ZW51bWJlciwgY29udHJpYnV0ZXVyLCBjb250cmlidXRpb25dKQogIEBAaW5kZXgoW2NvbnRyaWJ1dGV1cl0sIG1hcDogInRyYW5jaGVzX3ByZXRlc19jb250cmlidXRldXJzX2NvbnRyaWJ1dGV1cl9pbmRleCIpCiAgQEBpbmRleChbcHVibGljYXRpb25jb2RlLCBpc3N1ZW51bWJlcl0sIG1hcDogInRyYW5jaGVzX3ByZXRlc19jb250cmlidXRldXJzX3B1YmxpY2F0aW9uY29kZV9pc3N1ZW51bWJlcl9pbmRleCIpCn0KCm1vZGVsIHRyYW5jaGVzX3ByZXRlc19jb250cmlidXRpb25zIHsKICBJRCAgICAgICAgICAgSW50ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpZCBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgSURfdHJhbmNoZSAgIEludAogIElEX3VzZXIgICAgICBJbnQKICBkYXRlYWpvdXQgICAgRGF0ZVRpbWUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkZWZhdWx0KG5vdygpKSBAZGIuVGltZXN0YW1wKDApCiAgY29udHJpYnV0aW9uIHRyYW5jaGVzX3ByZXRlc19jb250cmlidXRpb25zX2NvbnRyaWJ1dGlvbgogIHBvaW50c19uZXcgICBJbnQKICBwb2ludHNfdG90YWwgSW50CgogIEBAaW5kZXgoW0lEX3VzZXIsIGNvbnRyaWJ1dGlvbl0sIG1hcDogInRyYW5jaGVzX3ByZXRlc19jb250cmlidXRpb25zX0lEX3VzZXJfY29udHJpYnV0aW9uX2luZGV4IikKfQoKbW9kZWwgZWRnZVNwcml0ZSB7CiAgaWQgICAgICAgICBJbnQgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIGVkZ2VJZCAgICAgSW50ICAgIEBtYXAoIklEX1RyYW5jaGUiKQogIHNwcml0ZU5hbWUgU3RyaW5nIEBtYXAoIlNwcml0ZV9uYW1lIikgQGRiLlZhckNoYXIoMjUpCiAgc3ByaXRlU2l6ZSBJbnQ/ICAgQG1hcCgiU3ByaXRlX3NpemUiKQoKICBAQHVuaXF1ZShbZWRnZUlkLCBzcHJpdGVOYW1lXSwgbWFwOiAidHJhbmNoZXNfcHJldGVzX3Nwcml0ZXNfdW5pcXVlIikKICBAQG1hcCgidHJhbmNoZXNfcHJldGVzX3Nwcml0ZXMiKQp9Cgptb2RlbCBlZGdlU3ByaXRlU2l6ZSB7CiAgaWQgICAgICAgICBJbnQgICAgIEBpZCBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpIEBtYXAoIklEIikKICBzcHJpdGVOYW1lIFN0cmluZz8gQG1hcCgic3ByaXRlX25hbWUiKSBAZGIuVmFyQ2hhcigyNSkKICBzaXplICAgICAgIEludD8KCiAgQEBtYXAoInRyYW5jaGVzX3ByZXRlc19zcHJpdGVzX3NpemUiKQp9Cgptb2RlbCBlZGdlU3ByaXRlVXJsIHsKICBpZCAgICAgICAgIEludCAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKSBAbWFwKCJJRCIpCiAgc3ByaXRlTmFtZSBTdHJpbmcgQG1hcCgiU3ByaXRlX25hbWUiKSBAZGIuVmFyQ2hhcigyNSkKICB2ZXJzaW9uICAgIFN0cmluZyBAbWFwKCJWZXJzaW9uIikgQGRiLlZhckNoYXIoMTIpCgogIEBAdW5pcXVlKFtzcHJpdGVOYW1lLCB2ZXJzaW9uXSwgbWFwOiAidHJhbmNoZXNfcHJldGVzX3Nwcml0ZXNfdXJsc191bmlxdWUiKQogIEBAbWFwKCJ0cmFuY2hlc19wcmV0ZXNfc3ByaXRlc191cmxzIikKfQoKbW9kZWwgdXNlciB7CiAgaWQgICAgICAgICAgICAgICAgICAgICAgICAgIEludCAgICAgICAgICAgICAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKSBAbWFwKCJJRCIpCiAgdXNlcm5hbWUgICAgICAgICAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICBAdW5pcXVlKG1hcDogInVzZXJuYW1lIikgQGRiLlZhckNoYXIoMjUpCiAgcGFzc3dvcmQgICAgICAgICAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICBAZGIuVmFyQ2hhcig0MCkKICBhbGxvd1NoYXJpbmcgICAgICAgICAgICAgICAgQm9vbGVhbiAgICAgICAgICAgIEBkZWZhdWx0KHRydWUpIEBtYXAoIkFjY2VwdGVyUGFydGFnZSIpCiAgc2lnbnVwRGF0ZSAgICAgICAgICAgICAgICAgIERhdGVUaW1lICAgICAgICAgICBAbWFwKCJEYXRlSW5zY3JpcHRpb24iKSBAZGIuRGF0ZQogIGVtYWlsICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmcgICAgICAgICAgICAgQG1hcCgiRU1haWwiKSBAZGIuVmFyQ2hhcig1MCkKICBkaXNjb3JkSWQgICAgICAgICAgICAgICAgICAgSW50PyAgICAgICAgICAgICAgIEBtYXAoIklEX0Rpc2NvcmQiKQogIHNob3dSZWNvbW1lbmRhdGlvbnMgICAgICAgICBCb29sZWFuICAgICAgICAgICAgQGRlZmF1bHQodHJ1ZSkgQG1hcCgiUmVjb21tYW5kYXRpb25zTGlzdGVNYWdzIikKICBpc0JldGFVc2VyICAgICAgICAgICAgICAgICAgQm9vbGVhbiAgICAgICAgICAgIEBkZWZhdWx0KGZhbHNlKSBAbWFwKCJCZXRhVXNlciIpCiAgc2hvd1ByZXNlbnRhdGlvblZpZGVvICAgICAgIEJvb2xlYW4gICAgICAgICAgICBAZGVmYXVsdCh0cnVlKSBAbWFwKCJBZmZpY2hlclZpZGVvIikKICBzaG93RHVwbGljYXRlc0luQm9va2Nhc2UgICAgQm9vbGVhbiAgICAgICAgICAgIEBkZWZhdWx0KHRydWUpIEBtYXAoIkJpYmxpb3RoZXF1ZV9BZmZpY2hlckRvdWJsZXMiKQogIGJvb2tjYXNlVGV4dHVyZTEgICAgICAgICAgICBTdHJpbmcgICAgICAgICAgICAgQGRlZmF1bHQoImJvaXMiKSBAbWFwKCJCaWJsaW90aGVxdWVfVGV4dHVyZTEiKSBAZGIuVmFyQ2hhcigyMCkKICBib29rY2FzZVN1YlRleHR1cmUxICAgICAgICAgU3RyaW5nICAgICAgICAgICAgIEBkZWZhdWx0KCJIT05EVVJBUyBNQUhPR0FOWSIpIEBtYXAoIkJpYmxpb3RoZXF1ZV9Tb3VzX1RleHR1cmUxIikgQGRiLlZhckNoYXIoNTApCiAgYm9va2Nhc2VUZXh0dXJlMiAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICBAZGVmYXVsdCgiYm9pcyIpIEBtYXAoIkJpYmxpb3RoZXF1ZV9UZXh0dXJlMiIpIEBkYi5WYXJDaGFyKDIwKQogIGJvb2tjYXNlU3ViVGV4dHVyZTIgICAgICAgICBTdHJpbmcgICAgICAgICAgICAgQGRlZmF1bHQoIktOT1RUWSBQSU5FIikgQG1hcCgiQmlibGlvdGhlcXVlX1NvdXNfVGV4dHVyZTIiKSBAZGIuVmFyQ2hhcig1MCkKICBwcmVzZW50YXRpb25UZXh0ICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgIEBtYXAoIlRleHRlUHJlc2VudGF0aW9uIikgQGRiLlZhckNoYXIoMTAwKQogIGxhc3RBY2Nlc3MgICAgICAgICAgICAgICAgICBEYXRlVGltZT8gICAgICAgICAgQG1hcCgiRGVybmllckFjY2VzIikgQGRiLkRhdGVUaW1lKDApCiAgcHJldmlvdXNBY2Nlc3MgICAgICAgICAgICAgIERhdGVUaW1lPyAgICAgICAgICBAbWFwKCJQcmVjZWRlbnRBY2NlcyIpIEBkYi5EYXRlVGltZSgwKQogIG1hcmtldHBsYWNlQWNjZXB0c0V4Y2hhbmdlcyBCb29sZWFuICAgICAgICAgICAgQGRlZmF1bHQodHJ1ZSkgQG1hcCgiTWFya2V0cGxhY2VBY2NlcHRlRWNoYW5nZXMiKQogIGFib25uZW1lbnRzICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb25bXQogIGJvdXF1aW5lcmllc19jb21tZW50YWlyZXMgICBib29rc3RvcmVDb21tZW50W10KICB1c2Vyc19jb250cmlidXRpb25zICAgICAgICAgdXNlckNvbnRyaWJ1dGlvbltdCiAgdXNlcnNfb3B0aW9ucyAgICAgICAgICAgICAgIHVzZXJPcHRpb25bXQoKICBAQG1hcCgidXNlcnMiKQp9Cgptb2RlbCB1c2VyQ29udHJpYnV0aW9uIHsKICBpZCAgICAgICAgICAgICAgICAgICAgICAgIEludCAgICAgICAgICAgICAgIEBpZCBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpIEBtYXAoIklEIikKICB1c2VySWQgICAgICAgICAgICAgICAgICAgIEludCAgICAgICAgICAgICAgIEBtYXAoIklEX3VzZXIiKQogIGRhdGUgICAgICAgICAgICAgICAgICAgICAgRGF0ZVRpbWUgICAgICAgICAgQGRlZmF1bHQobm93KCkpIEBkYi5EYXRlVGltZSgwKQogIGNvbnRyaWJ1dGlvbiAgICAgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgQGRiLlZhckNoYXIoMjU1KQogIG5ld1BvaW50cyAgICAgICAgICAgICAgICAgSW50ICAgICAgICAgICAgICAgQG1hcCgicG9pbnRzX25ldyIpCiAgdG90YWxQb2ludHMgICAgICAgICAgICAgICBJbnQgICAgICAgICAgICAgICBAbWFwKCJwb2ludHNfdG90YWwiKQogIGlzRW1haWxTZW50ICAgICAgICAgICAgICAgQm9vbGVhbiAgICAgICAgICAgQG1hcCgiZW1haWxzX3NlbnQiKQogIGVkZ2VJZCAgICAgICAgICAgICAgICAgICAgSW50PyAgICAgICAgICAgICAgQG1hcCgiSURfdHJhbmNoZSIpCiAgYm9va3N0b3JlSWQgICAgICAgICAgICAgICBJbnQ/ICAgICAgICAgICAgICBAbWFwKCJJRF9ib29rc3RvcmUiKQogIGJvb2tzdG9yZUNvbW1lbnRJZCAgICAgICAgSW50PyAgICAgICAgICAgICAgQG1hcCgiSURfYm9va3N0b3JlX2NvbW1lbnQiKQogIHRyYW5jaGVzX3ByZXRlcyAgICAgICAgICAgZWRnZT8gICAgICAgICAgICAgQHJlbGF0aW9uKGZpZWxkczogW2VkZ2VJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBSZXN0cmljdCwgb25VcGRhdGU6IFJlc3RyaWN0LCBtYXA6ICJGS183RkRDMTZGMzc1NTY3MDQzIikKICBib3VxdWluZXJpZXMgICAgICAgICAgICAgIGJvb2tzdG9yZT8gICAgICAgIEByZWxhdGlvbihmaWVsZHM6IFtib29rc3RvcmVJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBSZXN0cmljdCwgb25VcGRhdGU6IFJlc3RyaWN0LCBtYXA6ICJGS183RkRDMTZGM0E1Nzc4QjZDIikKICB1c2VycyAgICAgICAgICAgICAgICAgICAgIHVzZXIgICAgICAgICAgICAgIEByZWxhdGlvbihmaWVsZHM6IFt1c2VySWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvblVwZGF0ZTogUmVzdHJpY3QsIG1hcDogInVzZXJzX2NvbnRyaWJ1dGlvbnNfX19ma191c2VyIikKICBib3VxdWluZXJpZXNfY29tbWVudGFpcmVzIGJvb2tzdG9yZUNvbW1lbnQ/IEByZWxhdGlvbihmaWVsZHM6IFtib29rc3RvcmVDb21tZW50SWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogUmVzdHJpY3QsIG9uVXBkYXRlOiBSZXN0cmljdCwgbWFwOiAidXNlcnNfY29udHJpYnV0aW9uc19ib3VxdWluZXJpZXNfY29tbWVudGFpcmVzX0lEX2ZrIikKCiAgQEBpbmRleChbZWRnZUlkXSwgbWFwOiAiSURYXzdGREMxNkYzNzU1NjcwNDMiKQogIEBAaW5kZXgoW2Jvb2tzdG9yZUlkXSwgbWFwOiAiSURYXzdGREMxNkYzQTU3NzhCNkMiKQogIEBAaW5kZXgoW3VzZXJJZCwgY29udHJpYnV0aW9uXSwgbWFwOiAidXNlcnNfY29udHJpYnV0aW9uc19fdXNlcl9jb250cmlidXRpb24iKQogIEBAaW5kZXgoW2Jvb2tzdG9yZUNvbW1lbnRJZF0sIG1hcDogInVzZXJzX2NvbnRyaWJ1dGlvbnNfYm91cXVpbmVyaWVzX2NvbW1lbnRhaXJlc19JRF9mayIpCiAgQEBtYXAoInVzZXJzX2NvbnRyaWJ1dGlvbnMiKQp9Cgptb2RlbCB1c2VyT3B0aW9uIHsKICBpZCAgICAgICAgICBJbnQgICAgICAgICAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKSBAbWFwKCJJRCIpCiAgdXNlcklkICAgICAgSW50ICAgICAgICAgICAgQG1hcCgiSURfVXNlciIpCiAgb3B0aW9uTmFtZSAgdXNlck9wdGlvblR5cGUgQG1hcCgiT3B0aW9uX25vbSIpCiAgb3B0aW9uVmFsdWUgU3RyaW5nICAgICAgICAgQG1hcCgiT3B0aW9uX3ZhbGV1ciIpIEBkYi5WYXJDaGFyKDUwKQogIHVzZXJzICAgICAgIHVzZXIgICAgICAgICAgIEByZWxhdGlvbihmaWVsZHM6IFt1c2VySWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvblVwZGF0ZTogUmVzdHJpY3QsIG1hcDogInVzZXJzX29wdGlvbnNfdXNlcnNfSURfZmsiKQoKICBAQHVuaXF1ZShbdXNlcklkLCBvcHRpb25OYW1lLCBvcHRpb25WYWx1ZV0sIG1hcDogInVzZXJzX29wdGlvbnNfX3VuaXF1ZSIpCiAgQEBpbmRleChbdXNlcklkLCBvcHRpb25OYW1lXSwgbWFwOiAidXNlcnNfb3B0aW9uc19fdXNlcl9vcHRpb24iKQogIEBAbWFwKCJ1c2Vyc19vcHRpb25zIikKfQoKbW9kZWwgdXNlclBhc3N3b3JkVG9rZW4gewogIGlkICAgICBJbnQgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIHVzZXJJZCBJbnQgICAgQG1hcCgiSURfVXNlciIpCiAgdG9rZW4gIFN0cmluZyBAbWFwKCJUb2tlbiIpIEBkYi5WYXJDaGFyKDE2KQoKICBAQHVuaXF1ZShbdXNlcklkLCB0b2tlbl0sIG1hcDogInVzZXJzX3Bhc3N3b3JkX3Rva2Vuc191bmlxdWUiKQogIEBAbWFwKCJ1c2Vyc19wYXNzd29yZF90b2tlbnMiKQp9Cgptb2RlbCB1c2VyUGVybWlzc2lvbiB7CiAgaWQgICAgICAgIEludCAgICAgICAgICAgICAgICAgICAgICAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKSBAbWFwKCJJRCIpCiAgdXNlcm5hbWUgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigyNSkKICByb2xlICAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDIwKQogIHByaXZpbGVnZSB1c2Vyc19wZXJtaXNzaW9uc19wcml2aWxlZ2UKCiAgQEB1bmlxdWUoW3VzZXJuYW1lLCByb2xlLCBwcml2aWxlZ2VdLCBtYXA6ICJwZXJtaXNzaW9uX3VzZXJuYW1lX3JvbGUiKQogIEBAbWFwKCJ1c2Vyc19wZXJtaXNzaW9ucyIpCn0KCm1vZGVsIHVzZXJzX3BvaW50cyB7CiAgSUQgICAgICAgICAgICAgICBJbnQgICAgICAgICAgICAgICAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIElEX1V0aWxpc2F0ZXVyICAgSW50CiAgVHlwZUNvbnRyaWJ1dGlvbiB1c2VyQ29udHJpYnV0aW9uVHlwZQogIE5iUG9pbnRzICAgICAgICAgSW50PyAgICAgICAgICAgICAgICAgQGRlZmF1bHQoMCkKfQoKbW9kZWwgdXNlclN1Z2dlc3Rpb25Ob3RpZmljYXRpb24gewogIGlkICAgICAgICBJbnQgICAgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIHVzZXJJZCAgICBJbnQgICAgICAgQG1hcCgiSURfVXNlciIpCiAgaXNzdWVjb2RlIFN0cmluZyAgICBAZGIuVmFyQ2hhcigxMikKICB0ZXh0ICAgICAgU3RyaW5nPyAgIEBkYi5UZXh0CiAgZGF0ZSAgICAgIERhdGVUaW1lPyBAZGVmYXVsdChub3coKSkgQGRiLkRhdGVUaW1lKDApCgogIEBAdW5pcXVlKFt1c2VySWQsIGlzc3VlY29kZV0sIG1hcDogInVzZXJzX25vdGlmaWNhdGlvbnNfX2luZGV4X3VzZXJfaXNzdWUiKQogIEBAbWFwKCJ1c2Vyc19zdWdnZXN0aW9uc19ub3RpZmljYXRpb25zIikKfQoKbW9kZWwgcmVxdWVzdGVkSXNzdWUgewogIGlkICAgICAgIEludCAgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIGlzc3VlSWQgIEludCAgICAgQG1hcCgiSURfTnVtZXJvIikKICBidXllcklkICBJbnQgICAgIEBtYXAoIklEX0FjaGV0ZXVyIikKICBpc0Jvb2tlZCBCb29sZWFuIEBkZWZhdWx0KGZhbHNlKSBAbWFwKCJlc3RfcmVzZXJ2ZSIpCgogIEBAdW5pcXVlKFtpc3N1ZUlkLCBidXllcklkXSwgbWFwOiAibnVtZXJvc19kZW1hbmRlc19JRF9OdW1lcm9fSURfQWNoZXRldXJfdWluZGV4IikKICBAQGluZGV4KFtidXllcklkXSwgbWFwOiAibnVtZXJvc19kZW1hbmRlc191c2Vyc19JRF9mayIpCiAgQEBtYXAoIm51bWVyb3NfZGVtYW5kZXMiKQp9CgplbnVtIHVzZXJPcHRpb25UeXBlIHsKICBzdWdnZXN0aW9uX25vdGlmaWNhdGlvbl9jb3VudHJ5CiAgc2FsZXNfbm90aWZpY2F0aW9uX3B1YmxpY2F0aW9ucwogIG1hcmtldHBsYWNlX2NvbnRhY3RfbWV0aG9kcwp9CgplbnVtIHVzZXJDb250cmlidXRpb25UeXBlIHsKICBwaG90b2dyYXBoZQogIGNyZWF0ZXVyCiAgZHVja2h1bnRlcgp9CgplbnVtIHVzZXJzX3Blcm1pc3Npb25zX3ByaXZpbGVnZSB7CiAgQWRtaW4KICBFZGl0aW9uCiAgQWZmaWNoYWdlCn0KCmVudW0gdHJhbmNoZXNfcHJldGVzX2NvbnRyaWJ1dGV1cnNfY29udHJpYnV0aW9uIHsKICBwaG90b2dyYXBoZQogIGNyZWF0ZXVyCn0KCmVudW0gdHJhbmNoZXNfcHJldGVzX2NvbnRyaWJ1dGlvbnNfY29udHJpYnV0aW9uIHsKICBwaG90b2dyYXBoZQogIGNyZWF0ZXVyCn0KCmVudW0gaXNzdWVfY29uZGl0aW9uIHsKICBtYXV2YWlzCiAgbW95ZW4KICBib24KICBpbmRlZmluaQp9Cg==",
  "inlineSchemaHash": "74a0fadb1e1d152f046f21c3713574733da60f59a41c4f6493bc705a0d9f5383",
  "noEngine": false
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "dist/prisma/client_dm",
    "prisma/client_dm",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"subscription\":{\"dbName\":\"abonnements\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_Utilisateur\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"dbName\":\"Pays\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"magazine\",\"dbName\":\"Magazine\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startDate\",\"dbName\":\"Date_debut\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endDate\",\"dbName\":\"Date_fin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user\",\"relationName\":\"subscriptionTouser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"country\",\"magazine\",\"userId\",\"startDate\",\"endDate\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"country\",\"magazine\",\"userId\",\"startDate\",\"endDate\"]}],\"isGenerated\":false},\"abonnements_sorties\":{\"dbName\":null,\"fields\":[{\"name\":\"Pays\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Magazine\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Numero\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Date_sortie\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Numeros_ajoutes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"Pays\",\"Magazine\",\"Numero\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"purchase\":{\"dbName\":\"achats\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID_Acquisition\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_User\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"date\",\"dbName\":\"Date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"dbName\":\"Description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"date\",\"description\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"date\",\"description\"]}],\"isGenerated\":false},\"authorUser\":{\"dbName\":\"auteurs_pseudos\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personcode\",\"dbName\":\"NomAuteurAbrege\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_user\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notation\",\"dbName\":\"Notation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":-1,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"personcode\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"personcode\"]}],\"isGenerated\":false},\"bibliotheque_contributeurs\":{\"dbName\":null,\"fields\":[{\"name\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Nom\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Texte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"bookcasePublicationOrder\":{\"dbName\":\"bibliotheque_ordre_magazines\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_Utilisateur\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"dbName\":\"Ordre\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"publicationcode\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"publicationcode\"]}],\"isGenerated\":false},\"bookstore\":{\"dbName\":\"bouquineries\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"dbName\":\"Nom\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"address\",\"dbName\":\"AdresseComplete\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"coordX\",\"dbName\":\"CoordX\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"coordY\",\"dbName\":\"CoordY\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookstoreComment\",\"relationName\":\"bookstoreTobookstoreComment\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users_contributions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"userContribution\",\"relationName\":\"bookstoreTouserContribution\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"bookstoreComment\":{\"dbName\":\"bouquineries_commentaires\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_Utilisateur\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comment\",\"dbName\":\"Commentaire\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creationDate\",\"dbName\":\"DateAjout\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"dbName\":\"Actif\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookstoreId\",\"dbName\":\"ID_Bouquinerie\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bouquineries\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookstore\",\"relationName\":\"bookstoreTobookstoreComment\",\"relationFromFields\":[\"bookstoreId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user\",\"relationName\":\"bookstoreCommentTouser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users_contributions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"userContribution\",\"relationName\":\"bookstoreCommentTouserContribution\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"demo\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastReset\",\"dbName\":\"DateDernierInit\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"magazines\":{\"dbName\":null,\"fields\":[{\"name\":\"PaysAbrege\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"NomAbrege\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"NomComplet\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"RedirigeDepuis\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"NeParaitPlus\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"PaysAbrege\",\"NomAbrege\",\"RedirigeDepuis\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"issue\":{\"dbName\":\"numeros\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"dbName\":\"Pays\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"magazine\",\"dbName\":\"Magazine\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuenumber\",\"dbName\":\"Numero\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"condition\",\"dbName\":\"Etat\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"issue_condition\",\"default\":\"indefini\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"purchaseId\",\"dbName\":\"ID_Acquisition\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":-1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isOnSale\",\"dbName\":\"AV\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isToRead\",\"dbName\":\"A_Lire\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isSubscription\",\"dbName\":\"Abonnement\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_Utilisateur\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creationDate\",\"dbName\":\"DateAjout\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"issuePopularity\":{\"dbName\":\"numeros_popularite\",\"fields\":[{\"name\":\"country\",\"dbName\":\"Pays\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"magazine\",\"dbName\":\"Magazine\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuenumber\",\"dbName\":\"Numero\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"popularity\",\"dbName\":\"Popularite\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"country\",\"magazine\",\"issuenumber\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"country\",\"magazine\",\"issuenumber\"]}],\"isGenerated\":false},\"tranches_doublons\":{\"dbName\":null,\"fields\":[{\"name\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Pays\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Magazine\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Numero\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"NumeroReference\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"TrancheReference\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"Pays\",\"Magazine\",\"Numero\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"Pays\",\"Magazine\",\"Numero\"]}],\"isGenerated\":false},\"edge\":{\"dbName\":\"tranches_pretes\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuenumber\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creationDate\",\"dbName\":\"dateajout\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"points\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"slug\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users_contributions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"userContribution\",\"relationName\":\"edgeTouserContribution\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"publicationcode\",\"issuenumber\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"publicationcode\",\"issuenumber\"]}],\"isGenerated\":false},\"tranches_pretes_contributeurs\":{\"dbName\":null,\"fields\":[{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuenumber\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contributeur\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contribution\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"tranches_pretes_contributeurs_contribution\",\"default\":\"createur\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"publicationcode\",\"issuenumber\",\"contributeur\",\"contribution\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"tranches_pretes_contributions\":{\"dbName\":null,\"fields\":[{\"name\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ID_tranche\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ID_user\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dateajout\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contribution\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"tranches_pretes_contributions_contribution\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"points_new\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"points_total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"edgeSprite\":{\"dbName\":\"tranches_pretes_sprites\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"edgeId\",\"dbName\":\"ID_Tranche\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"spriteName\",\"dbName\":\"Sprite_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"spriteSize\",\"dbName\":\"Sprite_size\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"edgeId\",\"spriteName\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"edgeId\",\"spriteName\"]}],\"isGenerated\":false},\"edgeSpriteSize\":{\"dbName\":\"tranches_pretes_sprites_size\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"spriteName\",\"dbName\":\"sprite_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"size\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"edgeSpriteUrl\":{\"dbName\":\"tranches_pretes_sprites_urls\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"spriteName\",\"dbName\":\"Sprite_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"version\",\"dbName\":\"Version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"spriteName\",\"version\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"spriteName\",\"version\"]}],\"isGenerated\":false},\"user\":{\"dbName\":\"users\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"allowSharing\",\"dbName\":\"AccepterPartage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"signupDate\",\"dbName\":\"DateInscription\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"dbName\":\"EMail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"discordId\",\"dbName\":\"ID_Discord\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"showRecommendations\",\"dbName\":\"RecommandationsListeMags\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isBetaUser\",\"dbName\":\"BetaUser\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"showPresentationVideo\",\"dbName\":\"AfficherVideo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"showDuplicatesInBookcase\",\"dbName\":\"Bibliotheque_AfficherDoubles\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookcaseTexture1\",\"dbName\":\"Bibliotheque_Texture1\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"bois\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookcaseSubTexture1\",\"dbName\":\"Bibliotheque_Sous_Texture1\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"HONDURAS MAHOGANY\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookcaseTexture2\",\"dbName\":\"Bibliotheque_Texture2\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"bois\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookcaseSubTexture2\",\"dbName\":\"Bibliotheque_Sous_Texture2\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"KNOTTY PINE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"presentationText\",\"dbName\":\"TextePresentation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastAccess\",\"dbName\":\"DernierAcces\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"previousAccess\",\"dbName\":\"PrecedentAcces\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"marketplaceAcceptsExchanges\",\"dbName\":\"MarketplaceAccepteEchanges\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"abonnements\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"subscription\",\"relationName\":\"subscriptionTouser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bouquineries_commentaires\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookstoreComment\",\"relationName\":\"bookstoreCommentTouser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users_contributions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"userContribution\",\"relationName\":\"userTouserContribution\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users_options\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"userOption\",\"relationName\":\"userTouserOption\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"userContribution\":{\"dbName\":\"users_contributions\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_user\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contribution\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"newPoints\",\"dbName\":\"points_new\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalPoints\",\"dbName\":\"points_total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isEmailSent\",\"dbName\":\"emails_sent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"edgeId\",\"dbName\":\"ID_tranche\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookstoreId\",\"dbName\":\"ID_bookstore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookstoreCommentId\",\"dbName\":\"ID_bookstore_comment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tranches_pretes\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"edge\",\"relationName\":\"edgeTouserContribution\",\"relationFromFields\":[\"edgeId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bouquineries\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookstore\",\"relationName\":\"bookstoreTouserContribution\",\"relationFromFields\":[\"bookstoreId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user\",\"relationName\":\"userTouserContribution\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bouquineries_commentaires\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"bookstoreComment\",\"relationName\":\"bookstoreCommentTouserContribution\",\"relationFromFields\":[\"bookstoreCommentId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"userOption\":{\"dbName\":\"users_options\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_User\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"optionName\",\"dbName\":\"Option_nom\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"userOptionType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"optionValue\",\"dbName\":\"Option_valeur\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"users\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user\",\"relationName\":\"userTouserOption\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"optionName\",\"optionValue\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"optionName\",\"optionValue\"]}],\"isGenerated\":false},\"userPasswordToken\":{\"dbName\":\"users_password_tokens\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_User\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"token\",\"dbName\":\"Token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"token\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"token\"]}],\"isGenerated\":false},\"userPermission\":{\"dbName\":\"users_permissions\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"privilege\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"users_permissions_privilege\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"username\",\"role\",\"privilege\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"username\",\"role\",\"privilege\"]}],\"isGenerated\":false},\"users_points\":{\"dbName\":null,\"fields\":[{\"name\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ID_Utilisateur\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"TypeContribution\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"userContributionType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"NbPoints\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"userSuggestionNotification\":{\"dbName\":\"users_suggestions_notifications\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_User\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"text\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"issuecode\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"issuecode\"]}],\"isGenerated\":false},\"requestedIssue\":{\"dbName\":\"numeros_demandes\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issueId\",\"dbName\":\"ID_Numero\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"buyerId\",\"dbName\":\"ID_Acheteur\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isBooked\",\"dbName\":\"est_reserve\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"issueId\",\"buyerId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"issueId\",\"buyerId\"]}],\"isGenerated\":false}},\"enums\":{\"userOptionType\":{\"values\":[{\"name\":\"suggestion_notification_country\",\"dbName\":null},{\"name\":\"sales_notification_publications\",\"dbName\":null},{\"name\":\"marketplace_contact_methods\",\"dbName\":null}],\"dbName\":null},\"userContributionType\":{\"values\":[{\"name\":\"photographe\",\"dbName\":null},{\"name\":\"createur\",\"dbName\":null},{\"name\":\"duckhunter\",\"dbName\":null}],\"dbName\":null},\"users_permissions_privilege\":{\"values\":[{\"name\":\"Admin\",\"dbName\":null},{\"name\":\"Edition\",\"dbName\":null},{\"name\":\"Affichage\",\"dbName\":null}],\"dbName\":null},\"tranches_pretes_contributeurs_contribution\":{\"values\":[{\"name\":\"photographe\",\"dbName\":null},{\"name\":\"createur\",\"dbName\":null}],\"dbName\":null},\"tranches_pretes_contributions_contribution\":{\"values\":[{\"name\":\"photographe\",\"dbName\":null},{\"name\":\"createur\",\"dbName\":null}],\"dbName\":null},\"issue_condition\":{\"values\":[{\"name\":\"mauvais\",\"dbName\":null},{\"name\":\"moyen\",\"dbName\":null},{\"name\":\"bon\",\"dbName\":null},{\"name\":\"indefini\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
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
path.join(process.cwd(), "dist/prisma/client_dm/libquery_engine-debian-openssl-1.1.x.so.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-3.0.x.so.node");
path.join(process.cwd(), "dist/prisma/client_dm/libquery_engine-debian-openssl-3.0.x.so.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "dist/prisma/client_dm/schema.prisma")
