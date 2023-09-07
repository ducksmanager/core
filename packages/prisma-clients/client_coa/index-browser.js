
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

exports.Prisma.Datasets_entryurlsScalarFieldEnum = {
  id: 'id',
  dataset_id: 'dataset_id',
  sitecode_url: 'sitecode_url'
};

exports.Prisma.Inducks_appearanceScalarFieldEnum = {
  storyversioncode: 'storyversioncode',
  charactercode: 'charactercode',
  number: 'number',
  appearancecomment: 'appearancecomment',
  doubt: 'doubt'
};

exports.Prisma.Inducks_characterScalarFieldEnum = {
  charactercode: 'charactercode',
  charactername: 'charactername',
  official: 'official',
  onetime: 'onetime',
  heroonly: 'heroonly',
  charactercomment: 'charactercomment'
};

exports.Prisma.Inducks_characteraliasScalarFieldEnum = {
  charactercode: 'charactercode',
  charactername: 'charactername'
};

exports.Prisma.Inducks_characterdetailScalarFieldEnum = {
  charactername: 'charactername',
  charactercode: 'charactercode',
  number: 'number'
};

exports.Prisma.Inducks_characternameScalarFieldEnum = {
  charactercode: 'charactercode',
  languagecode: 'languagecode',
  charactername: 'charactername',
  preferred: 'preferred',
  characternamecomment: 'characternamecomment'
};

exports.Prisma.Inducks_characterreferenceScalarFieldEnum = {
  fromcharactercode: 'fromcharactercode',
  tocharactercode: 'tocharactercode',
  isgroupofcharacters: 'isgroupofcharacters'
};

exports.Prisma.Inducks_characterurlScalarFieldEnum = {
  charactercode: 'charactercode',
  sitecode: 'sitecode',
  url: 'url'
};

exports.Prisma.Inducks_countryScalarFieldEnum = {
  countrycode: 'countrycode',
  countryname: 'countryname',
  defaultlanguage: 'defaultlanguage',
  defaultmaintenanceteam: 'defaultmaintenanceteam'
};

exports.Prisma.Inducks_countrynameScalarFieldEnum = {
  countrycode: 'countrycode',
  languagecode: 'languagecode',
  countryname: 'countryname'
};

exports.Prisma.Inducks_currencyScalarFieldEnum = {
  currencycode: 'currencycode',
  currencyname: 'currencyname'
};

exports.Prisma.Inducks_currencynameScalarFieldEnum = {
  currencycode: 'currencycode',
  languagecode: 'languagecode',
  shortcurrencyname: 'shortcurrencyname',
  longcurrencyname: 'longcurrencyname'
};

exports.Prisma.Inducks_entryScalarFieldEnum = {
  entrycode: 'entrycode',
  issuecode: 'issuecode',
  storyversioncode: 'storyversioncode',
  languagecode: 'languagecode',
  includedinentrycode: 'includedinentrycode',
  position: 'position',
  printedcode: 'printedcode',
  guessedcode: 'guessedcode',
  title: 'title',
  reallytitle: 'reallytitle',
  printedhero: 'printedhero',
  changes: 'changes',
  cut: 'cut',
  minorchanges: 'minorchanges',
  missingpanels: 'missingpanels',
  mirrored: 'mirrored',
  sideways: 'sideways',
  startdate: 'startdate',
  enddate: 'enddate',
  identificationuncertain: 'identificationuncertain',
  alsoreprint: 'alsoreprint',
  part: 'part',
  entrycomment: 'entrycomment',
  error: 'error'
};

exports.Prisma.Inducks_entry_nofulltextScalarFieldEnum = {
  entrycode: 'entrycode',
  issuecode: 'issuecode',
  storyversioncode: 'storyversioncode',
  languagecode: 'languagecode',
  includedinentrycode: 'includedinentrycode',
  position: 'position',
  printedcode: 'printedcode',
  guessedcode: 'guessedcode',
  title: 'title',
  reallytitle: 'reallytitle',
  printedhero: 'printedhero',
  changes: 'changes',
  cut: 'cut',
  minorchanges: 'minorchanges',
  missingpanels: 'missingpanels',
  mirrored: 'mirrored',
  sideways: 'sideways',
  startdate: 'startdate',
  enddate: 'enddate',
  identificationuncertain: 'identificationuncertain',
  alsoreprint: 'alsoreprint',
  part: 'part',
  entrycomment: 'entrycomment',
  error: 'error'
};

exports.Prisma.Inducks_entrycharacternameScalarFieldEnum = {
  entrycode: 'entrycode',
  charactercode: 'charactercode',
  charactername: 'charactername'
};

exports.Prisma.Inducks_entryjobScalarFieldEnum = {
  entrycode: 'entrycode',
  personcode: 'personcode',
  transletcol: 'transletcol',
  entryjobcomment: 'entryjobcomment',
  doubt: 'doubt'
};

exports.Prisma.Inducks_entryurlScalarFieldEnum = {
  entrycode: 'entrycode',
  sitecode: 'sitecode',
  pagenumber: 'pagenumber',
  url: 'url',
  storycode: 'storycode',
  public: 'public',
  id: 'id'
};

exports.Prisma.Inducks_equivScalarFieldEnum = {
  issuecode: 'issuecode',
  equivid: 'equivid',
  equivcomment: 'equivcomment'
};

exports.Prisma.Inducks_herocharacterScalarFieldEnum = {
  storycode: 'storycode',
  charactercode: 'charactercode',
  number: 'number',
  doubt: 'doubt'
};

exports.Prisma.Inducks_inputfileScalarFieldEnum = {
  inputfilecode: 'inputfilecode',
  path: 'path',
  filename: 'filename',
  layout: 'layout',
  locked: 'locked',
  maintenanceteamcode: 'maintenanceteamcode',
  countrycode: 'countrycode',
  languagecode: 'languagecode',
  producercode: 'producercode',
  secundary: 'secundary'
};

exports.Prisma.Inducks_issueScalarFieldEnum = {
  issuecode: 'issuecode',
  issuerangecode: 'issuerangecode',
  publicationcode: 'publicationcode',
  issuenumber: 'issuenumber',
  title: 'title',
  size: 'size',
  pages: 'pages',
  price: 'price',
  printrun: 'printrun',
  attached: 'attached',
  oldestdate: 'oldestdate',
  fullyindexed: 'fullyindexed',
  issuecomment: 'issuecomment',
  error: 'error',
  filledoldestdate: 'filledoldestdate',
  locked: 'locked',
  inxforbidden: 'inxforbidden',
  inputfilecode: 'inputfilecode',
  maintenanceteamcode: 'maintenanceteamcode'
};

exports.Prisma.Inducks_issuecollectingScalarFieldEnum = {
  collectingissuecode: 'collectingissuecode',
  collectedissuecode: 'collectedissuecode'
};

exports.Prisma.Inducks_issuedateScalarFieldEnum = {
  issuecode: 'issuecode',
  date: 'date',
  kindofdate: 'kindofdate',
  doubt: 'doubt'
};

exports.Prisma.Inducks_issuejobScalarFieldEnum = {
  issuecode: 'issuecode',
  personcode: 'personcode',
  inxtransletcol: 'inxtransletcol',
  issuejobcomment: 'issuejobcomment',
  doubt: 'doubt'
};

exports.Prisma.Inducks_issuepriceScalarFieldEnum = {
  issuecode: 'issuecode',
  amount: 'amount',
  currency: 'currency',
  comment: 'comment',
  sequencenumber: 'sequencenumber'
};

exports.Prisma.Inducks_issuequotationScalarFieldEnum = {
  ID: 'ID',
  publicationcode: 'publicationcode',
  issuenumber: 'issuenumber',
  estimationmin: 'estimationmin',
  estimationmax: 'estimationmax',
  scrapedate: 'scrapedate',
  source: 'source',
  issuecode: 'issuecode'
};

exports.Prisma.Inducks_issuerangeScalarFieldEnum = {
  issuerangecode: 'issuerangecode',
  publicationcode: 'publicationcode',
  title: 'title',
  circulation: 'circulation',
  issuerangecomment: 'issuerangecomment',
  numbersarefake: 'numbersarefake',
  error: 'error'
};

exports.Prisma.Inducks_issueurlScalarFieldEnum = {
  issuecode: 'issuecode',
  sitecode: 'sitecode',
  url: 'url'
};

exports.Prisma.Inducks_languageScalarFieldEnum = {
  languagecode: 'languagecode',
  defaultlanguagecode: 'defaultlanguagecode',
  languagename: 'languagename'
};

exports.Prisma.Inducks_languagenameScalarFieldEnum = {
  desclanguagecode: 'desclanguagecode',
  languagecode: 'languagecode',
  languagename: 'languagename'
};

exports.Prisma.Inducks_logScalarFieldEnum = {
  number: 'number',
  logkey: 'logkey',
  storycode: 'storycode',
  logid: 'logid',
  logtype: 'logtype',
  par1: 'par1',
  par2: 'par2',
  par3: 'par3',
  marked: 'marked',
  inputfilecode: 'inputfilecode',
  maintenanceteamcode: 'maintenanceteamcode'
};

exports.Prisma.Inducks_logdataScalarFieldEnum = {
  logid: 'logid',
  category: 'category',
  logtext: 'logtext'
};

exports.Prisma.Inducks_logocharacterScalarFieldEnum = {
  entrycode: 'entrycode',
  charactercode: 'charactercode',
  reallyintitle: 'reallyintitle',
  number: 'number',
  logocharactercomment: 'logocharactercomment'
};

exports.Prisma.Inducks_movieScalarFieldEnum = {
  moviecode: 'moviecode',
  title: 'title',
  moviecomment: 'moviecomment',
  appsummary: 'appsummary',
  moviejobsummary: 'moviejobsummary',
  locked: 'locked',
  inputfilecode: 'inputfilecode',
  maintenanceteamcode: 'maintenanceteamcode',
  aka: 'aka',
  creationdate: 'creationdate',
  moviedescription: 'moviedescription',
  distributor: 'distributor',
  genre: 'genre',
  orderer: 'orderer',
  publicationdate: 'publicationdate',
  source: 'source',
  tim: 'tim'
};

exports.Prisma.Inducks_moviecharacterScalarFieldEnum = {
  moviecode: 'moviecode',
  charactercode: 'charactercode',
  istitlecharacter: 'istitlecharacter'
};

exports.Prisma.Inducks_moviejobScalarFieldEnum = {
  moviecode: 'moviecode',
  personcode: 'personcode',
  role: 'role',
  moviejobcomment: 'moviejobcomment',
  indirect: 'indirect',
  doubt: 'doubt'
};

exports.Prisma.Inducks_moviereferenceScalarFieldEnum = {
  storycode: 'storycode',
  moviecode: 'moviecode',
  referencereasonid: 'referencereasonid',
  frommovietostory: 'frommovietostory'
};

exports.Prisma.Inducks_personScalarFieldEnum = {
  personcode: 'personcode',
  nationalitycountrycode: 'nationalitycountrycode',
  fullname: 'fullname',
  official: 'official',
  personcomment: 'personcomment',
  unknownstudiomember: 'unknownstudiomember',
  isfake: 'isfake',
  numberofindexedissues: 'numberofindexedissues',
  birthname: 'birthname',
  borndate: 'borndate',
  bornplace: 'bornplace',
  deceaseddate: 'deceaseddate',
  deceasedplace: 'deceasedplace',
  education: 'education',
  moviestext: 'moviestext',
  comicstext: 'comicstext',
  othertext: 'othertext',
  photofilename: 'photofilename',
  photocomment: 'photocomment',
  photosource: 'photosource',
  personrefs: 'personrefs'
};

exports.Prisma.Inducks_personurlScalarFieldEnum = {
  personcode: 'personcode',
  sitecode: 'sitecode',
  url: 'url'
};

exports.Prisma.Inducks_publicationScalarFieldEnum = {
  publicationcode: 'publicationcode',
  countrycode: 'countrycode',
  languagecode: 'languagecode',
  title: 'title',
  size: 'size',
  publicationcomment: 'publicationcomment',
  circulation: 'circulation',
  numbersarefake: 'numbersarefake',
  error: 'error',
  locked: 'locked',
  inxforbidden: 'inxforbidden',
  inputfilecode: 'inputfilecode',
  maintenanceteamcode: 'maintenanceteamcode'
};

exports.Prisma.Inducks_publicationcategoryScalarFieldEnum = {
  publicationcode: 'publicationcode',
  category: 'category'
};

exports.Prisma.Inducks_publicationnameScalarFieldEnum = {
  publicationcode: 'publicationcode',
  publicationname: 'publicationname'
};

exports.Prisma.Inducks_publicationurlScalarFieldEnum = {
  publicationcode: 'publicationcode',
  sitecode: 'sitecode',
  url: 'url'
};

exports.Prisma.Inducks_publisherScalarFieldEnum = {
  publisherid: 'publisherid',
  publishername: 'publishername'
};

exports.Prisma.Inducks_publishingjobScalarFieldEnum = {
  publisherid: 'publisherid',
  issuecode: 'issuecode',
  publishingjobcomment: 'publishingjobcomment'
};

exports.Prisma.Inducks_referencereasonScalarFieldEnum = {
  referencereasonid: 'referencereasonid',
  referencereasontext: 'referencereasontext'
};

exports.Prisma.Inducks_referencereasonnameScalarFieldEnum = {
  referencereasonid: 'referencereasonid',
  languagecode: 'languagecode',
  referencereasontranslation: 'referencereasontranslation'
};

exports.Prisma.Inducks_siteScalarFieldEnum = {
  sitecode: 'sitecode',
  urlbase: 'urlbase',
  images: 'images',
  sitename: 'sitename',
  sitelogo: 'sitelogo',
  properties: 'properties'
};

exports.Prisma.Inducks_statcharactercharacterScalarFieldEnum = {
  charactercode: 'charactercode',
  cocharactercode: 'cocharactercode',
  total: 'total',
  yearrange: 'yearrange'
};

exports.Prisma.Inducks_statcharactercountryScalarFieldEnum = {
  charactercode: 'charactercode',
  countrycode: 'countrycode',
  total: 'total'
};

exports.Prisma.Inducks_statcharacterstoryScalarFieldEnum = {
  charactercode: 'charactercode',
  storyheadercode: 'storyheadercode',
  total: 'total',
  yearrange: 'yearrange'
};

exports.Prisma.Inducks_statpersoncharacterScalarFieldEnum = {
  personcode: 'personcode',
  charactercode: 'charactercode',
  total: 'total',
  yearrange: 'yearrange'
};

exports.Prisma.Inducks_statpersoncountryScalarFieldEnum = {
  personcode: 'personcode',
  countrycode: 'countrycode',
  total: 'total'
};

exports.Prisma.Inducks_statpersonpersonScalarFieldEnum = {
  personcode: 'personcode',
  copersoncode: 'copersoncode',
  total: 'total',
  yearrange: 'yearrange'
};

exports.Prisma.Inducks_statpersonstoryScalarFieldEnum = {
  personcode: 'personcode',
  storyheadercode: 'storyheadercode',
  total: 'total',
  yearrange: 'yearrange'
};

exports.Prisma.Inducks_storyScalarFieldEnum = {
  storycode: 'storycode',
  originalstoryversioncode: 'originalstoryversioncode',
  creationdate: 'creationdate',
  firstpublicationdate: 'firstpublicationdate',
  endpublicationdate: 'endpublicationdate',
  title: 'title',
  usedifferentcode: 'usedifferentcode',
  storycomment: 'storycomment',
  error: 'error',
  repcountrysummary: 'repcountrysummary',
  storyparts: 'storyparts',
  locked: 'locked',
  inputfilecode: 'inputfilecode',
  issuecodeofstoryitem: 'issuecodeofstoryitem',
  maintenanceteamcode: 'maintenanceteamcode',
  storyheadercode: 'storyheadercode'
};

exports.Prisma.Inducks_storycodesScalarFieldEnum = {
  storycode: 'storycode',
  alternativecode: 'alternativecode',
  unpackedcode: 'unpackedcode',
  codecomment: 'codecomment'
};

exports.Prisma.Inducks_storydescriptionScalarFieldEnum = {
  storyversioncode: 'storyversioncode',
  languagecode: 'languagecode',
  desctext: 'desctext'
};

exports.Prisma.Inducks_storyheaderScalarFieldEnum = {
  storyheadercode: 'storyheadercode',
  level: 'level',
  title: 'title',
  storyheadercomment: 'storyheadercomment',
  countrycode: 'countrycode'
};

exports.Prisma.Inducks_storyjobScalarFieldEnum = {
  storyversioncode: 'storyversioncode',
  personcode: 'personcode',
  plotwritartink: 'plotwritartink',
  storyjobcomment: 'storyjobcomment',
  indirect: 'indirect',
  doubt: 'doubt'
};

exports.Prisma.Inducks_storyreferenceScalarFieldEnum = {
  fromstorycode: 'fromstorycode',
  tostorycode: 'tostorycode',
  referencereasonid: 'referencereasonid'
};

exports.Prisma.Inducks_storysubseriesScalarFieldEnum = {
  storycode: 'storycode',
  subseriescode: 'subseriescode',
  storysubseriescomment: 'storysubseriescomment'
};

exports.Prisma.Inducks_storyurlScalarFieldEnum = {
  storycode: 'storycode',
  sitecode: 'sitecode',
  url: 'url'
};

exports.Prisma.Inducks_storyversionScalarFieldEnum = {
  storyversioncode: 'storyversioncode',
  storycode: 'storycode',
  entirepages: 'entirepages',
  brokenpagenumerator: 'brokenpagenumerator',
  brokenpagedenominator: 'brokenpagedenominator',
  brokenpageunspecified: 'brokenpageunspecified',
  kind: 'kind',
  rowsperpage: 'rowsperpage',
  columnsperpage: 'columnsperpage',
  appisxapp: 'appisxapp',
  what: 'what',
  appsummary: 'appsummary',
  plotsummary: 'plotsummary',
  writsummary: 'writsummary',
  artsummary: 'artsummary',
  inksummary: 'inksummary',
  creatorrefsummary: 'creatorrefsummary',
  keywordsummary: 'keywordsummary',
  estimatedpanels: 'estimatedpanels'
};

exports.Prisma.Inducks_storyversion_nofulltextScalarFieldEnum = {
  storyversioncode: 'storyversioncode',
  storycode: 'storycode',
  entirepages: 'entirepages',
  brokenpagenumerator: 'brokenpagenumerator',
  brokenpagedenominator: 'brokenpagedenominator',
  brokenpageunspecified: 'brokenpageunspecified',
  kind: 'kind',
  rowsperpage: 'rowsperpage',
  columnsperpage: 'columnsperpage',
  appisxapp: 'appisxapp',
  what: 'what',
  appsummary: 'appsummary',
  plotsummary: 'plotsummary',
  writsummary: 'writsummary',
  artsummary: 'artsummary',
  inksummary: 'inksummary',
  creatorrefsummary: 'creatorrefsummary',
  keywordsummary: 'keywordsummary',
  estimatedpanels: 'estimatedpanels'
};

exports.Prisma.Inducks_studioScalarFieldEnum = {
  studiocode: 'studiocode',
  countrycode: 'countrycode',
  studioname: 'studioname',
  city: 'city',
  description: 'description',
  othertext: 'othertext',
  photofilename: 'photofilename',
  photocomment: 'photocomment',
  photosource: 'photosource',
  studiorefs: 'studiorefs'
};

exports.Prisma.Inducks_studioworkScalarFieldEnum = {
  studiocode: 'studiocode',
  personcode: 'personcode'
};

exports.Prisma.Inducks_subseriesScalarFieldEnum = {
  subseriescode: 'subseriescode',
  subseriesname: 'subseriesname',
  official: 'official',
  subseriescomment: 'subseriescomment',
  subseriescategory: 'subseriescategory'
};

exports.Prisma.Inducks_subseriesnameScalarFieldEnum = {
  subseriescode: 'subseriescode',
  languagecode: 'languagecode',
  subseriesname: 'subseriesname',
  preferred: 'preferred',
  subseriesnamecomment: 'subseriesnamecomment'
};

exports.Prisma.Inducks_substoryScalarFieldEnum = {
  storycode: 'storycode',
  originalstoryversioncode: 'originalstoryversioncode',
  superstorycode: 'superstorycode',
  part: 'part',
  firstpublicationdate: 'firstpublicationdate',
  title: 'title',
  substorycomment: 'substorycomment',
  error: 'error',
  locked: 'locked',
  inputfilecode: 'inputfilecode',
  maintenanceteamcode: 'maintenanceteamcode'
};

exports.Prisma.Inducks_teamScalarFieldEnum = {
  teamcode: 'teamcode',
  teamdescriptionname: 'teamdescriptionname',
  teamshortname: 'teamshortname'
};

exports.Prisma.Inducks_teammemberScalarFieldEnum = {
  teamcode: 'teamcode',
  personcode: 'personcode'
};

exports.Prisma.Inducks_ucrelationScalarFieldEnum = {
  universecode: 'universecode',
  charactercode: 'charactercode'
};

exports.Prisma.Inducks_universeScalarFieldEnum = {
  universecode: 'universecode',
  universecomment: 'universecomment'
};

exports.Prisma.Inducks_universenameScalarFieldEnum = {
  universecode: 'universecode',
  languagecode: 'languagecode',
  universename: 'universename'
};

exports.Prisma.Numeros_cptScalarFieldEnum = {
  Pays: 'Pays',
  Magazine: 'Magazine',
  publicationcode: 'publicationcode',
  Numero: 'Numero',
  Cpt: 'Cpt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.inducks_appearance_doubt = exports.$Enums.inducks_appearance_doubt = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_character_official = exports.$Enums.inducks_character_official = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_character_onetime = exports.$Enums.inducks_character_onetime = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_character_heroonly = exports.$Enums.inducks_character_heroonly = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_charactername_preferred = exports.$Enums.inducks_charactername_preferred = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_characterreference_isgroupofcharacters = exports.$Enums.inducks_characterreference_isgroupofcharacters = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_entry_reallytitle = exports.$Enums.inducks_entry_reallytitle = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_entry_mirrored = exports.$Enums.inducks_entry_mirrored = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_entry_sideways = exports.$Enums.inducks_entry_sideways = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_entry_identificationuncertain = exports.$Enums.inducks_entry_identificationuncertain = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_entry_error = exports.$Enums.inducks_entry_error = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_entry_nofulltext_reallytitle = exports.$Enums.inducks_entry_nofulltext_reallytitle = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_entry_nofulltext_mirrored = exports.$Enums.inducks_entry_nofulltext_mirrored = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_entry_nofulltext_sideways = exports.$Enums.inducks_entry_nofulltext_sideways = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_entry_nofulltext_identificationuncertain = exports.$Enums.inducks_entry_nofulltext_identificationuncertain = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_entry_nofulltext_error = exports.$Enums.inducks_entry_nofulltext_error = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_entryjob_doubt = exports.$Enums.inducks_entryjob_doubt = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_entryurl_public = exports.$Enums.inducks_entryurl_public = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_herocharacter_doubt = exports.$Enums.inducks_herocharacter_doubt = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_inputfile_locked = exports.$Enums.inducks_inputfile_locked = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_inputfile_secundary = exports.$Enums.inducks_inputfile_secundary = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_issue_fullyindexed = exports.$Enums.inducks_issue_fullyindexed = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_issue_error = exports.$Enums.inducks_issue_error = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_issue_locked = exports.$Enums.inducks_issue_locked = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_issue_inxforbidden = exports.$Enums.inducks_issue_inxforbidden = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_issuedate_doubt = exports.$Enums.inducks_issuedate_doubt = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_issuejob_doubt = exports.$Enums.inducks_issuejob_doubt = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_issuerange_numbersarefake = exports.$Enums.inducks_issuerange_numbersarefake = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_issuerange_error = exports.$Enums.inducks_issuerange_error = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_log_marked = exports.$Enums.inducks_log_marked = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_logocharacter_reallyintitle = exports.$Enums.inducks_logocharacter_reallyintitle = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_movie_locked = exports.$Enums.inducks_movie_locked = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_moviecharacter_istitlecharacter = exports.$Enums.inducks_moviecharacter_istitlecharacter = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_moviejob_indirect = exports.$Enums.inducks_moviejob_indirect = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_moviejob_doubt = exports.$Enums.inducks_moviejob_doubt = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_moviereference_frommovietostory = exports.$Enums.inducks_moviereference_frommovietostory = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_person_official = exports.$Enums.inducks_person_official = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_person_unknownstudiomember = exports.$Enums.inducks_person_unknownstudiomember = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_person_isfake = exports.$Enums.inducks_person_isfake = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_publication_numbersarefake = exports.$Enums.inducks_publication_numbersarefake = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_publication_error = exports.$Enums.inducks_publication_error = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_publication_locked = exports.$Enums.inducks_publication_locked = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_publication_inxforbidden = exports.$Enums.inducks_publication_inxforbidden = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_site_images = exports.$Enums.inducks_site_images = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_story_error = exports.$Enums.inducks_story_error = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_story_locked = exports.$Enums.inducks_story_locked = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_storyjob_indirect = exports.$Enums.inducks_storyjob_indirect = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_storyjob_doubt = exports.$Enums.inducks_storyjob_doubt = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_storyversion_brokenpageunspecified = exports.$Enums.inducks_storyversion_brokenpageunspecified = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_storyversion_appisxapp = exports.$Enums.inducks_storyversion_appisxapp = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_storyversion_nofulltext_brokenpageunspecified = exports.$Enums.inducks_storyversion_nofulltext_brokenpageunspecified = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_storyversion_nofulltext_appisxapp = exports.$Enums.inducks_storyversion_nofulltext_appisxapp = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_subseries_official = exports.$Enums.inducks_subseries_official = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_subseriesname_preferred = exports.$Enums.inducks_subseriesname_preferred = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_substory_error = exports.$Enums.inducks_substory_error = {
  Y: 'Y',
  N: 'N'
};

exports.inducks_substory_locked = exports.$Enums.inducks_substory_locked = {
  Y: 'Y',
  N: 'N'
};

exports.Prisma.ModelName = {
  datasets_entryurls: 'datasets_entryurls',
  inducks_appearance: 'inducks_appearance',
  inducks_character: 'inducks_character',
  inducks_characteralias: 'inducks_characteralias',
  inducks_characterdetail: 'inducks_characterdetail',
  inducks_charactername: 'inducks_charactername',
  inducks_characterreference: 'inducks_characterreference',
  inducks_characterurl: 'inducks_characterurl',
  inducks_country: 'inducks_country',
  inducks_countryname: 'inducks_countryname',
  inducks_currency: 'inducks_currency',
  inducks_currencyname: 'inducks_currencyname',
  inducks_entry: 'inducks_entry',
  inducks_entry_nofulltext: 'inducks_entry_nofulltext',
  inducks_entrycharactername: 'inducks_entrycharactername',
  inducks_entryjob: 'inducks_entryjob',
  inducks_entryurl: 'inducks_entryurl',
  inducks_equiv: 'inducks_equiv',
  inducks_herocharacter: 'inducks_herocharacter',
  inducks_inputfile: 'inducks_inputfile',
  inducks_issue: 'inducks_issue',
  inducks_issuecollecting: 'inducks_issuecollecting',
  inducks_issuedate: 'inducks_issuedate',
  inducks_issuejob: 'inducks_issuejob',
  inducks_issueprice: 'inducks_issueprice',
  inducks_issuequotation: 'inducks_issuequotation',
  inducks_issuerange: 'inducks_issuerange',
  inducks_issueurl: 'inducks_issueurl',
  inducks_language: 'inducks_language',
  inducks_languagename: 'inducks_languagename',
  inducks_log: 'inducks_log',
  inducks_logdata: 'inducks_logdata',
  inducks_logocharacter: 'inducks_logocharacter',
  inducks_movie: 'inducks_movie',
  inducks_moviecharacter: 'inducks_moviecharacter',
  inducks_moviejob: 'inducks_moviejob',
  inducks_moviereference: 'inducks_moviereference',
  inducks_person: 'inducks_person',
  inducks_personurl: 'inducks_personurl',
  inducks_publication: 'inducks_publication',
  inducks_publicationcategory: 'inducks_publicationcategory',
  inducks_publicationname: 'inducks_publicationname',
  inducks_publicationurl: 'inducks_publicationurl',
  inducks_publisher: 'inducks_publisher',
  inducks_publishingjob: 'inducks_publishingjob',
  inducks_referencereason: 'inducks_referencereason',
  inducks_referencereasonname: 'inducks_referencereasonname',
  inducks_site: 'inducks_site',
  inducks_statcharactercharacter: 'inducks_statcharactercharacter',
  inducks_statcharactercountry: 'inducks_statcharactercountry',
  inducks_statcharacterstory: 'inducks_statcharacterstory',
  inducks_statpersoncharacter: 'inducks_statpersoncharacter',
  inducks_statpersoncountry: 'inducks_statpersoncountry',
  inducks_statpersonperson: 'inducks_statpersonperson',
  inducks_statpersonstory: 'inducks_statpersonstory',
  inducks_story: 'inducks_story',
  inducks_storycodes: 'inducks_storycodes',
  inducks_storydescription: 'inducks_storydescription',
  inducks_storyheader: 'inducks_storyheader',
  inducks_storyjob: 'inducks_storyjob',
  inducks_storyreference: 'inducks_storyreference',
  inducks_storysubseries: 'inducks_storysubseries',
  inducks_storyurl: 'inducks_storyurl',
  inducks_storyversion: 'inducks_storyversion',
  inducks_storyversion_nofulltext: 'inducks_storyversion_nofulltext',
  inducks_studio: 'inducks_studio',
  inducks_studiowork: 'inducks_studiowork',
  inducks_subseries: 'inducks_subseries',
  inducks_subseriesname: 'inducks_subseriesname',
  inducks_substory: 'inducks_substory',
  inducks_team: 'inducks_team',
  inducks_teammember: 'inducks_teammember',
  inducks_ucrelation: 'inducks_ucrelation',
  inducks_universe: 'inducks_universe',
  inducks_universename: 'inducks_universename',
  numeros_cpt: 'numeros_cpt'
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
