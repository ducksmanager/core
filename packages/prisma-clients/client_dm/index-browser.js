
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  detectRuntime,
} = require('./runtime/index-browser')


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

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  throw new Error(`Extensions.getExtensionContext is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.defineExtension = () => {
  throw new Error(`Extensions.defineExtension is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}

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
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        const runtime = detectRuntime()
        const edgeRuntimeName = {
          'workerd': 'Cloudflare Workers',
          'deno': 'Deno and Deno Deploy',
          'netlify': 'Netlify Edge Functions',
          'edge-light': 'Vercel Edge Functions',
        }[runtime]

        let message = 'PrismaClient is unable to run in '
        if (edgeRuntimeName !== undefined) {
          message += edgeRuntimeName + '. As an alternative, try Accelerate: https://pris.ly/d/accelerate.'
        } else {
          message += 'this browser environment, or has been bundled for the browser (running in `' + runtime + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://github.com/prisma/prisma/issues`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
