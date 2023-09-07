
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
      "value": "/media/bruno/workspace/var/www/html/DucksManager/packages/api/dist/prisma/client_coa",
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
        "fromEnvVar": "DATABASE_URL_COA",
        "value": null
      }
    }
  },
  "inlineSchema": "Z2VuZXJhdG9yIGNsaWVudCB7CiAgcHJvdmlkZXIgICAgICA9ICJwcmlzbWEtY2xpZW50LWpzIgogIG91dHB1dCAgICAgICAgPSAiLi4vZGlzdC9wcmlzbWEvY2xpZW50X2NvYSIKICBiaW5hcnlUYXJnZXRzID0gWyJuYXRpdmUiLCAiZGViaWFuLW9wZW5zc2wtMS4xLngiLCAiZGViaWFuLW9wZW5zc2wtMy4wLngiXQp9CgpkYXRhc291cmNlIGRiIHsKICBwcm92aWRlciA9ICJteXNxbCIKICB1cmwgICAgICA9IGVudigiREFUQUJBU0VfVVJMX0NPQSIpCn0KCm1vZGVsIGRhdGFzZXRzX2VudHJ5dXJscyB7CiAgaWQgICAgICAgICAgIEludCAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIGRhdGFzZXRfaWQgICBJbnQKICBzaXRlY29kZV91cmwgU3RyaW5nIEBkYi5WYXJDaGFyKDk5KQp9Cgptb2RlbCBpbmR1Y2tzX2FwcGVhcmFuY2UgewogIHN0b3J5dmVyc2lvbmNvZGUgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTkpCiAgY2hhcmFjdGVyY29kZSAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig2MikKICBudW1iZXIgICAgICAgICAgICBJbnQ/CiAgYXBwZWFyYW5jZWNvbW1lbnQgU3RyaW5nPyAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigyMDkpCiAgZG91YnQgICAgICAgICAgICAgaW5kdWNrc19hcHBlYXJhbmNlX2RvdWJ0PwoKICBAQGlkKFtzdG9yeXZlcnNpb25jb2RlLCBjaGFyYWN0ZXJjb2RlXSkKICBAQGluZGV4KFtjaGFyYWN0ZXJjb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19hcHBlYXJhbmNlMCIpCiAgQEBpbmRleChbYXBwZWFyYW5jZWNvbW1lbnRdLCBtYXA6ICJma19pbmR1Y2tzX2FwcGVhcmFuY2UxIikKfQoKbW9kZWwgaW5kdWNrc19jaGFyYWN0ZXIgewogIGNoYXJhY3RlcmNvZGUgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgICAgIEBpZCBAZGIuVmFyQ2hhcig2OSkKICBjaGFyYWN0ZXJuYW1lICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICBAZGIuVGV4dAogIG9mZmljaWFsICAgICAgICAgaW5kdWNrc19jaGFyYWN0ZXJfb2ZmaWNpYWw/CiAgb25ldGltZSAgICAgICAgICBpbmR1Y2tzX2NoYXJhY3Rlcl9vbmV0aW1lPwogIGhlcm9vbmx5ICAgICAgICAgaW5kdWNrc19jaGFyYWN0ZXJfaGVyb29ubHk/CiAgY2hhcmFjdGVyY29tbWVudCBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoNjcxKQoKICAvLyBAQGluZGV4KFtjaGFyYWN0ZXJuYW1lXSwgbWFwOiAiZnVsbHRleHRfaW5kdWNrc19jaGFyYWN0ZXIiKQp9Cgptb2RlbCBpbmR1Y2tzX2NoYXJhY3RlcmFsaWFzIHsKICBjaGFyYWN0ZXJjb2RlIFN0cmluZz8gQGRiLlZhckNoYXIoMzEpCiAgY2hhcmFjdGVybmFtZSBTdHJpbmcgIEBpZCBAZGIuVmFyQ2hhcig1OCkKCiAgQEBpbmRleChbY2hhcmFjdGVyY29kZV0sIG1hcDogImZrX2luZHVja3NfY2hhcmFjdGVyYWxpYXMwIikKfQoKbW9kZWwgaW5kdWNrc19jaGFyYWN0ZXJkZXRhaWwgewogIGNoYXJhY3Rlcm5hbWUgU3RyaW5nPyBAZGIuVmFyQ2hhcig3KQogIGNoYXJhY3RlcmNvZGUgU3RyaW5nICBAaWQgQGRiLlZhckNoYXIoNikKICBudW1iZXIgICAgICAgIEludD8KCiAgQEBpbmRleChbY2hhcmFjdGVybmFtZV0sIG1hcDogImZrX2luZHVja3NfY2hhcmFjdGVyZGV0YWlsMCIpCn0KCm1vZGVsIGluZHVja3NfY2hhcmFjdGVybmFtZSB7CiAgY2hhcmFjdGVyY29kZSAgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoNDUpCiAgbGFuZ3VhZ2Vjb2RlICAgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoNykKICBjaGFyYWN0ZXJuYW1lICAgICAgICBTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig4MykKICBwcmVmZXJyZWQgICAgICAgICAgICBpbmR1Y2tzX2NoYXJhY3Rlcm5hbWVfcHJlZmVycmVkPwogIGNoYXJhY3Rlcm5hbWVjb21tZW50IFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDk5KQoKICBAQGlkKFtjaGFyYWN0ZXJjb2RlLCBsYW5ndWFnZWNvZGUsIGNoYXJhY3Rlcm5hbWVdKQogIEBAaW5kZXgoW2xhbmd1YWdlY29kZV0sIG1hcDogImZrX2luZHVja3NfY2hhcmFjdGVybmFtZTAiKQp9Cgptb2RlbCBpbmR1Y2tzX2NoYXJhY3RlcnJlZmVyZW5jZSB7CiAgZnJvbWNoYXJhY3RlcmNvZGUgICBTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigyNSkKICB0b2NoYXJhY3RlcmNvZGUgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDI1KQogIGlzZ3JvdXBvZmNoYXJhY3RlcnMgaW5kdWNrc19jaGFyYWN0ZXJyZWZlcmVuY2VfaXNncm91cG9mY2hhcmFjdGVycz8KCiAgQEBpZChbZnJvbWNoYXJhY3RlcmNvZGUsIHRvY2hhcmFjdGVyY29kZV0pCiAgQEBpbmRleChbdG9jaGFyYWN0ZXJjb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19jaGFyYWN0ZXJyZWZlcmVuY2UwIikKfQoKbW9kZWwgaW5kdWNrc19jaGFyYWN0ZXJ1cmwgewogIGNoYXJhY3RlcmNvZGUgU3RyaW5nICBAZGIuVmFyQ2hhcigxKQogIHNpdGVjb2RlICAgICAgU3RyaW5nICBAZGIuVmFyQ2hhcigxKQogIHVybCAgICAgICAgICAgU3RyaW5nPyBAZGIuVmFyQ2hhcigxKQoKICBAQGlkKFtjaGFyYWN0ZXJjb2RlLCBzaXRlY29kZV0pCiAgQEBpbmRleChbc2l0ZWNvZGVdLCBtYXA6ICJma19pbmR1Y2tzX2NoYXJhY3RlcnVybDAiKQp9Cgptb2RlbCBpbmR1Y2tzX2NvdW50cnkgewogIGNvdW50cnljb2RlICAgICAgICAgICAgU3RyaW5nICBAaWQgQGRiLlZhckNoYXIoMikKICBjb3VudHJ5bmFtZSAgICAgICAgICAgIFN0cmluZz8gQGRiLlZhckNoYXIoMjApCiAgZGVmYXVsdGxhbmd1YWdlICAgICAgICBTdHJpbmc/IEBkYi5WYXJDaGFyKDcpCiAgZGVmYXVsdG1haW50ZW5hbmNldGVhbSBTdHJpbmc/IEBkYi5WYXJDaGFyKDgpCn0KCm1vZGVsIGluZHVja3NfY291bnRyeW5hbWUgewogIGNvdW50cnljb2RlICBTdHJpbmcgIEBkYi5WYXJDaGFyKDIpCiAgbGFuZ3VhZ2Vjb2RlIFN0cmluZyAgQGRiLlZhckNoYXIoNSkKICBjb3VudHJ5bmFtZSAgU3RyaW5nPyBAZGIuVmFyQ2hhcig1NikKCiAgQEBpZChbY291bnRyeWNvZGUsIGxhbmd1YWdlY29kZV0pCiAgQEBpbmRleChbbGFuZ3VhZ2Vjb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19jb3VudHJ5bmFtZTAiKQp9Cgptb2RlbCBpbmR1Y2tzX2N1cnJlbmN5IHsKICBjdXJyZW5jeWNvZGUgU3RyaW5nICBAaWQgQGRiLlZhckNoYXIoMykKICBjdXJyZW5jeW5hbWUgU3RyaW5nPyBAZGIuVmFyQ2hhcigxOCkKfQoKbW9kZWwgaW5kdWNrc19jdXJyZW5jeW5hbWUgewogIGN1cnJlbmN5Y29kZSAgICAgIFN0cmluZyAgQGRiLlZhckNoYXIoMykKICBsYW5ndWFnZWNvZGUgICAgICBTdHJpbmcgIEBkYi5WYXJDaGFyKDIpCiAgc2hvcnRjdXJyZW5jeW5hbWUgU3RyaW5nPyBAZGIuVmFyQ2hhcigxOSkKICBsb25nY3VycmVuY3luYW1lICBTdHJpbmc/IEBkYi5WYXJDaGFyKDIwKQoKICBAQGlkKFtjdXJyZW5jeWNvZGUsIGxhbmd1YWdlY29kZV0pCiAgQEBpbmRleChbbGFuZ3VhZ2Vjb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19jdXJyZW5jeW5hbWUwIikKfQoKbW9kZWwgaW5kdWNrc19lbnRyeSB7CiAgZW50cnljb2RlICAgICAgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGlkIEBkYi5WYXJDaGFyKDIyKQogIGlzc3VlY29kZSAgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDE3KQogIHN0b3J5dmVyc2lvbmNvZGUgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDIwKQogIGxhbmd1YWdlY29kZSAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDcpCiAgaW5jbHVkZWRpbmVudHJ5Y29kZSAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTkpCiAgcG9zaXRpb24gICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoOSkKICBwcmludGVkY29kZSAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig4OCkKICBndWVzc2VkY29kZSAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigzOSkKICB0aXRsZSAgICAgICAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigyNjUpCiAgcmVhbGx5dGl0bGUgICAgICAgICAgICAgaW5kdWNrc19lbnRyeV9yZWFsbHl0aXRsZT8KICBwcmludGVkaGVybyAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig5NikKICBjaGFuZ2VzICAgICAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig2MjgpCiAgY3V0ICAgICAgICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTA0KQogIG1pbm9yY2hhbmdlcyAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDU1OCkKICBtaXNzaW5ncGFuZWxzICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigyKQogIG1pcnJvcmVkICAgICAgICAgICAgICAgIGluZHVja3NfZW50cnlfbWlycm9yZWQ/CiAgc2lkZXdheXMgICAgICAgICAgICAgICAgaW5kdWNrc19lbnRyeV9zaWRld2F5cz8KICBzdGFydGRhdGUgICAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxMCkKICBlbmRkYXRlICAgICAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxMCkKICBpZGVudGlmaWNhdGlvbnVuY2VydGFpbiBpbmR1Y2tzX2VudHJ5X2lkZW50aWZpY2F0aW9udW5jZXJ0YWluPwogIGFsc29yZXByaW50ICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDEwMSkKICBwYXJ0ICAgICAgICAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig1KQogIGVudHJ5Y29tbWVudCAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDE3MTUpCiAgZXJyb3IgICAgICAgICAgICAgICAgICAgaW5kdWNrc19lbnRyeV9lcnJvcj8KCiAgQEBpbmRleChbdGl0bGVdLCBtYXA6ICJlbnRyeVRpdGxlRnVsbFRleHQiKQogIEBAaW5kZXgoW2lzc3VlY29kZV0sIG1hcDogImZrX2luZHVja3NfZW50cnkwIikKICBAQGluZGV4KFtzdG9yeXZlcnNpb25jb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19lbnRyeTEiKQogIEBAaW5kZXgoW2xhbmd1YWdlY29kZV0sIG1hcDogImZrX2luZHVja3NfZW50cnkyIikKICBAQGluZGV4KFtpbmNsdWRlZGluZW50cnljb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19lbnRyeTMiKQogIEBAaW5kZXgoW3Bvc2l0aW9uXSwgbWFwOiAiZmtfaW5kdWNrc19lbnRyeTQiKQp9Cgptb2RlbCBpbmR1Y2tzX2VudHJ5X25vZnVsbHRleHQgewogIGVudHJ5Y29kZSAgICAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGlkIEBkYi5WYXJDaGFyKDIyKQogIGlzc3VlY29kZSAgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTcpCiAgc3Rvcnl2ZXJzaW9uY29kZSAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxOSkKICBsYW5ndWFnZWNvZGUgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDcpCiAgaW5jbHVkZWRpbmVudHJ5Y29kZSAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxOSkKICBwb3NpdGlvbiAgICAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDcpCiAgcHJpbnRlZGNvZGUgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig4OCkKICBndWVzc2VkY29kZSAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDM5KQogIHRpdGxlICAgICAgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMjM1KQogIHJlYWxseXRpdGxlICAgICAgICAgICAgIGluZHVja3NfZW50cnlfbm9mdWxsdGV4dF9yZWFsbHl0aXRsZT8KICBwcmludGVkaGVybyAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDk2KQogIGNoYW5nZXMgICAgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoNjI4KQogIGN1dCAgICAgICAgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTAwKQogIG1pbm9yY2hhbmdlcyAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoNTU4KQogIG1pc3NpbmdwYW5lbHMgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMjMpCiAgbWlycm9yZWQgICAgICAgICAgICAgICAgaW5kdWNrc19lbnRyeV9ub2Z1bGx0ZXh0X21pcnJvcmVkPwogIHNpZGV3YXlzICAgICAgICAgICAgICAgIGluZHVja3NfZW50cnlfbm9mdWxsdGV4dF9zaWRld2F5cz8KICBzdGFydGRhdGUgICAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDEwKQogIGVuZGRhdGUgICAgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTApCiAgaWRlbnRpZmljYXRpb251bmNlcnRhaW4gaW5kdWNrc19lbnRyeV9ub2Z1bGx0ZXh0X2lkZW50aWZpY2F0aW9udW5jZXJ0YWluPwogIGFsc29yZXByaW50ICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoNjYpCiAgcGFydCAgICAgICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig1KQogIGVudHJ5Y29tbWVudCAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMzQ3NikKICBlcnJvciAgICAgICAgICAgICAgICAgICBpbmR1Y2tzX2VudHJ5X25vZnVsbHRleHRfZXJyb3I/CgogIEBAaW5kZXgoW2lzc3VlY29kZV0sIG1hcDogImZrMCIpCiAgQEBpbmRleChbc3Rvcnl2ZXJzaW9uY29kZV0sIG1hcDogImZrMSIpCiAgQEBpbmRleChbbGFuZ3VhZ2Vjb2RlXSwgbWFwOiAiZmsyIikKICBAQGluZGV4KFtpbmNsdWRlZGluZW50cnljb2RlXSwgbWFwOiAiZmszIikKICBAQGluZGV4KFtwb3NpdGlvbl0sIG1hcDogImZrNCIpCiAgQEBpbmRleChbZW50cnljb2RlXSwgbWFwOiAicGswIikKfQoKbW9kZWwgaW5kdWNrc19lbnRyeWNoYXJhY3Rlcm5hbWUgewogIGVudHJ5Y29kZSAgICAgU3RyaW5nICBAZGIuVmFyQ2hhcigyMikKICBjaGFyYWN0ZXJjb2RlIFN0cmluZyAgQGRiLlZhckNoYXIoNDkpCiAgY2hhcmFjdGVybmFtZSBTdHJpbmc/IEBkYi5WYXJDaGFyKDEzMSkKCiAgQEBpZChbZW50cnljb2RlLCBjaGFyYWN0ZXJjb2RlXSkKICBAQGluZGV4KFtjaGFyYWN0ZXJjb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19lbnRyeWNoYXJhY3Rlcm5hbWUwIikKfQoKbW9kZWwgaW5kdWNrc19lbnRyeWpvYiB7CiAgZW50cnljb2RlICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDE5KQogIHBlcnNvbmNvZGUgICAgICBTdHJpbmcgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig1MCkKICB0cmFuc2xldGNvbCAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMSkKICBlbnRyeWpvYmNvbW1lbnQgU3RyaW5nPyAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoNTEpCiAgZG91YnQgICAgICAgICAgIGluZHVja3NfZW50cnlqb2JfZG91YnQ/CgogIEBAaWQoW2VudHJ5Y29kZSwgcGVyc29uY29kZSwgdHJhbnNsZXRjb2xdKQogIEBAaW5kZXgoW3BlcnNvbmNvZGVdLCBtYXA6ICJma19pbmR1Y2tzX2VudHJ5am9iMCIpCn0KCm1vZGVsIGluZHVja3NfZW50cnl1cmwgewogIGVudHJ5Y29kZSAgU3RyaW5nPyAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDIxKQogIHNpdGVjb2RlICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDExKQogIHBhZ2VudW1iZXIgSW50PwogIHVybCAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDg3KQogIHN0b3J5Y29kZSAgU3RyaW5nPyAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDM5KQogIHB1YmxpYyAgICAgaW5kdWNrc19lbnRyeXVybF9wdWJsaWM/CiAgaWQgICAgICAgICBJbnQgICAgICAgICAgICAgICAgICAgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKCiAgQEBpbmRleChbZW50cnljb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19lbnRyeXVybDAiKQogIEBAaW5kZXgoW3NpdGVjb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19lbnRyeXVybDEiKQogIEBAaW5kZXgoW3VybF0sIG1hcDogImZrX2luZHVja3NfZW50cnl1cmwyIikKICBAQGluZGV4KFtzdG9yeWNvZGVdLCBtYXA6ICJma19pbmR1Y2tzX2VudHJ5dXJsMyIpCn0KCm1vZGVsIGluZHVja3NfZXF1aXYgewogIGlzc3VlY29kZSAgICBTdHJpbmcgIEBkYi5WYXJDaGFyKDMxKQogIGVxdWl2aWQgICAgICBJbnQKICBlcXVpdmNvbW1lbnQgU3RyaW5nPyBAZGIuVmFyQ2hhcigzKQoKICBAQGlkKFtpc3N1ZWNvZGUsIGVxdWl2aWRdKQogIEBAaW5kZXgoW2VxdWl2aWRdLCBtYXA6ICJma19pbmR1Y2tzX2VxdWl2MCIpCn0KCm1vZGVsIGluZHVja3NfaGVyb2NoYXJhY3RlciB7CiAgc3Rvcnljb2RlICAgICBTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDE4KQogIGNoYXJhY3RlcmNvZGUgU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig1NCkKICBudW1iZXIgICAgICAgIEludD8KICBkb3VidCAgICAgICAgIGluZHVja3NfaGVyb2NoYXJhY3Rlcl9kb3VidD8KCiAgQEBpZChbc3Rvcnljb2RlLCBjaGFyYWN0ZXJjb2RlXSkKICBAQGluZGV4KFtjaGFyYWN0ZXJjb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19oZXJvY2hhcmFjdGVyMCIpCn0KCm1vZGVsIGluZHVja3NfaW5wdXRmaWxlIHsKICBpbnB1dGZpbGVjb2RlICAgICAgIEludCAgICAgICAgICAgICAgICAgICAgICAgICAgQGlkCiAgcGF0aCAgICAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDExKQogIGZpbGVuYW1lICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigyMikKICBsYXlvdXQgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTApCiAgbG9ja2VkICAgICAgICAgICAgICBpbmR1Y2tzX2lucHV0ZmlsZV9sb2NrZWQ/CiAgbWFpbnRlbmFuY2V0ZWFtY29kZSBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDgpCiAgY291bnRyeWNvZGUgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDIpCiAgbGFuZ3VhZ2Vjb2RlICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDcpCiAgcHJvZHVjZXJjb2RlICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDE1KQogIHNlY3VuZGFyeSAgICAgICAgICAgaW5kdWNrc19pbnB1dGZpbGVfc2VjdW5kYXJ5Pwp9Cgptb2RlbCBpbmR1Y2tzX2lzc3VlIHsKICBpc3N1ZWNvZGUgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICBAaWQgQGRiLlZhckNoYXIoMTcpCiAgaXNzdWVyYW5nZWNvZGUgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTUpCiAgcHVibGljYXRpb25jb2RlICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTIpCiAgaXNzdWVudW1iZXIgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTIpCiAgdGl0bGUgICAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTU4KQogIHNpemUgICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDgyKQogIHBhZ2VzICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDgyKQogIHByaWNlICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDE2MCkKICBwcmludHJ1biAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxNDIpCiAgYXR0YWNoZWQgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMjg4KQogIG9sZGVzdGRhdGUgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDEwKQogIGZ1bGx5aW5kZXhlZCAgICAgICAgaW5kdWNrc19pc3N1ZV9mdWxseWluZGV4ZWQ/CiAgaXNzdWVjb21tZW50ICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTUxNikKICBlcnJvciAgICAgICAgICAgICAgIGluZHVja3NfaXNzdWVfZXJyb3I/CiAgZmlsbGVkb2xkZXN0ZGF0ZSAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTApCiAgbG9ja2VkICAgICAgICAgICAgICBpbmR1Y2tzX2lzc3VlX2xvY2tlZD8KICBpbnhmb3JiaWRkZW4gICAgICAgIGluZHVja3NfaXNzdWVfaW54Zm9yYmlkZGVuPwogIGlucHV0ZmlsZWNvZGUgICAgICAgSW50PwogIG1haW50ZW5hbmNldGVhbWNvZGUgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDgpCgogIEBAaW5kZXgoW2lzc3VlcmFuZ2Vjb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19pc3N1ZTAiKQogIEBAaW5kZXgoW3B1YmxpY2F0aW9uY29kZV0sIG1hcDogImZrX2luZHVja3NfaXNzdWUxIikKfQoKbW9kZWwgaW5kdWNrc19pc3N1ZWNvbGxlY3RpbmcgewogIGNvbGxlY3Rpbmdpc3N1ZWNvZGUgU3RyaW5nIEBkYi5WYXJDaGFyKDE3KQogIGNvbGxlY3RlZGlzc3VlY29kZSAgU3RyaW5nIEBkYi5WYXJDaGFyKDE1KQoKICBAQGlkKFtjb2xsZWN0aW5naXNzdWVjb2RlLCBjb2xsZWN0ZWRpc3N1ZWNvZGVdKQogIEBAaW5kZXgoW2NvbGxlY3RlZGlzc3VlY29kZV0sIG1hcDogImZrX2luZHVja3NfaXNzdWVjb2xsZWN0aW5nMCIpCn0KCm1vZGVsIGluZHVja3NfaXNzdWVkYXRlIHsKICBpc3N1ZWNvZGUgIFN0cmluZyAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxNykKICBkYXRlICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxMCkKICBraW5kb2ZkYXRlIFN0cmluZz8gICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig3NikKICBkb3VidCAgICAgIGluZHVja3NfaXNzdWVkYXRlX2RvdWJ0PwoKICBAQGlkKFtpc3N1ZWNvZGUsIGRhdGVdKQp9Cgptb2RlbCBpbmR1Y2tzX2lzc3Vlam9iIHsKICBpc3N1ZWNvZGUgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTcpCiAgcGVyc29uY29kZSAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDQ5KQogIGlueHRyYW5zbGV0Y29sICBTdHJpbmcgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxKQogIGlzc3Vlam9iY29tbWVudCBTdHJpbmc/ICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigzMikKICBkb3VidCAgICAgICAgICAgaW5kdWNrc19pc3N1ZWpvYl9kb3VidD8KCiAgQEBpZChbaXNzdWVjb2RlLCBwZXJzb25jb2RlLCBpbnh0cmFuc2xldGNvbF0pCiAgQEBpbmRleChbcGVyc29uY29kZV0sIG1hcDogImZrX2luZHVja3NfaXNzdWVqb2IwIikKfQoKbW9kZWwgaW5kdWNrc19pc3N1ZXByaWNlIHsKICBpc3N1ZWNvZGUgICAgICBTdHJpbmcgIEBkYi5WYXJDaGFyKDE3KQogIGFtb3VudCAgICAgICAgIFN0cmluZyAgQGRiLlZhckNoYXIoODYpCiAgY3VycmVuY3kgICAgICAgU3RyaW5nPyBAZGIuVmFyQ2hhcigxNCkKICBjb21tZW50ICAgICAgICBTdHJpbmc/IEBkYi5WYXJDaGFyKDY0KQogIHNlcXVlbmNlbnVtYmVyIEludD8KCiAgQEBpZChbaXNzdWVjb2RlLCBhbW91bnRdKQp9Cgptb2RlbCBpbmR1Y2tzX2lzc3VlcXVvdGF0aW9uIHsKICBJRCAgICAgICAgICAgICAgSW50ICAgICAgIEBpZCBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgcHVibGljYXRpb25jb2RlIFN0cmluZyAgICBAZGIuVmFyQ2hhcigxNSkKICBpc3N1ZW51bWJlciAgICAgU3RyaW5nICAgIEBkYi5WYXJDaGFyKDEyKQogIGVzdGltYXRpb25taW4gICBGbG9hdD8gICAgQGRiLkZsb2F0CiAgZXN0aW1hdGlvbm1heCAgIEZsb2F0PyAgICBAZGIuRmxvYXQKICBzY3JhcGVkYXRlICAgICAgRGF0ZVRpbWU/IEBkYi5EYXRlVGltZSgwKQogIHNvdXJjZSAgICAgICAgICBTdHJpbmcgICAgQGRiLlZhckNoYXIoMTUpCiAgaXNzdWVjb2RlICAgICAgIFN0cmluZz8gICBAdW5pcXVlKG1hcDogImluZHVja3NfaXNzdWVxdW90YXRpb25fX3VpbmRleF9pc3N1ZWNvZGUiKSBAZGIuVmFyQ2hhcigyOCkKCiAgQEBpbmRleChbcHVibGljYXRpb25jb2RlXSwgbWFwOiAiaW5kdWNrc19pc3N1ZXF1b3RhdGlvbl9faW5kZXhfcHVibGljYXRpb24iKQp9Cgptb2RlbCBpbmR1Y2tzX2lzc3VlcmFuZ2UgewogIGlzc3VlcmFuZ2Vjb2RlICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGlkIEBkYi5WYXJDaGFyKDE1KQogIHB1YmxpY2F0aW9uY29kZSAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoOSkKICB0aXRsZSAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDIyOCkKICBjaXJjdWxhdGlvbiAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDI1KQogIGlzc3VlcmFuZ2Vjb21tZW50IFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoNDY4KQogIG51bWJlcnNhcmVmYWtlICAgIGluZHVja3NfaXNzdWVyYW5nZV9udW1iZXJzYXJlZmFrZT8KICBlcnJvciAgICAgICAgICAgICBpbmR1Y2tzX2lzc3VlcmFuZ2VfZXJyb3I/CgogIEBAaW5kZXgoW3B1YmxpY2F0aW9uY29kZV0sIG1hcDogImZrX2luZHVja3NfaXNzdWVyYW5nZTAiKQp9Cgptb2RlbCBpbmR1Y2tzX2lzc3VldXJsIHsKICBpc3N1ZWNvZGUgU3RyaW5nICBAZGIuVmFyQ2hhcigxNCkKICBzaXRlY29kZSAgU3RyaW5nICBAZGIuVmFyQ2hhcigxMikKICB1cmwgICAgICAgU3RyaW5nPyBAZGIuVmFyQ2hhcigxMikKCiAgQEBpZChbaXNzdWVjb2RlLCBzaXRlY29kZV0pCiAgQEBpbmRleChbc2l0ZWNvZGVdLCBtYXA6ICJma19pbmR1Y2tzX2lzc3VldXJsMCIpCn0KCm1vZGVsIGluZHVja3NfbGFuZ3VhZ2UgewogIGxhbmd1YWdlY29kZSAgICAgICAgU3RyaW5nICBAaWQgQGRiLlZhckNoYXIoNykKICBkZWZhdWx0bGFuZ3VhZ2Vjb2RlIFN0cmluZz8gQGRiLlZhckNoYXIoNSkKICBsYW5ndWFnZW5hbWUgICAgICAgIFN0cmluZz8gQGRiLlZhckNoYXIoMjApCgogIEBAaW5kZXgoW2RlZmF1bHRsYW5ndWFnZWNvZGVdLCBtYXA6ICJma19pbmR1Y2tzX2xhbmd1YWdlMCIpCn0KCm1vZGVsIGluZHVja3NfbGFuZ3VhZ2VuYW1lIHsKICBkZXNjbGFuZ3VhZ2Vjb2RlIFN0cmluZyAgQGRiLlZhckNoYXIoNSkKICBsYW5ndWFnZWNvZGUgICAgIFN0cmluZyAgQGRiLlZhckNoYXIoNykKICBsYW5ndWFnZW5hbWUgICAgIFN0cmluZz8gQGRiLlZhckNoYXIoNTcpCgogIEBAaWQoW2Rlc2NsYW5ndWFnZWNvZGUsIGxhbmd1YWdlY29kZV0pCiAgQEBpbmRleChbbGFuZ3VhZ2Vjb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19sYW5ndWFnZW5hbWUwIikKfQoKbW9kZWwgaW5kdWNrc19sb2cgewogIG51bWJlciAgICAgICAgICAgICAgSW50ICAgICAgICAgICAgICAgICBAaWQKICBsb2drZXkgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgQGRiLlZhckNoYXIoNDEpCiAgc3Rvcnljb2RlICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDM5KQogIGxvZ2lkICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICBAZGIuVmFyQ2hhcig0KQogIGxvZ3R5cGUgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxKQogIHBhcjEgICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxODQ3KQogIHBhcjIgICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxODQ2KQogIHBhcjMgICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICBAZGIuVmFyQ2hhcigyODUpCiAgbWFya2VkICAgICAgICAgICAgICBpbmR1Y2tzX2xvZ19tYXJrZWQ/CiAgaW5wdXRmaWxlY29kZSAgICAgICBJbnQ/CiAgbWFpbnRlbmFuY2V0ZWFtY29kZSBTdHJpbmc/ICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDEzKQp9Cgptb2RlbCBpbmR1Y2tzX2xvZ2RhdGEgewogIGxvZ2lkICAgIFN0cmluZyAgQGlkIEBkYi5WYXJDaGFyKDQpCiAgY2F0ZWdvcnkgSW50PwogIGxvZ3RleHQgIFN0cmluZz8gQGRiLlZhckNoYXIoMTA4KQp9Cgptb2RlbCBpbmR1Y2tzX2xvZ29jaGFyYWN0ZXIgewogIGVudHJ5Y29kZSAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigyMikKICBjaGFyYWN0ZXJjb2RlICAgICAgICBTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoNTQpCiAgcmVhbGx5aW50aXRsZSAgICAgICAgaW5kdWNrc19sb2dvY2hhcmFjdGVyX3JlYWxseWludGl0bGU/CiAgbnVtYmVyICAgICAgICAgICAgICAgSW50PwogIGxvZ29jaGFyYWN0ZXJjb21tZW50IFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigyOCkKCiAgQEBpZChbZW50cnljb2RlLCBjaGFyYWN0ZXJjb2RlXSkKICBAQGluZGV4KFtjaGFyYWN0ZXJjb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19sb2dvY2hhcmFjdGVyMCIpCn0KCm1vZGVsIGluZHVja3NfbW92aWUgewogIG1vdmllY29kZSAgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgIEBpZCBAZGIuVmFyQ2hhcigxNCkKICB0aXRsZSAgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICBAZGIuVGV4dAogIG1vdmllY29tbWVudCAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgIEBkYi5UZXh0CiAgYXBwc3VtbWFyeSAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgQGRiLlRleHQKICBtb3ZpZWpvYnN1bW1hcnkgICAgIFN0cmluZz8gICAgICAgICAgICAgICBAZGIuVGV4dAogIGxvY2tlZCAgICAgICAgICAgICAgaW5kdWNrc19tb3ZpZV9sb2NrZWQ/CiAgaW5wdXRmaWxlY29kZSAgICAgICBJbnQ/CiAgbWFpbnRlbmFuY2V0ZWFtY29kZSBTdHJpbmc/ICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoNykKICBha2EgICAgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig4MSkKICBjcmVhdGlvbmRhdGUgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxMCkKICBtb3ZpZWRlc2NyaXB0aW9uICAgIFN0cmluZz8gICAgICAgICAgICAgICBAZGIuVGV4dAogIGRpc3RyaWJ1dG9yICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDUwKQogIGdlbnJlICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDMpCiAgb3JkZXJlciAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTc4KQogIHB1YmxpY2F0aW9uZGF0ZSAgICAgU3RyaW5nPyAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDEwKQogIHNvdXJjZSAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDkxKQogIHRpbSAgICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDYpCgogIC8vIEBAaW5kZXgoW3RpdGxlLCBtb3ZpZWNvbW1lbnQsIGFwcHN1bW1hcnksIG1vdmllam9ic3VtbWFyeSwgbW92aWVkZXNjcmlwdGlvbl0sIG1hcDogImZ1bGx0ZXh0X2luZHVja3NfbW92aWUiKQp9Cgptb2RlbCBpbmR1Y2tzX21vdmllY2hhcmFjdGVyIHsKICBtb3ZpZWNvZGUgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTMpCiAgY2hhcmFjdGVyY29kZSAgICBTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDM2KQogIGlzdGl0bGVjaGFyYWN0ZXIgaW5kdWNrc19tb3ZpZWNoYXJhY3Rlcl9pc3RpdGxlY2hhcmFjdGVyPwoKICBAQGlkKFttb3ZpZWNvZGUsIGNoYXJhY3RlcmNvZGVdKQogIEBAaW5kZXgoW2NoYXJhY3RlcmNvZGVdLCBtYXA6ICJma19pbmR1Y2tzX21vdmllY2hhcmFjdGVyMCIpCn0KCm1vZGVsIGluZHVja3NfbW92aWVqb2IgewogIG1vdmllY29kZSAgICAgICBTdHJpbmcgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxMykKICBwZXJzb25jb2RlICAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMzkpCiAgcm9sZSAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDE1KQogIG1vdmllam9iY29tbWVudCBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig4MikKICBpbmRpcmVjdCAgICAgICAgaW5kdWNrc19tb3ZpZWpvYl9pbmRpcmVjdD8KICBkb3VidCAgICAgICAgICAgaW5kdWNrc19tb3ZpZWpvYl9kb3VidD8KCiAgQEBpZChbbW92aWVjb2RlLCBwZXJzb25jb2RlLCByb2xlXSkKICBAQGluZGV4KFtwZXJzb25jb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19tb3ZpZWpvYjAiKQp9Cgptb2RlbCBpbmR1Y2tzX21vdmllcmVmZXJlbmNlIHsKICBzdG9yeWNvZGUgICAgICAgICBTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDE3KQogIG1vdmllY29kZSAgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTQpCiAgcmVmZXJlbmNlcmVhc29uaWQgSW50PwogIGZyb21tb3ZpZXRvc3RvcnkgIGluZHVja3NfbW92aWVyZWZlcmVuY2VfZnJvbW1vdmlldG9zdG9yeT8KCiAgQEBpZChbc3Rvcnljb2RlLCBtb3ZpZWNvZGVdKQogIEBAaW5kZXgoW21vdmllY29kZV0sIG1hcDogImZrX2luZHVja3NfbW92aWVyZWZlcmVuY2UwIikKICBAQGluZGV4KFtyZWZlcmVuY2VyZWFzb25pZF0sIG1hcDogImZrX2luZHVja3NfbW92aWVyZWZlcmVuY2UxIikKfQoKbW9kZWwgaW5kdWNrc19wZXJzb24gewogIHBlcnNvbmNvZGUgICAgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGlkIEBkYi5WYXJDaGFyKDc5KQogIG5hdGlvbmFsaXR5Y291bnRyeWNvZGUgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMikKICBmdWxsbmFtZSAgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDc5KQogIG9mZmljaWFsICAgICAgICAgICAgICAgaW5kdWNrc19wZXJzb25fb2ZmaWNpYWw/CiAgcGVyc29uY29tbWVudCAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigyMjEpCiAgdW5rbm93bnN0dWRpb21lbWJlciAgICBpbmR1Y2tzX3BlcnNvbl91bmtub3duc3R1ZGlvbWVtYmVyPwogIGlzZmFrZSAgICAgICAgICAgICAgICAgaW5kdWNrc19wZXJzb25faXNmYWtlPwogIG51bWJlcm9maW5kZXhlZGlzc3VlcyAgSW50PwogIGJpcnRobmFtZSAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlRleHQKICBib3JuZGF0ZSAgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDEwKQogIGJvcm5wbGFjZSAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMzApCiAgZGVjZWFzZWRkYXRlICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxMCkKICBkZWNlYXNlZHBsYWNlICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDMxKQogIGVkdWNhdGlvbiAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTg5KQogIG1vdmllc3RleHQgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoODc5KQogIGNvbWljc3RleHQgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoOTI3KQogIG90aGVydGV4dCAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMzA3KQogIHBob3RvZmlsZW5hbWUgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMzIpCiAgcGhvdG9jb21tZW50ICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig2OCkKICBwaG90b3NvdXJjZSAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDY3KQogIHBlcnNvbnJlZnMgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTc5KQoKICBAQGluZGV4KFtuYXRpb25hbGl0eWNvdW50cnljb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19wZXJzb24wIikKfQoKbW9kZWwgaW5kdWNrc19wZXJzb251cmwgewogIHBlcnNvbmNvZGUgU3RyaW5nICBAZGIuVmFyQ2hhcigyNCkKICBzaXRlY29kZSAgIFN0cmluZyAgQGRiLlZhckNoYXIoMTUpCiAgdXJsICAgICAgICBTdHJpbmc/IEBkYi5WYXJDaGFyKDMxKQoKICBAQGlkKFtwZXJzb25jb2RlLCBzaXRlY29kZV0pCiAgQEBpbmRleChbc2l0ZWNvZGVdLCBtYXA6ICJma19pbmR1Y2tzX3BlcnNvbnVybDAiKQp9Cgptb2RlbCBpbmR1Y2tzX3B1YmxpY2F0aW9uIHsKICBwdWJsaWNhdGlvbmNvZGUgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpZCBAZGIuVmFyQ2hhcigxMikKICBjb3VudHJ5Y29kZSAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDIpCiAgbGFuZ3VhZ2Vjb2RlICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig3KQogIHRpdGxlICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlRleHQKICBzaXplICAgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDgyKQogIHB1YmxpY2F0aW9uY29tbWVudCAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTM1NCkKICBjaXJjdWxhdGlvbiAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDQpCiAgbnVtYmVyc2FyZWZha2UgICAgICBpbmR1Y2tzX3B1YmxpY2F0aW9uX251bWJlcnNhcmVmYWtlPwogIGVycm9yICAgICAgICAgICAgICAgaW5kdWNrc19wdWJsaWNhdGlvbl9lcnJvcj8KICBsb2NrZWQgICAgICAgICAgICAgIGluZHVja3NfcHVibGljYXRpb25fbG9ja2VkPwogIGlueGZvcmJpZGRlbiAgICAgICAgaW5kdWNrc19wdWJsaWNhdGlvbl9pbnhmb3JiaWRkZW4/CiAgaW5wdXRmaWxlY29kZSAgICAgICBJbnQ/CiAgbWFpbnRlbmFuY2V0ZWFtY29kZSBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig5KQoKICAvLyBAQGluZGV4KFt0aXRsZV0sIG1hcDogImZ1bGx0ZXh0X2luZHVja3NfcHVibGljYXRpb24iKQogIEBAaW5kZXgoW2NvdW50cnljb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19wdWJsaWNhdGlvbjAiKQogIEBAaW5kZXgoW2xhbmd1YWdlY29kZV0sIG1hcDogImZrX2luZHVja3NfcHVibGljYXRpb24xIikKfQoKbW9kZWwgaW5kdWNrc19wdWJsaWNhdGlvbmNhdGVnb3J5IHsKICBwdWJsaWNhdGlvbmNvZGUgU3RyaW5nICBAaWQgQGRiLlZhckNoYXIoMTIpCiAgY2F0ZWdvcnkgICAgICAgIFN0cmluZz8gQGRiLlZhckNoYXIoNjEpCn0KCm1vZGVsIGluZHVja3NfcHVibGljYXRpb25uYW1lIHsKICBwdWJsaWNhdGlvbmNvZGUgU3RyaW5nICBAaWQgQGRiLlZhckNoYXIoOSkKICBwdWJsaWNhdGlvbm5hbWUgU3RyaW5nPyBAZGIuVmFyQ2hhcig2MikKfQoKbW9kZWwgaW5kdWNrc19wdWJsaWNhdGlvbnVybCB7CiAgcHVibGljYXRpb25jb2RlIFN0cmluZyAgQGRiLlZhckNoYXIoMTApCiAgc2l0ZWNvZGUgICAgICAgIFN0cmluZyAgQGRiLlZhckNoYXIoMTYpCiAgdXJsICAgICAgICAgICAgIFN0cmluZz8gQGRiLlZhckNoYXIoMjM2KQoKICBAQGlkKFtwdWJsaWNhdGlvbmNvZGUsIHNpdGVjb2RlXSkKICBAQGluZGV4KFtzaXRlY29kZV0sIG1hcDogImZrX2luZHVja3NfcHVibGljYXRpb251cmwwIikKfQoKbW9kZWwgaW5kdWNrc19wdWJsaXNoZXIgewogIHB1Ymxpc2hlcmlkICAgU3RyaW5nICBAaWQgQGRiLlZhckNoYXIoOTQpCiAgcHVibGlzaGVybmFtZSBTdHJpbmc/IEBkYi5UZXh0CgogIC8vIEBAaW5kZXgoW3B1Ymxpc2hlcm5hbWVdLCBtYXA6ICJmdWxsdGV4dF9pbmR1Y2tzX3B1Ymxpc2hlciIpCn0KCm1vZGVsIGluZHVja3NfcHVibGlzaGluZ2pvYiB7CiAgcHVibGlzaGVyaWQgICAgICAgICAgU3RyaW5nICBAZGIuVmFyQ2hhcig5NCkKICBpc3N1ZWNvZGUgICAgICAgICAgICBTdHJpbmcgIEBkYi5WYXJDaGFyKDE3KQogIHB1Ymxpc2hpbmdqb2Jjb21tZW50IFN0cmluZz8gQGRiLlZhckNoYXIoNjcpCgogIEBAaWQoW3B1Ymxpc2hlcmlkLCBpc3N1ZWNvZGVdKQogIEBAaW5kZXgoW2lzc3VlY29kZV0sIG1hcDogImZrX2luZHVja3NfcHVibGlzaGluZ2pvYjAiKQp9Cgptb2RlbCBpbmR1Y2tzX3JlZmVyZW5jZXJlYXNvbiB7CiAgcmVmZXJlbmNlcmVhc29uaWQgICBJbnQgICAgIEBpZAogIHJlZmVyZW5jZXJlYXNvbnRleHQgU3RyaW5nPyBAZGIuVmFyQ2hhcigxMjkpCn0KCm1vZGVsIGluZHVja3NfcmVmZXJlbmNlcmVhc29ubmFtZSB7CiAgcmVmZXJlbmNlcmVhc29uaWQgICAgICAgICAgSW50CiAgbGFuZ3VhZ2Vjb2RlICAgICAgICAgICAgICAgU3RyaW5nICBAZGIuVmFyQ2hhcigyKQogIHJlZmVyZW5jZXJlYXNvbnRyYW5zbGF0aW9uIFN0cmluZz8gQGRiLlZhckNoYXIoMjgpCgogIEBAaWQoW3JlZmVyZW5jZXJlYXNvbmlkLCBsYW5ndWFnZWNvZGVdKQogIEBAaW5kZXgoW2xhbmd1YWdlY29kZV0sIG1hcDogImZrX2luZHVja3NfcmVmZXJlbmNlcmVhc29ubmFtZTAiKQp9Cgptb2RlbCBpbmR1Y2tzX3NpdGUgewogIHNpdGVjb2RlICAgU3RyaW5nICAgICAgICAgICAgICAgQGlkIEBkYi5WYXJDaGFyKDE2KQogIHVybGJhc2UgICAgU3RyaW5nPyAgICAgICAgICAgICAgQGRiLlZhckNoYXIoNTEpCiAgaW1hZ2VzICAgICBpbmR1Y2tzX3NpdGVfaW1hZ2VzPwogIHNpdGVuYW1lICAgU3RyaW5nPyAgICAgICAgICAgICAgQGRiLlZhckNoYXIoODUpCiAgc2l0ZWxvZ28gICBTdHJpbmc/ICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxMDcpCiAgcHJvcGVydGllcyBTdHJpbmc/ICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxKQp9Cgptb2RlbCBpbmR1Y2tzX3N0YXRjaGFyYWN0ZXJjaGFyYWN0ZXIgewogIGNoYXJhY3RlcmNvZGUgICBTdHJpbmcgIEBkYi5WYXJDaGFyKDU4KQogIGNvY2hhcmFjdGVyY29kZSBTdHJpbmc/IEBkYi5WYXJDaGFyKDU4KQogIHRvdGFsICAgICAgICAgICBJbnQKICB5ZWFycmFuZ2UgICAgICAgU3RyaW5nPyBAZGIuVmFyQ2hhcigxNTIpCgogIEBAaWQoW2NoYXJhY3RlcmNvZGUsIHRvdGFsXSkKfQoKbW9kZWwgaW5kdWNrc19zdGF0Y2hhcmFjdGVyY291bnRyeSB7CiAgY2hhcmFjdGVyY29kZSBTdHJpbmcgQGRiLlZhckNoYXIoNTgpCiAgY291bnRyeWNvZGUgICBTdHJpbmcgQGRiLlZhckNoYXIoMikKICB0b3RhbCAgICAgICAgIEludD8KCiAgQEBpZChbY2hhcmFjdGVyY29kZSwgY291bnRyeWNvZGVdKQp9Cgptb2RlbCBpbmR1Y2tzX3N0YXRjaGFyYWN0ZXJzdG9yeSB7CiAgY2hhcmFjdGVyY29kZSAgIFN0cmluZyAgQGRiLlZhckNoYXIoNTgpCiAgc3RvcnloZWFkZXJjb2RlIFN0cmluZyAgQGRiLlZhckNoYXIoMykKICB0b3RhbCAgICAgICAgICAgSW50PwogIHllYXJyYW5nZSAgICAgICBTdHJpbmc/IEBkYi5WYXJDaGFyKDEwNykKCiAgQEBpZChbY2hhcmFjdGVyY29kZSwgc3RvcnloZWFkZXJjb2RlXSkKfQoKbW9kZWwgaW5kdWNrc19zdGF0cGVyc29uY2hhcmFjdGVyIHsKICBwZXJzb25jb2RlICAgIFN0cmluZyAgQGRiLlZhckNoYXIoNzkpCiAgY2hhcmFjdGVyY29kZSBTdHJpbmc/IEBkYi5WYXJDaGFyKDU4KQogIHRvdGFsICAgICAgICAgSW50CiAgeWVhcnJhbmdlICAgICBTdHJpbmc/IEBkYi5WYXJDaGFyKDExMykKCiAgQEBpZChbcGVyc29uY29kZSwgdG90YWxdKQp9Cgptb2RlbCBpbmR1Y2tzX3N0YXRwZXJzb25jb3VudHJ5IHsKICBwZXJzb25jb2RlICBTdHJpbmcgQGRiLlZhckNoYXIoNzkpCiAgY291bnRyeWNvZGUgU3RyaW5nIEBkYi5WYXJDaGFyKDIpCiAgdG90YWwgICAgICAgSW50PwoKICBAQGlkKFtwZXJzb25jb2RlLCBjb3VudHJ5Y29kZV0pCn0KCm1vZGVsIGluZHVja3Nfc3RhdHBlcnNvbnBlcnNvbiB7CiAgcGVyc29uY29kZSAgIFN0cmluZyAgQGRiLlZhckNoYXIoNzkpCiAgY29wZXJzb25jb2RlIFN0cmluZz8gQGRiLlZhckNoYXIoNzkpCiAgdG90YWwgICAgICAgIEludAogIHllYXJyYW5nZSAgICBTdHJpbmc/IEBkYi5WYXJDaGFyKDU5KQoKICBAQGlkKFtwZXJzb25jb2RlLCB0b3RhbF0pCn0KCm1vZGVsIGluZHVja3Nfc3RhdHBlcnNvbnN0b3J5IHsKICBwZXJzb25jb2RlICAgICAgU3RyaW5nICBAZGIuVmFyQ2hhcig3OSkKICBzdG9yeWhlYWRlcmNvZGUgU3RyaW5nICBAZGIuVmFyQ2hhcigzKQogIHRvdGFsICAgICAgICAgICBJbnQ/CiAgeWVhcnJhbmdlICAgICAgIFN0cmluZz8gQGRiLlZhckNoYXIoNjIpCgogIEBAaWQoW3BlcnNvbmNvZGUsIHN0b3J5aGVhZGVyY29kZV0pCn0KCm1vZGVsIGluZHVja3Nfc3RvcnkgewogIHN0b3J5Y29kZSAgICAgICAgICAgICAgICBTdHJpbmcgICAgICAgICAgICAgICAgQGlkIEBkYi5WYXJDaGFyKDE5KQogIG9yaWdpbmFsc3Rvcnl2ZXJzaW9uY29kZSBTdHJpbmc/ICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTkpCiAgY3JlYXRpb25kYXRlICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxMSkKICBmaXJzdHB1YmxpY2F0aW9uZGF0ZSAgICAgU3RyaW5nPyAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDEwKQogIGVuZHB1YmxpY2F0aW9uZGF0ZSAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTApCiAgdGl0bGUgICAgICAgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICBAZGIuVGV4dAogIHVzZWRpZmZlcmVudGNvZGUgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMjApCiAgc3Rvcnljb21tZW50ICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICBAZGIuVmFyQ2hhcig2NjQpCiAgZXJyb3IgICAgICAgICAgICAgICAgICAgIGluZHVja3Nfc3RvcnlfZXJyb3I/CiAgcmVwY291bnRyeXN1bW1hcnkgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICBAZGIuVGV4dAogIHN0b3J5cGFydHMgICAgICAgICAgICAgICBJbnQ/CiAgbG9ja2VkICAgICAgICAgICAgICAgICAgIGluZHVja3Nfc3RvcnlfbG9ja2VkPwogIGlucHV0ZmlsZWNvZGUgICAgICAgICAgICBJbnQ/CiAgaXNzdWVjb2Rlb2ZzdG9yeWl0ZW0gICAgIFN0cmluZz8gICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxNCkKICBtYWludGVuYW5jZXRlYW1jb2RlICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDgpCiAgc3RvcnloZWFkZXJjb2RlICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigzKQoKICAvLyBAQGluZGV4KFt0aXRsZSwgcmVwY291bnRyeXN1bW1hcnldLCBtYXA6ICJmdWxsdGV4dF9pbmR1Y2tzX3N0b3J5IikKICBAQGluZGV4KFtvcmlnaW5hbHN0b3J5dmVyc2lvbmNvZGVdLCBtYXA6ICJma19pbmR1Y2tzX3N0b3J5MCIpCiAgQEBpbmRleChbZmlyc3RwdWJsaWNhdGlvbmRhdGVdLCBtYXA6ICJma19pbmR1Y2tzX3N0b3J5MSIpCn0KCm1vZGVsIGluZHVja3Nfc3Rvcnljb2RlcyB7CiAgc3Rvcnljb2RlICAgICAgIFN0cmluZyAgQGRiLlZhckNoYXIoMTkpCiAgYWx0ZXJuYXRpdmVjb2RlIFN0cmluZyAgQGRiLlZhckNoYXIoNzIpCiAgdW5wYWNrZWRjb2RlICAgIFN0cmluZz8gQGRiLlZhckNoYXIoODIpCiAgY29kZWNvbW1lbnQgICAgIFN0cmluZz8gQGRiLlZhckNoYXIoMzQpCgogIEBAaWQoW3N0b3J5Y29kZSwgYWx0ZXJuYXRpdmVjb2RlXSkKICBAQGluZGV4KFthbHRlcm5hdGl2ZWNvZGVdLCBtYXA6ICJma19pbmR1Y2tzX3N0b3J5Y29kZXMwIikKfQoKbW9kZWwgaW5kdWNrc19zdG9yeWRlc2NyaXB0aW9uIHsKICBzdG9yeXZlcnNpb25jb2RlIFN0cmluZyAgQGRiLlZhckNoYXIoMTkpCiAgbGFuZ3VhZ2Vjb2RlICAgICBTdHJpbmcgIEBkYi5WYXJDaGFyKDcpCiAgZGVzY3RleHQgICAgICAgICBTdHJpbmc/IEBkYi5WYXJDaGFyKDI4MTQpCgogIEBAaWQoW3N0b3J5dmVyc2lvbmNvZGUsIGxhbmd1YWdlY29kZV0pCiAgQEBpbmRleChbbGFuZ3VhZ2Vjb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19zdG9yeWRlc2NyaXB0aW9uMCIpCn0KCm1vZGVsIGluZHVja3Nfc3RvcnloZWFkZXIgewogIHN0b3J5aGVhZGVyY29kZSAgICBTdHJpbmcgIEBkYi5WYXJDaGFyKDEyKQogIGxldmVsICAgICAgICAgICAgICBTdHJpbmcgIEBkYi5WYXJDaGFyKDEpCiAgdGl0bGUgICAgICAgICAgICAgIFN0cmluZz8gQGRiLlZhckNoYXIoMTk1KQogIHN0b3J5aGVhZGVyY29tbWVudCBTdHJpbmc/IEBkYi5WYXJDaGFyKDU0NCkKICBjb3VudHJ5Y29kZSAgICAgICAgU3RyaW5nPyBAZGIuVmFyQ2hhcigyKQoKICBAQGlkKFtzdG9yeWhlYWRlcmNvZGUsIGxldmVsXSkKfQoKbW9kZWwgaW5kdWNrc19zdG9yeWpvYiB7CiAgc3Rvcnl2ZXJzaW9uY29kZSBTdHJpbmcgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigyMCkKICBwZXJzb25jb2RlICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDc5KQogIHBsb3R3cml0YXJ0aW5rICAgU3RyaW5nICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMSkKICBzdG9yeWpvYmNvbW1lbnQgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDE0MSkKICBpbmRpcmVjdCAgICAgICAgIGluZHVja3Nfc3Rvcnlqb2JfaW5kaXJlY3Q/CiAgZG91YnQgICAgICAgICAgICBpbmR1Y2tzX3N0b3J5am9iX2RvdWJ0PwoKICBAQGlkKFtzdG9yeXZlcnNpb25jb2RlLCBwZXJzb25jb2RlLCBwbG90d3JpdGFydGlua10pCiAgQEBpbmRleChbcGVyc29uY29kZV0sIG1hcDogImZrX2luZHVja3Nfc3Rvcnlqb2IwIikKfQoKbW9kZWwgaW5kdWNrc19zdG9yeXJlZmVyZW5jZSB7CiAgZnJvbXN0b3J5Y29kZSAgICAgU3RyaW5nIEBkYi5WYXJDaGFyKDE4KQogIHRvc3Rvcnljb2RlICAgICAgIFN0cmluZyBAZGIuVmFyQ2hhcigxNykKICByZWZlcmVuY2VyZWFzb25pZCBJbnQ/CgogIEBAaWQoW2Zyb21zdG9yeWNvZGUsIHRvc3Rvcnljb2RlXSkKICBAQGluZGV4KFt0b3N0b3J5Y29kZV0sIG1hcDogImZrX2luZHVja3Nfc3RvcnlyZWZlcmVuY2UwIikKICBAQGluZGV4KFtyZWZlcmVuY2VyZWFzb25pZF0sIG1hcDogImZrX2luZHVja3Nfc3RvcnlyZWZlcmVuY2UxIikKfQoKbW9kZWwgaW5kdWNrc19zdG9yeXN1YnNlcmllcyB7CiAgc3Rvcnljb2RlICAgICAgICAgICAgIFN0cmluZyAgQGRiLlZhckNoYXIoMTgpCiAgc3Vic2VyaWVzY29kZSAgICAgICAgIFN0cmluZyAgQGRiLlZhckNoYXIoMTQ0KQogIHN0b3J5c3Vic2VyaWVzY29tbWVudCBTdHJpbmc/IEBkYi5WYXJDaGFyKDI5KQoKICBAQGlkKFtzdG9yeWNvZGUsIHN1YnNlcmllc2NvZGVdKQogIEBAaW5kZXgoW3N1YnNlcmllc2NvZGVdLCBtYXA6ICJma19pbmR1Y2tzX3N0b3J5c3Vic2VyaWVzMCIpCn0KCm1vZGVsIGluZHVja3Nfc3Rvcnl1cmwgewogIHN0b3J5Y29kZSBTdHJpbmcgIEBkYi5WYXJDaGFyKDEzKQogIHNpdGVjb2RlICBTdHJpbmcgIEBkYi5WYXJDaGFyKDE1KQogIHVybCAgICAgICBTdHJpbmc/IEBkYi5WYXJDaGFyKDQwKQoKICBAQGlkKFtzdG9yeWNvZGUsIHNpdGVjb2RlXSkKICBAQGluZGV4KFtzaXRlY29kZV0sIG1hcDogImZrX2luZHVja3Nfc3Rvcnl1cmwwIikKfQoKbW9kZWwgaW5kdWNrc19zdG9yeXZlcnNpb24gewogIHN0b3J5dmVyc2lvbmNvZGUgICAgICBTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpZCBAZGIuVmFyQ2hhcigyMCkKICBzdG9yeWNvZGUgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxOSkKICBlbnRpcmVwYWdlcyAgICAgICAgICAgSW50PwogIGJyb2tlbnBhZ2VudW1lcmF0b3IgICBJbnQ/CiAgYnJva2VucGFnZWRlbm9taW5hdG9yIEludD8KICBicm9rZW5wYWdldW5zcGVjaWZpZWQgaW5kdWNrc19zdG9yeXZlcnNpb25fYnJva2VucGFnZXVuc3BlY2lmaWVkPwogIGtpbmQgICAgICAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDEpCiAgcm93c3BlcnBhZ2UgICAgICAgICAgIEludD8KICBjb2x1bW5zcGVycGFnZSAgICAgICAgSW50PwogIGFwcGlzeGFwcCAgICAgICAgICAgICBpbmR1Y2tzX3N0b3J5dmVyc2lvbl9hcHBpc3hhcHA/CiAgd2hhdCAgICAgICAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMSkKICBhcHBzdW1tYXJ5ICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVGV4dAogIHBsb3RzdW1tYXJ5ICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5UZXh0CiAgd3JpdHN1bW1hcnkgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlRleHQKICBhcnRzdW1tYXJ5ICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVGV4dAogIGlua3N1bW1hcnkgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5UZXh0CiAgY3JlYXRvcnJlZnN1bW1hcnkgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlRleHQKICBrZXl3b3Jkc3VtbWFyeSAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVGV4dAogIGVzdGltYXRlZHBhbmVscyAgICAgICBJbnQ/CgogIC8vIEBAaW5kZXgoW2FwcHN1bW1hcnksIHBsb3RzdW1tYXJ5LCB3cml0c3VtbWFyeSwgYXJ0c3VtbWFyeSwgaW5rc3VtbWFyeSwgY3JlYXRvcnJlZnN1bW1hcnksIGtleXdvcmRzdW1tYXJ5XSwgbWFwOiAiZnVsbHRleHRfaW5kdWNrc19zdG9yeXZlcnNpb24iKQogIEBAaW5kZXgoW3N0b3J5Y29kZV0sIG1hcDogImZrX2luZHVja3Nfc3Rvcnl2ZXJzaW9uMSIpCn0KCm1vZGVsIGluZHVja3Nfc3Rvcnl2ZXJzaW9uX25vZnVsbHRleHQgewogIHN0b3J5dmVyc2lvbmNvZGUgICAgICBTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGlkIEBkYi5WYXJDaGFyKDE5KQogIHN0b3J5Y29kZSAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTkpCiAgZW50aXJlcGFnZXMgICAgICAgICAgIEludD8KICBicm9rZW5wYWdlbnVtZXJhdG9yICAgSW50PwogIGJyb2tlbnBhZ2VkZW5vbWluYXRvciBJbnQ/CiAgYnJva2VucGFnZXVuc3BlY2lmaWVkIGluZHVja3Nfc3Rvcnl2ZXJzaW9uX25vZnVsbHRleHRfYnJva2VucGFnZXVuc3BlY2lmaWVkPwogIGtpbmQgICAgICAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMSkKICByb3dzcGVycGFnZSAgICAgICAgICAgSW50PwogIGNvbHVtbnNwZXJwYWdlICAgICAgICBJbnQ/CiAgYXBwaXN4YXBwICAgICAgICAgICAgIGluZHVja3Nfc3Rvcnl2ZXJzaW9uX25vZnVsbHRleHRfYXBwaXN4YXBwPwogIHdoYXQgICAgICAgICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMSkKICBhcHBzdW1tYXJ5ICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5UZXh0CiAgcGxvdHN1bW1hcnkgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVGV4dAogIHdyaXRzdW1tYXJ5ICAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlRleHQKICBhcnRzdW1tYXJ5ICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5UZXh0CiAgaW5rc3VtbWFyeSAgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZGIuVGV4dAogIGNyZWF0b3JyZWZzdW1tYXJ5ICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlRleHQKICBrZXl3b3Jkc3VtbWFyeSAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5UZXh0CiAgZXN0aW1hdGVkcGFuZWxzICAgICAgIEludD8KCiAgQEBpbmRleChbc3Rvcnljb2RlXSwgbWFwOiAiZmsxIikKICBAQGluZGV4KFtzdG9yeXZlcnNpb25jb2RlXSwgbWFwOiAicGswIikKfQoKbW9kZWwgaW5kdWNrc19zdHVkaW8gewogIHN0dWRpb2NvZGUgICAgU3RyaW5nICBAaWQgQGRiLlZhckNoYXIoMjMpCiAgY291bnRyeWNvZGUgICBTdHJpbmc/IEBkYi5WYXJDaGFyKDIpCiAgc3R1ZGlvbmFtZSAgICBTdHJpbmc/IEBkYi5WYXJDaGFyKDI0KQogIGNpdHkgICAgICAgICAgU3RyaW5nPyBAZGIuVmFyQ2hhcigxMikKICBkZXNjcmlwdGlvbiAgIFN0cmluZz8gQGRiLlZhckNoYXIoNDE1KQogIG90aGVydGV4dCAgICAgU3RyaW5nPyBAZGIuVmFyQ2hhcig5NCkKICBwaG90b2ZpbGVuYW1lIFN0cmluZz8gQGRiLlZhckNoYXIoMTgpCiAgcGhvdG9jb21tZW50ICBTdHJpbmc/IEBkYi5WYXJDaGFyKDQwKQogIHBob3Rvc291cmNlICAgU3RyaW5nPyBAZGIuVmFyQ2hhcig0MikKICBzdHVkaW9yZWZzICAgIFN0cmluZz8gQGRiLlZhckNoYXIoMjA0KQoKICBAQGluZGV4KFtjb3VudHJ5Y29kZV0sIG1hcDogImZrX2luZHVja3Nfc3R1ZGlvMCIpCn0KCm1vZGVsIGluZHVja3Nfc3R1ZGlvd29yayB7CiAgc3R1ZGlvY29kZSBTdHJpbmcgQGRiLlZhckNoYXIoMjMpCiAgcGVyc29uY29kZSBTdHJpbmcgQGRiLlZhckNoYXIoMjQpCgogIEBAaWQoW3N0dWRpb2NvZGUsIHBlcnNvbmNvZGVdKQogIEBAaW5kZXgoW3BlcnNvbmNvZGVdLCBtYXA6ICJma19pbmR1Y2tzX3N0dWRpb3dvcmswIikKfQoKbW9kZWwgaW5kdWNrc19zdWJzZXJpZXMgewogIHN1YnNlcmllc2NvZGUgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICBAaWQgQGRiLlZhckNoYXIoOTUpCiAgc3Vic2VyaWVzbmFtZSAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDk1KQogIG9mZmljaWFsICAgICAgICAgIGluZHVja3Nfc3Vic2VyaWVzX29mZmljaWFsPwogIHN1YnNlcmllc2NvbW1lbnQgIFN0cmluZz8gICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigyODUpCiAgc3Vic2VyaWVzY2F0ZWdvcnkgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDQ2KQp9Cgptb2RlbCBpbmR1Y2tzX3N1YnNlcmllc25hbWUgewogIHN1YnNlcmllc2NvZGUgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDQ0KQogIGxhbmd1YWdlY29kZSAgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDcpCiAgc3Vic2VyaWVzbmFtZSAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMjk0KQogIHByZWZlcnJlZCAgICAgICAgICAgIGluZHVja3Nfc3Vic2VyaWVzbmFtZV9wcmVmZXJyZWQ/CiAgc3Vic2VyaWVzbmFtZWNvbW1lbnQgU3RyaW5nPyAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMjgpCgogIEBAaWQoW3N1YnNlcmllc2NvZGUsIGxhbmd1YWdlY29kZV0pCiAgQEBpbmRleChbbGFuZ3VhZ2Vjb2RlXSwgbWFwOiAiZmtfaW5kdWNrc19zdWJzZXJpZXNuYW1lMCIpCn0KCm1vZGVsIGluZHVja3Nfc3Vic3RvcnkgewogIHN0b3J5Y29kZSAgICAgICAgICAgICAgICBTdHJpbmcgICAgICAgICAgICAgICAgICAgQGlkIEBkYi5WYXJDaGFyKDEyKQogIG9yaWdpbmFsc3Rvcnl2ZXJzaW9uY29kZSBTdHJpbmc/ICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoMTIpCiAgc3VwZXJzdG9yeWNvZGUgICAgICAgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxMykKICBwYXJ0ICAgICAgICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDMpCiAgZmlyc3RwdWJsaWNhdGlvbmRhdGUgICAgIFN0cmluZz8gICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcigxMCkKICB0aXRsZSAgICAgICAgICAgICAgICAgICAgU3RyaW5nPyAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyKDgxKQogIHN1YnN0b3J5Y29tbWVudCAgICAgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoNjA3KQogIGVycm9yICAgICAgICAgICAgICAgICAgICBpbmR1Y2tzX3N1YnN0b3J5X2Vycm9yPwogIGxvY2tlZCAgICAgICAgICAgICAgICAgICBpbmR1Y2tzX3N1YnN0b3J5X2xvY2tlZD8KICBpbnB1dGZpbGVjb2RlICAgICAgICAgICAgSW50PwogIG1haW50ZW5hbmNldGVhbWNvZGUgICAgICBTdHJpbmc/ICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIoOCkKCiAgQEBpbmRleChbZmlyc3RwdWJsaWNhdGlvbmRhdGVdLCBtYXA6ICJma19pbmR1Y2tzX3N1YnN0b3J5MCIpCn0KCm1vZGVsIGluZHVja3NfdGVhbSB7CiAgdGVhbWNvZGUgICAgICAgICAgICBTdHJpbmcgIEBpZCBAZGIuVmFyQ2hhcigxMykKICB0ZWFtZGVzY3JpcHRpb25uYW1lIFN0cmluZz8gQGRiLlZhckNoYXIoMzMpCiAgdGVhbXNob3J0bmFtZSAgICAgICBTdHJpbmc/IEBkYi5WYXJDaGFyKDcpCn0KCm1vZGVsIGluZHVja3NfdGVhbW1lbWJlciB7CiAgdGVhbWNvZGUgICBTdHJpbmcgIEBpZCBAZGIuVmFyQ2hhcigxMykKICBwZXJzb25jb2RlIFN0cmluZz8gQGRiLlZhckNoYXIoMykKfQoKbW9kZWwgaW5kdWNrc191Y3JlbGF0aW9uIHsKICB1bml2ZXJzZWNvZGUgIFN0cmluZyBAZGIuVmFyQ2hhcigyOCkKICBjaGFyYWN0ZXJjb2RlIFN0cmluZyBAZGIuVmFyQ2hhcig0NSkKCiAgQEBpZChbdW5pdmVyc2Vjb2RlLCBjaGFyYWN0ZXJjb2RlXSkKICBAQGluZGV4KFtjaGFyYWN0ZXJjb2RlXSwgbWFwOiAiZmtfaW5kdWNrc191Y3JlbGF0aW9uMCIpCn0KCm1vZGVsIGluZHVja3NfdW5pdmVyc2UgewogIHVuaXZlcnNlY29kZSAgICBTdHJpbmcgIEBpZCBAZGIuVmFyQ2hhcigyOCkKICB1bml2ZXJzZWNvbW1lbnQgU3RyaW5nPyBAZGIuVmFyQ2hhcigxKQp9Cgptb2RlbCBpbmR1Y2tzX3VuaXZlcnNlbmFtZSB7CiAgdW5pdmVyc2Vjb2RlIFN0cmluZyAgQGRiLlZhckNoYXIoMjgpCiAgbGFuZ3VhZ2Vjb2RlIFN0cmluZyAgQGRiLlZhckNoYXIoNSkKICB1bml2ZXJzZW5hbWUgU3RyaW5nPyBAZGIuVmFyQ2hhcig3NikKCiAgQEBpZChbdW5pdmVyc2Vjb2RlLCBsYW5ndWFnZWNvZGVdKQogIEBAaW5kZXgoW2xhbmd1YWdlY29kZV0sIG1hcDogImZrX2luZHVja3NfdW5pdmVyc2VuYW1lMCIpCn0KCm1vZGVsIG51bWVyb3NfY3B0IHsKICBQYXlzICAgICAgICAgICAgU3RyaW5nIEBkYi5WYXJDaGFyKDYpCiAgTWFnYXppbmUgICAgICAgIFN0cmluZyBAZGIuVmFyQ2hhcig4KQogIHB1YmxpY2F0aW9uY29kZSBTdHJpbmcgQGRiLlZhckNoYXIoMTUpCiAgTnVtZXJvICAgICAgICAgIFN0cmluZyBAZGIuVmFyQ2hhcig4KQogIENwdCAgICAgICAgICAgICBJbnQ/CgogIEBAaWQoW3B1YmxpY2F0aW9uY29kZSwgTnVtZXJvXSkKICBAQGluZGV4KFtwdWJsaWNhdGlvbmNvZGVdLCBtYXA6ICJudW1lcm9zX2NwdF9QYXlzX01hZ2F6aW5lX3VpbmRleCIpCn0KCmVudW0gaW5kdWNrc19sb2dvY2hhcmFjdGVyX3JlYWxseWludGl0bGUgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19zaXRlX2ltYWdlcyB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX21vdmllY2hhcmFjdGVyX2lzdGl0bGVjaGFyYWN0ZXIgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19jaGFyYWN0ZXJfb2ZmaWNpYWwgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19zdWJzZXJpZXNfb2ZmaWNpYWwgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19jaGFyYWN0ZXJyZWZlcmVuY2VfaXNncm91cG9mY2hhcmFjdGVycyB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX3BlcnNvbl9vZmZpY2lhbCB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX3N1YnNlcmllc25hbWVfcHJlZmVycmVkIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfaGVyb2NoYXJhY3Rlcl9kb3VidCB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX2lzc3VlZGF0ZV9kb3VidCB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX2NoYXJhY3Rlcm5hbWVfcHJlZmVycmVkIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfbW92aWVyZWZlcmVuY2VfZnJvbW1vdmlldG9zdG9yeSB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX2NoYXJhY3Rlcl9vbmV0aW1lIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfaXNzdWVqb2JfZG91YnQgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19lbnRyeWpvYl9kb3VidCB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX21vdmllam9iX2luZGlyZWN0IHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfYXBwZWFyYW5jZV9kb3VidCB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX3N0b3J5am9iX2luZGlyZWN0IHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfaW5wdXRmaWxlX2xvY2tlZCB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX2NoYXJhY3Rlcl9oZXJvb25seSB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX3BlcnNvbl91bmtub3duc3R1ZGlvbWVtYmVyIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3Nfc3Rvcnl2ZXJzaW9uX25vZnVsbHRleHRfYnJva2VucGFnZXVuc3BlY2lmaWVkIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfZW50cnl1cmxfcHVibGljIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfbW92aWVqb2JfZG91YnQgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19zdG9yeXZlcnNpb25fYnJva2VucGFnZXVuc3BlY2lmaWVkIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3Nfc3Rvcnlqb2JfZG91YnQgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19tb3ZpZV9sb2NrZWQgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19pc3N1ZXJhbmdlX251bWJlcnNhcmVmYWtlIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfcGVyc29uX2lzZmFrZSB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX2lzc3VlcmFuZ2VfZXJyb3IgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19wdWJsaWNhdGlvbl9udW1iZXJzYXJlZmFrZSB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX3N1YnN0b3J5X2Vycm9yIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfcHVibGljYXRpb25fZXJyb3IgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19zdWJzdG9yeV9sb2NrZWQgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19zdG9yeV9lcnJvciB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX2xvZ19tYXJrZWQgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19wdWJsaWNhdGlvbl9sb2NrZWQgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19zdG9yeXZlcnNpb25fbm9mdWxsdGV4dF9hcHBpc3hhcHAgewogIFkKICBOCn0KCmVudW0gaW5kdWNrc19lbnRyeV9ub2Z1bGx0ZXh0X3JlYWxseXRpdGxlIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3Nfc3Rvcnl2ZXJzaW9uX2FwcGlzeGFwcCB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX2VudHJ5X3JlYWxseXRpdGxlIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfaW5wdXRmaWxlX3NlY3VuZGFyeSB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX3B1YmxpY2F0aW9uX2lueGZvcmJpZGRlbiB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX2lzc3VlX2Z1bGx5aW5kZXhlZCB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX3N0b3J5X2xvY2tlZCB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX2lzc3VlX2Vycm9yIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfaXNzdWVfbG9ja2VkIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfZW50cnlfbm9mdWxsdGV4dF9taXJyb3JlZCB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX2VudHJ5X21pcnJvcmVkIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfaXNzdWVfaW54Zm9yYmlkZGVuIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfZW50cnlfbm9mdWxsdGV4dF9zaWRld2F5cyB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX2VudHJ5X3NpZGV3YXlzIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfZW50cnlfbm9mdWxsdGV4dF9pZGVudGlmaWNhdGlvbnVuY2VydGFpbiB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX2VudHJ5X2lkZW50aWZpY2F0aW9udW5jZXJ0YWluIHsKICBZCiAgTgp9CgplbnVtIGluZHVja3NfZW50cnlfbm9mdWxsdGV4dF9lcnJvciB7CiAgWQogIE4KfQoKZW51bSBpbmR1Y2tzX2VudHJ5X2Vycm9yIHsKICBZCiAgTgp9Cg==",
  "inlineSchemaHash": "384e5d0451ee3dad1d704bae0d1651ec90df6a0a585e5299d07cf1e603f8b20f",
  "noEngine": false
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "dist/prisma/client_coa",
    "prisma/client_coa",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"datasets_entryurls\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dataset_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sitecode_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_appearance\":{\"dbName\":null,\"fields\":[{\"name\":\"storyversioncode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"appearancecomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"doubt\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_appearance_doubt\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"storyversioncode\",\"charactercode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_character\":{\"dbName\":null,\"fields\":[{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charactername\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"official\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_character_official\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"onetime\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_character_onetime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"heroonly\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_character_heroonly\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charactercomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_characteralias\":{\"dbName\":null,\"fields\":[{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charactername\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_characterdetail\":{\"dbName\":null,\"fields\":[{\"name\":\"charactername\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_charactername\":{\"dbName\":null,\"fields\":[{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charactername\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preferred\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_charactername_preferred\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"characternamecomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"charactercode\",\"languagecode\",\"charactername\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_characterreference\":{\"dbName\":null,\"fields\":[{\"name\":\"fromcharactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tocharactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isgroupofcharacters\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_characterreference_isgroupofcharacters\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"fromcharactercode\",\"tocharactercode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_characterurl\":{\"dbName\":null,\"fields\":[{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sitecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"charactercode\",\"sitecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_country\":{\"dbName\":null,\"fields\":[{\"name\":\"countrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"countryname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"defaultlanguage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"defaultmaintenanceteam\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_countryname\":{\"dbName\":null,\"fields\":[{\"name\":\"countrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"countryname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"countrycode\",\"languagecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_currency\":{\"dbName\":null,\"fields\":[{\"name\":\"currencycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currencyname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_currencyname\":{\"dbName\":null,\"fields\":[{\"name\":\"currencycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"shortcurrencyname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"longcurrencyname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"currencycode\",\"languagecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_entry\":{\"dbName\":null,\"fields\":[{\"name\":\"entrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storyversioncode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"includedinentrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"position\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"printedcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"guessedcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reallytitle\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_entry_reallytitle\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"printedhero\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"changes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cut\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"minorchanges\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"missingpanels\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mirrored\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_entry_mirrored\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sideways\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_entry_sideways\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enddate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"identificationuncertain\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_entry_identificationuncertain\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alsoreprint\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"part\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entrycomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"error\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_entry_error\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_entry_nofulltext\":{\"dbName\":null,\"fields\":[{\"name\":\"entrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storyversioncode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"includedinentrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"position\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"printedcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"guessedcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reallytitle\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_entry_nofulltext_reallytitle\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"printedhero\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"changes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cut\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"minorchanges\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"missingpanels\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mirrored\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_entry_nofulltext_mirrored\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sideways\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_entry_nofulltext_sideways\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enddate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"identificationuncertain\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_entry_nofulltext_identificationuncertain\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alsoreprint\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"part\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entrycomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"error\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_entry_nofulltext_error\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_entrycharactername\":{\"dbName\":null,\"fields\":[{\"name\":\"entrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charactername\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"entrycode\",\"charactercode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_entryjob\":{\"dbName\":null,\"fields\":[{\"name\":\"entrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"transletcol\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entryjobcomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"doubt\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_entryjob_doubt\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"entrycode\",\"personcode\",\"transletcol\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_entryurl\":{\"dbName\":null,\"fields\":[{\"name\":\"entrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sitecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pagenumber\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"public\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_entryurl_public\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_equiv\":{\"dbName\":null,\"fields\":[{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"equivid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"equivcomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"issuecode\",\"equivid\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_herocharacter\":{\"dbName\":null,\"fields\":[{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"doubt\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_herocharacter_doubt\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"storycode\",\"charactercode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_inputfile\":{\"dbName\":null,\"fields\":[{\"name\":\"inputfilecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"path\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"filename\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"layout\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locked\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_inputfile_locked\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maintenanceteamcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"countrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"producercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"secundary\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_inputfile_secundary\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_issue\":{\"dbName\":null,\"fields\":[{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuerangecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuenumber\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"size\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pages\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"printrun\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attached\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"oldestdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fullyindexed\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_issue_fullyindexed\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuecomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"error\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_issue_error\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"filledoldestdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locked\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_issue_locked\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inxforbidden\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_issue_inxforbidden\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inputfilecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maintenanceteamcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_issuecollecting\":{\"dbName\":null,\"fields\":[{\"name\":\"collectingissuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"collectedissuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"collectingissuecode\",\"collectedissuecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_issuedate\":{\"dbName\":null,\"fields\":[{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"kindofdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"doubt\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_issuedate_doubt\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"issuecode\",\"date\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_issuejob\":{\"dbName\":null,\"fields\":[{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inxtransletcol\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuejobcomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"doubt\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_issuejob_doubt\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"issuecode\",\"personcode\",\"inxtransletcol\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_issueprice\":{\"dbName\":null,\"fields\":[{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currency\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sequencenumber\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"issuecode\",\"amount\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_issuequotation\":{\"dbName\":null,\"fields\":[{\"name\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuenumber\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estimationmin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estimationmax\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"scrapedate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"source\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_issuerange\":{\"dbName\":null,\"fields\":[{\"name\":\"issuerangecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"circulation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuerangecomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numbersarefake\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_issuerange_numbersarefake\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"error\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_issuerange_error\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_issueurl\":{\"dbName\":null,\"fields\":[{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sitecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"issuecode\",\"sitecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_language\":{\"dbName\":null,\"fields\":[{\"name\":\"languagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"defaultlanguagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagename\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_languagename\":{\"dbName\":null,\"fields\":[{\"name\":\"desclanguagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagename\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"desclanguagecode\",\"languagecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_log\":{\"dbName\":null,\"fields\":[{\"name\":\"number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logkey\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logtype\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"par1\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"par2\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"par3\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"marked\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_log_marked\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inputfilecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maintenanceteamcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_logdata\":{\"dbName\":null,\"fields\":[{\"name\":\"logid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logtext\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_logocharacter\":{\"dbName\":null,\"fields\":[{\"name\":\"entrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reallyintitle\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_logocharacter_reallyintitle\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logocharactercomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"entrycode\",\"charactercode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_movie\":{\"dbName\":null,\"fields\":[{\"name\":\"moviecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moviecomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"appsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moviejobsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locked\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_movie_locked\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inputfilecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maintenanceteamcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aka\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creationdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moviedescription\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"distributor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"genre\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderer\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicationdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"source\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tim\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_moviecharacter\":{\"dbName\":null,\"fields\":[{\"name\":\"moviecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"istitlecharacter\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_moviecharacter_istitlecharacter\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"moviecode\",\"charactercode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_moviejob\":{\"dbName\":null,\"fields\":[{\"name\":\"moviecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moviejobcomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"indirect\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_moviejob_indirect\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"doubt\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_moviejob_doubt\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"moviecode\",\"personcode\",\"role\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_moviereference\":{\"dbName\":null,\"fields\":[{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moviecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencereasonid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"frommovietostory\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_moviereference_frommovietostory\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"storycode\",\"moviecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_person\":{\"dbName\":null,\"fields\":[{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nationalitycountrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fullname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"official\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_person_official\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personcomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unknownstudiomember\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_person_unknownstudiomember\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isfake\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_person_isfake\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numberofindexedissues\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"birthname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"borndate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bornplace\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deceaseddate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deceasedplace\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"education\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"moviestext\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comicstext\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"othertext\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photofilename\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photocomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photosource\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personrefs\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_personurl\":{\"dbName\":null,\"fields\":[{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sitecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"personcode\",\"sitecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_publication\":{\"dbName\":null,\"fields\":[{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"countrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"size\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicationcomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"circulation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"numbersarefake\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_publication_numbersarefake\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"error\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_publication_error\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locked\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_publication_locked\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inxforbidden\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_publication_inxforbidden\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inputfilecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maintenanceteamcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_publicationcategory\":{\"dbName\":null,\"fields\":[{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_publicationname\":{\"dbName\":null,\"fields\":[{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicationname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_publicationurl\":{\"dbName\":null,\"fields\":[{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sitecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"publicationcode\",\"sitecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_publisher\":{\"dbName\":null,\"fields\":[{\"name\":\"publisherid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publishername\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_publishingjob\":{\"dbName\":null,\"fields\":[{\"name\":\"publisherid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publishingjobcomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"publisherid\",\"issuecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_referencereason\":{\"dbName\":null,\"fields\":[{\"name\":\"referencereasonid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencereasontext\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_referencereasonname\":{\"dbName\":null,\"fields\":[{\"name\":\"referencereasonid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencereasontranslation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"referencereasonid\",\"languagecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_site\":{\"dbName\":null,\"fields\":[{\"name\":\"sitecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"urlbase\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"images\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_site_images\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sitename\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sitelogo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"properties\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_statcharactercharacter\":{\"dbName\":null,\"fields\":[{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cocharactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"yearrange\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"charactercode\",\"total\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_statcharactercountry\":{\"dbName\":null,\"fields\":[{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"countrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"charactercode\",\"countrycode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_statcharacterstory\":{\"dbName\":null,\"fields\":[{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storyheadercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"yearrange\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"charactercode\",\"storyheadercode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_statpersoncharacter\":{\"dbName\":null,\"fields\":[{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"yearrange\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"personcode\",\"total\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_statpersoncountry\":{\"dbName\":null,\"fields\":[{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"countrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"personcode\",\"countrycode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_statpersonperson\":{\"dbName\":null,\"fields\":[{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"copersoncode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"yearrange\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"personcode\",\"total\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_statpersonstory\":{\"dbName\":null,\"fields\":[{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storyheadercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"yearrange\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"personcode\",\"storyheadercode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_story\":{\"dbName\":null,\"fields\":[{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originalstoryversioncode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creationdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firstpublicationdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endpublicationdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"usedifferentcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storycomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"error\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_story_error\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"repcountrysummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storyparts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locked\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_story_locked\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inputfilecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuecodeofstoryitem\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maintenanceteamcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storyheadercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_storycodes\":{\"dbName\":null,\"fields\":[{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alternativecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unpackedcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codecomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"storycode\",\"alternativecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_storydescription\":{\"dbName\":null,\"fields\":[{\"name\":\"storyversioncode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"desctext\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"storyversioncode\",\"languagecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_storyheader\":{\"dbName\":null,\"fields\":[{\"name\":\"storyheadercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"level\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storyheadercomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"countrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"storyheadercode\",\"level\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_storyjob\":{\"dbName\":null,\"fields\":[{\"name\":\"storyversioncode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"plotwritartink\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storyjobcomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"indirect\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_storyjob_indirect\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"doubt\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_storyjob_doubt\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"storyversioncode\",\"personcode\",\"plotwritartink\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_storyreference\":{\"dbName\":null,\"fields\":[{\"name\":\"fromstorycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tostorycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referencereasonid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"fromstorycode\",\"tostorycode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_storysubseries\":{\"dbName\":null,\"fields\":[{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subseriescode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storysubseriescomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"storycode\",\"subseriescode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_storyurl\":{\"dbName\":null,\"fields\":[{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sitecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"storycode\",\"sitecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_storyversion\":{\"dbName\":null,\"fields\":[{\"name\":\"storyversioncode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entirepages\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"brokenpagenumerator\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"brokenpagedenominator\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"brokenpageunspecified\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_storyversion_brokenpageunspecified\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"kind\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rowsperpage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"columnsperpage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"appisxapp\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_storyversion_appisxapp\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"what\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"appsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"plotsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"writsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"artsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inksummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creatorrefsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"keywordsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estimatedpanels\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_storyversion_nofulltext\":{\"dbName\":null,\"fields\":[{\"name\":\"storyversioncode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entirepages\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"brokenpagenumerator\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"brokenpagedenominator\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"brokenpageunspecified\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_storyversion_nofulltext_brokenpageunspecified\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"kind\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rowsperpage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"columnsperpage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"appisxapp\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_storyversion_nofulltext_appisxapp\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"what\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"appsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"plotsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"writsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"artsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inksummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creatorrefsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"keywordsummary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"estimatedpanels\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_studio\":{\"dbName\":null,\"fields\":[{\"name\":\"studiocode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"countrycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"studioname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"othertext\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photofilename\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photocomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photosource\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"studiorefs\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_studiowork\":{\"dbName\":null,\"fields\":[{\"name\":\"studiocode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"studiocode\",\"personcode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_subseries\":{\"dbName\":null,\"fields\":[{\"name\":\"subseriescode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subseriesname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"official\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_subseries_official\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subseriescomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subseriescategory\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_subseriesname\":{\"dbName\":null,\"fields\":[{\"name\":\"subseriescode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subseriesname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preferred\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_subseriesname_preferred\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"subseriesnamecomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"subseriescode\",\"languagecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_substory\":{\"dbName\":null,\"fields\":[{\"name\":\"storycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originalstoryversioncode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"superstorycode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"part\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firstpublicationdate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"substorycomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"error\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_substory_error\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"locked\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"inducks_substory_locked\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inputfilecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maintenanceteamcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_team\":{\"dbName\":null,\"fields\":[{\"name\":\"teamcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"teamdescriptionname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"teamshortname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_teammember\":{\"dbName\":null,\"fields\":[{\"name\":\"teamcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_ucrelation\":{\"dbName\":null,\"fields\":[{\"name\":\"universecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"charactercode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"universecode\",\"charactercode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_universe\":{\"dbName\":null,\"fields\":[{\"name\":\"universecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"universecomment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"inducks_universename\":{\"dbName\":null,\"fields\":[{\"name\":\"universecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"languagecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"universename\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"universecode\",\"languagecode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"numeros_cpt\":{\"dbName\":null,\"fields\":[{\"name\":\"Pays\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Magazine\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publicationcode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Numero\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"Cpt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"publicationcode\",\"Numero\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"inducks_logocharacter_reallyintitle\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_site_images\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_moviecharacter_istitlecharacter\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_character_official\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_subseries_official\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_characterreference_isgroupofcharacters\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_person_official\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_subseriesname_preferred\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_herocharacter_doubt\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_issuedate_doubt\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_charactername_preferred\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_moviereference_frommovietostory\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_character_onetime\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_issuejob_doubt\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_entryjob_doubt\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_moviejob_indirect\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_appearance_doubt\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_storyjob_indirect\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_inputfile_locked\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_character_heroonly\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_person_unknownstudiomember\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_storyversion_nofulltext_brokenpageunspecified\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_entryurl_public\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_moviejob_doubt\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_storyversion_brokenpageunspecified\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_storyjob_doubt\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_movie_locked\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_issuerange_numbersarefake\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_person_isfake\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_issuerange_error\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_publication_numbersarefake\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_substory_error\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_publication_error\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_substory_locked\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_story_error\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_log_marked\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_publication_locked\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_storyversion_nofulltext_appisxapp\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_entry_nofulltext_reallytitle\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_storyversion_appisxapp\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_entry_reallytitle\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_inputfile_secundary\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_publication_inxforbidden\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_issue_fullyindexed\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_story_locked\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_issue_error\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_issue_locked\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_entry_nofulltext_mirrored\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_entry_mirrored\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_issue_inxforbidden\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_entry_nofulltext_sideways\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_entry_sideways\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_entry_nofulltext_identificationuncertain\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_entry_identificationuncertain\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_entry_nofulltext_error\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null},\"inducks_entry_error\":{\"values\":[{\"name\":\"Y\",\"dbName\":null},{\"name\":\"N\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
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
path.join(process.cwd(), "dist/prisma/client_coa/libquery_engine-debian-openssl-1.1.x.so.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-3.0.x.so.node");
path.join(process.cwd(), "dist/prisma/client_coa/libquery_engine-debian-openssl-3.0.x.so.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "dist/prisma/client_coa/schema.prisma")
