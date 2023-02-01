CREATE DATABASE IF NOT EXISTS coa;
USE coa;

create table inducks_appearance
(
  storyversioncode  varchar(19)     not null,
  charactercode     varchar(62)     not null,
  number            int(7)          null,
  appearancecomment varchar(209)    null,
  doubt             enum ('Y', 'N') null,
  primary key (storyversioncode, charactercode)
);

create index fk_inducks_appearance0
  on inducks_appearance (charactercode);

create index fk_inducks_appearance1
  on inducks_appearance (appearancecomment);

create table inducks_character
(
  charactercode    varchar(69)     not null
    primary key,
  charactername    text            null,
  official         enum ('Y', 'N') null,
  onetime          enum ('Y', 'N') null,
  heroonly         enum ('Y', 'N') null,
  charactercomment varchar(671)    null
);

create fulltext index fulltext_inducks_character
  on inducks_character (charactername);

create table inducks_characteralias
(
  charactercode varchar(31) null,
  charactername varchar(58) not null
    primary key
);

create index fk_inducks_characteralias0
  on inducks_characteralias (charactercode);

create table inducks_characterdetail
(
  charactername varchar(7) null,
  charactercode varchar(6) not null
    primary key,
  number        int(7)     null
);

create index fk_inducks_characterdetail0
  on inducks_characterdetail (charactername);

create table inducks_charactername
(
  charactercode        varchar(45)     not null,
  languagecode         varchar(7)      not null,
  charactername        varchar(83)     not null,
  preferred            enum ('Y', 'N') null,
  characternamecomment varchar(99)     null,
  primary key (charactercode, languagecode, charactername)
);

create index fk_inducks_charactername0
  on inducks_charactername (languagecode);

create table inducks_characterreference
(
  fromcharactercode   varchar(25)     not null,
  tocharactercode     varchar(25)     not null,
  isgroupofcharacters enum ('Y', 'N') null,
  primary key (fromcharactercode, tocharactercode)
);

create index fk_inducks_characterreference0
  on inducks_characterreference (tocharactercode);

create table inducks_characterurl
(
  charactercode varchar(1) not null,
  sitecode      varchar(1) not null,
  url           varchar(1) null,
  primary key (charactercode, sitecode)
);

create index fk_inducks_characterurl0
  on inducks_characterurl (sitecode);

create table inducks_country
(
  countrycode            varchar(2)  not null
    primary key,
  countryname            varchar(20) null,
  defaultlanguage        varchar(7)  null,
  defaultmaintenanceteam varchar(8)  null
);

create table inducks_countryname
(
  countrycode  varchar(2)  not null,
  languagecode varchar(5)  not null,
  countryname  varchar(56) null,
  primary key (countrycode, languagecode)
);

create index fk_inducks_countryname0
  on inducks_countryname (languagecode);

create table inducks_currency
(
  currencycode varchar(3)  not null
    primary key,
  currencyname varchar(18) null
);

create table inducks_currencyname
(
  currencycode      varchar(3)  not null,
  languagecode      varchar(2)  not null,
  shortcurrencyname varchar(19) null,
  longcurrencyname  varchar(20) null,
  primary key (currencycode, languagecode)
);

create index fk_inducks_currencyname0
  on inducks_currencyname (languagecode);

create table inducks_entry
(
  entrycode               varchar(22)     not null
    primary key,
  issuecode               varchar(17)     null,
  storyversioncode        varchar(19)     null,
  languagecode            varchar(7)      null,
  includedinentrycode     varchar(19)     null,
  position                varchar(9)      null,
  printedcode             varchar(88)     null,
  guessedcode             varchar(39)     null,
  title                   varchar(284)    null,
  reallytitle             enum ('Y', 'N') null,
  printedhero             varchar(96)     null,
  changes                 varchar(628)    null,
  cut                     varchar(104)    null,
  minorchanges            varchar(558)    null,
  missingpanels           varchar(2)      null,
  mirrored                enum ('Y', 'N') null,
  sideways                enum ('Y', 'N') null,
  startdate               varchar(10)     null,
  enddate                 varchar(10)     null,
  identificationuncertain enum ('Y', 'N') null,
  alsoreprint             varchar(164)    null,
  part                    varchar(5)      null,
  entrycomment            varchar(2009)   null,
  error                   enum ('Y', 'N') null
);

create fulltext index entryTitleFullText
  on inducks_entry (title);

create index fk_inducks_entry0
  on inducks_entry (issuecode);

create index fk_inducks_entry1
  on inducks_entry (storyversioncode);

create index fk_inducks_entry2
  on inducks_entry (languagecode);

create index fk_inducks_entry3
  on inducks_entry (includedinentrycode);

create index fk_inducks_entry4
  on inducks_entry (position);

create table inducks_entry_nofulltext
(
  entrycode               varchar(22)     null,
  issuecode               varchar(17)     null,
  storyversioncode        varchar(19)     null,
  languagecode            varchar(7)      null,
  includedinentrycode     varchar(19)     null,
  position                varchar(7)      null,
  printedcode             varchar(88)     null,
  guessedcode             varchar(39)     null,
  title                   varchar(235)    null,
  reallytitle             enum ('Y', 'N') null,
  printedhero             varchar(96)     null,
  changes                 varchar(628)    null,
  cut                     varchar(100)    null,
  minorchanges            varchar(558)    null,
  missingpanels           varchar(23)     null,
  mirrored                enum ('Y', 'N') null,
  sideways                enum ('Y', 'N') null,
  startdate               varchar(10)     null,
  enddate                 varchar(10)     null,
  identificationuncertain enum ('Y', 'N') null,
  alsoreprint             varchar(66)     null,
  part                    varchar(5)      null,
  entrycomment            varchar(3476)   null,
  error                   enum ('Y', 'N') null
)
  engine = MyISAM;

create index fk0
  on inducks_entry_nofulltext (issuecode);

create index fk1
  on inducks_entry_nofulltext (storyversioncode);

create index fk2
  on inducks_entry_nofulltext (languagecode);

create index fk3
  on inducks_entry_nofulltext (includedinentrycode);

create index fk4
  on inducks_entry_nofulltext (position);

create index pk0
  on inducks_entry_nofulltext (entrycode);

create table inducks_entrycharactername
(
  entrycode     varchar(22)  not null,
  charactercode varchar(49)  not null,
  charactername varchar(131) null,
  primary key (entrycode, charactercode)
);

create index fk_inducks_entrycharactername0
  on inducks_entrycharactername (charactercode);

create table inducks_entryjob
(
  entrycode       varchar(19)     not null,
  personcode      varchar(50)     not null,
  transletcol     varchar(1)      not null,
  entryjobcomment varchar(51)     null,
  doubt           enum ('Y', 'N') null,
  primary key (entrycode, personcode, transletcol)
);

create index fk_inducks_entryjob0
  on inducks_entryjob (personcode);

create table inducks_entryurl
(
  entrycode  varchar(21)     null,
  sitecode   varchar(11)     null,
  pagenumber int(7)          null,
  url        varchar(87)     null,
  storycode  varchar(39)     null,
  public     enum ('Y', 'N') null,
  id         int auto_increment
    primary key
);

create index fk_inducks_entryurl0
  on inducks_entryurl (entrycode);

create index fk_inducks_entryurl1
  on inducks_entryurl (sitecode);

create index fk_inducks_entryurl2
  on inducks_entryurl (url);

create index fk_inducks_entryurl3
  on inducks_entryurl (storycode);

create table inducks_equiv
(
  issuecode    varchar(15) not null,
  equivid      int(7)      not null,
  equivcomment varchar(3)  null,
  primary key (issuecode, equivid)
);

create index fk_inducks_equiv0
  on inducks_equiv (equivid);

create table inducks_herocharacter
(
  storycode     varchar(18)     not null,
  charactercode varchar(54)     not null,
  number        int(7)          null,
  doubt         enum ('Y', 'N') null,
  primary key (storycode, charactercode)
);

create index fk_inducks_herocharacter0
  on inducks_herocharacter (charactercode);

create table inducks_inputfile
(
  inputfilecode       int(7)          not null
    primary key,
  path                varchar(11)     null,
  filename            varchar(22)     null,
  layout              varchar(10)     null,
  locked              enum ('Y', 'N') null,
  maintenanceteamcode varchar(10)     null,
  countrycode         varchar(2)      null,
  languagecode        varchar(7)      null,
  producercode        varchar(15)     null,
  secundary           enum ('Y', 'N') null
);

create table inducks_issue
(
  issuecode           varchar(17)     not null
    primary key,
  issuerangecode      varchar(15)     null,
  publicationcode     varchar(12)     null,
  issuenumber         varchar(12)     null,
  title               varchar(158)    null,
  size                varchar(82)     null,
  pages               varchar(82)     null,
  price               varchar(160)    null,
  printrun            varchar(142)    null,
  attached            varchar(288)    null,
  oldestdate          varchar(10)     null,
  fullyindexed        enum ('Y', 'N') null,
  issuecomment        varchar(1516)   null,
  error               enum ('Y', 'N') null,
  filledoldestdate    varchar(10)     null,
  locked              enum ('Y', 'N') null,
  inxforbidden        enum ('Y', 'N') null,
  inputfilecode       int(7)          null,
  maintenanceteamcode varchar(8)      null
);

create index fk_inducks_issue0
  on inducks_issue (issuerangecode);

create index fk_inducks_issue1
  on inducks_issue (publicationcode);

create table inducks_issuecollecting
(
  collectingissuecode varchar(17) not null,
  collectedissuecode  varchar(15) not null,
  primary key (collectingissuecode, collectedissuecode)
);

create index fk_inducks_issuecollecting0
  on inducks_issuecollecting (collectedissuecode);

create table inducks_issuedate
(
  issuecode  varchar(17)     not null,
  date       varchar(10)     not null,
  kindofdate varchar(76)     null,
  doubt      enum ('Y', 'N') null,
  primary key (issuecode, date)
);

create table inducks_issuejob
(
  issuecode       varchar(17)     not null,
  personcode      varchar(48)     not null,
  inxtransletcol  varchar(1)      not null,
  issuejobcomment varchar(32)     null,
  doubt           enum ('Y', 'N') null,
  primary key (issuecode, personcode, inxtransletcol)
);

create index fk_inducks_issuejob0
  on inducks_issuejob (personcode);

create table inducks_issueprice
(
  issuecode      varchar(17) not null,
  amount         varchar(86) not null,
  currency       varchar(14) null,
  comment        varchar(64) null,
  sequencenumber int(7)      null,
  primary key (issuecode, amount)
);

create table inducks_issuequotation
(
  ID              int          null,
  publicationcode varchar(15)  null,
  issuenumber     varchar(12)  null,
  estimationmin   float(23, 0) null,
  estimationmax   float(23, 0) null,
  scrapedate      datetime     null,
  source          varchar(15)  null,
  issuecode       varchar(28)  null
);

create table inducks_issuerange
(
  issuerangecode    varchar(15)     not null
    primary key,
  publicationcode   varchar(9)      null,
  title             varchar(228)    null,
  circulation       varchar(6)      null,
  issuerangecomment varchar(468)    null,
  numbersarefake    enum ('Y', 'N') null,
  error             enum ('Y', 'N') null
);

create index fk_inducks_issuerange0
  on inducks_issuerange (publicationcode);

create table inducks_issueurl
(
  issuecode varchar(14) not null,
  sitecode  varchar(12) not null,
  url       varchar(12) null,
  primary key (issuecode, sitecode)
);

create index fk_inducks_issueurl0
  on inducks_issueurl (sitecode);

create table inducks_language
(
  languagecode        varchar(7)  not null
    primary key,
  defaultlanguagecode varchar(5)  null,
  languagename        varchar(20) null
);

create index fk_inducks_language0
  on inducks_language (defaultlanguagecode);

create table inducks_languagename
(
  desclanguagecode varchar(5)  not null,
  languagecode     varchar(7)  not null,
  languagename     varchar(57) null,
  primary key (desclanguagecode, languagecode)
);

create index fk_inducks_languagename0
  on inducks_languagename (languagecode);

create table inducks_log
(
  number              int(7)          not null
    primary key,
  logkey              varchar(53)     null,
  storycode           varchar(39)     null,
  logid               varchar(4)      null,
  logtype             varchar(1)      null,
  par1                varchar(1847)   null,
  par2                varchar(1846)   null,
  par3                varchar(285)    null,
  marked              enum ('Y', 'N') null,
  inputfilecode       int(7)          null,
  maintenanceteamcode varchar(13)     null
);

create table inducks_logdata
(
  logid    varchar(4)   not null
    primary key,
  category int(7)       null,
  logtext  varchar(108) null
);

create table inducks_logocharacter
(
  entrycode            varchar(22)     not null,
  charactercode        varchar(54)     not null,
  reallyintitle        enum ('Y', 'N') null,
  number               int(7)          null,
  logocharactercomment varchar(28)     null,
  primary key (entrycode, charactercode)
);

create index fk_inducks_logocharacter0
  on inducks_logocharacter (charactercode);

create table inducks_movie
(
  moviecode           varchar(14)     not null
    primary key,
  title               text            null,
  moviecomment        text            null,
  appsummary          text            null,
  moviejobsummary     text            null,
  locked              enum ('Y', 'N') null,
  inputfilecode       int(7)          null,
  maintenanceteamcode varchar(7)      null,
  appisxapp           enum ('Y', 'N') null,
  aka                 varchar(81)     null,
  creationdate        varchar(10)     null,
  moviedescription    text            null,
  distributor         varchar(50)     null,
  genre               varchar(3)      null,
  orderer             varchar(178)    null,
  publicationdate     varchar(10)     null,
  source              varchar(91)     null,
  tim                 varchar(6)      null
);

create fulltext index fulltext_inducks_movie
  on inducks_movie (title, moviecomment, appsummary, moviejobsummary, moviedescription);

create table inducks_moviecharacter
(
  moviecode        varchar(14)     not null,
  charactercode    varchar(36)     not null,
  istitlecharacter enum ('Y', 'N') null,
  primary key (moviecode, charactercode)
);

create index fk_inducks_moviecharacter0
  on inducks_moviecharacter (charactercode);

create table inducks_moviejob
(
  moviecode       varchar(13)     not null,
  personcode      varchar(39)     not null,
  role            varchar(15)     not null,
  moviejobcomment varchar(82)     null,
  indirect        enum ('Y', 'N') null,
  doubt           enum ('Y', 'N') null,
  primary key (moviecode, personcode, role)
);

create index fk_inducks_moviejob0
  on inducks_moviejob (personcode);

create table inducks_moviereference
(
  storycode         varchar(17)     not null,
  moviecode         varchar(14)     not null,
  referencereasonid int(7)          null,
  frommovietostory  enum ('Y', 'N') null,
  primary key (storycode, moviecode)
);

create index fk_inducks_moviereference0
  on inducks_moviereference (moviecode);

create index fk_inducks_moviereference1
  on inducks_moviereference (referencereasonid);

create table inducks_person
(
  personcode             varchar(79)     not null
    primary key,
  nationalitycountrycode varchar(2)      null,
  fullname               varchar(79)     null,
  official               enum ('Y', 'N') null,
  personcomment          varchar(221)    null,
  unknownstudiomember    enum ('Y', 'N') null,
  isfake                 enum ('Y', 'N') null,
  numberofindexedissues  int(7)          null,
  birthname              text            null,
  borndate               varchar(10)     null,
  bornplace              varchar(30)     null,
  deceaseddate           varchar(10)     null,
  deceasedplace          varchar(31)     null,
  education              varchar(189)    null,
  moviestext             varchar(879)    null,
  comicstext             varchar(927)    null,
  othertext              varchar(307)    null,
  photofilename          varchar(32)     null,
  photocomment           varchar(68)     null,
  photosource            varchar(67)     null,
  personrefs             varchar(179)    null
);

create index fk_inducks_person0
  on inducks_person (nationalitycountrycode);

create fulltext index fulltext_inducks_person
  on inducks_person (fullname, birthname);

create table inducks_personalias
(
  personcode varchar(31)     null,
  surname    varchar(48)     null,
  givenname  varchar(31)     null,
  official   enum ('Y', 'N') null
);

create index fk_inducks_personalias0
  on inducks_personalias (personcode);

create table inducks_personurl
(
  personcode varchar(24) not null,
  sitecode   varchar(15) not null,
  url        varchar(31) null,
  primary key (personcode, sitecode)
);

create index fk_inducks_personurl0
  on inducks_personurl (sitecode);

create table inducks_publication
(
  publicationcode     varchar(12)     not null
    primary key,
  countrycode         varchar(2)      null,
  languagecode        varchar(7)      null,
  title               text            null,
  size                varchar(82)     null,
  publicationcomment  varchar(1354)   null,
  circulation         varchar(4)      null,
  numbersarefake      enum ('Y', 'N') null,
  error               enum ('Y', 'N') null,
  locked              enum ('Y', 'N') null,
  inxforbidden        enum ('Y', 'N') null,
  inputfilecode       int(7)          null,
  maintenanceteamcode varchar(9)      null
);

create index fk_inducks_publication0
  on inducks_publication (countrycode);

create index fk_inducks_publication1
  on inducks_publication (languagecode);

create fulltext index fulltext_inducks_publication
  on inducks_publication (title);

create table inducks_publicationcategory
(
  publicationcode varchar(12) not null
    primary key,
  category        varchar(61) null
);

create table inducks_publicationname
(
  publicationcode varchar(9)  not null
    primary key,
  publicationname varchar(62) null
);

create table inducks_publicationurl
(
  publicationcode varchar(10)  not null,
  sitecode        varchar(16)  not null,
  url             varchar(236) null,
  primary key (publicationcode, sitecode)
);

create index fk_inducks_publicationurl0
  on inducks_publicationurl (sitecode);

create table inducks_publisher
(
  publisherid   varchar(94) not null
    primary key,
  publishername text        null
);

create fulltext index fulltext_inducks_publisher
  on inducks_publisher (publishername);

create table inducks_publishingjob
(
  publisherid          varchar(94) not null,
  issuecode            varchar(17) not null,
  publishingjobcomment varchar(67) null,
  primary key (publisherid, issuecode)
);

create index fk_inducks_publishingjob0
  on inducks_publishingjob (issuecode);

create table inducks_referencereason
(
  referencereasonid   int(7)       not null
    primary key,
  referencereasontext varchar(129) null
);

create table inducks_referencereasonname
(
  referencereasonid          int(7)      not null,
  languagecode               varchar(2)  not null,
  referencereasontranslation varchar(28) null,
  primary key (referencereasonid, languagecode)
);

create index fk_inducks_referencereasonname0
  on inducks_referencereasonname (languagecode);

create table inducks_site
(
  sitecode   varchar(16)     not null
    primary key,
  urlbase    varchar(51)     null,
  images     enum ('Y', 'N') null,
  sitename   varchar(85)     null,
  sitelogo   varchar(107)    null,
  properties varchar(1)      null
);

create table inducks_statcharactercharacter
(
  charactercode   varchar(58)  not null,
  cocharactercode varchar(58)  null,
  total           int(7)       not null,
  yearrange       varchar(152) null,
  primary key (charactercode, total)
);

create table inducks_statcharactercountry
(
  charactercode varchar(58) not null,
  countrycode   varchar(2)  not null,
  total         int(7)      null,
  primary key (charactercode, countrycode)
);

create table inducks_statcharacterstory
(
  charactercode   varchar(58)  not null,
  storyheadercode varchar(3)   not null,
  total           int(7)       null,
  yearrange       varchar(118) null,
  primary key (charactercode, storyheadercode)
);

create table inducks_statpersoncharacter
(
  personcode    varchar(79)  not null,
  charactercode varchar(58)  null,
  total         int(7)       not null,
  yearrange     varchar(113) null,
  primary key (personcode, total)
);

create table inducks_statpersoncountry
(
  personcode  varchar(79) not null,
  countrycode varchar(2)  not null,
  total       int(7)      null,
  primary key (personcode, countrycode)
);

create table inducks_statpersonperson
(
  personcode   varchar(79) not null,
  copersoncode varchar(79) null,
  total        int(7)      not null,
  yearrange    varchar(59) null,
  primary key (personcode, total)
);

create table inducks_statpersonstory
(
  personcode      varchar(79) not null,
  storyheadercode varchar(3)  not null,
  total           int(7)      null,
  yearrange       varchar(62) null,
  primary key (personcode, storyheadercode)
);

create table inducks_story
(
  storycode                varchar(19)     not null
    primary key,
  originalstoryversioncode varchar(19)     null,
  creationdate             varchar(11)     null,
  firstpublicationdate     varchar(10)     null,
  endpublicationdate       varchar(10)     null,
  title                    text            null,
  usedifferentcode         varchar(20)     null,
  storycomment             varchar(664)    null,
  error                    enum ('Y', 'N') null,
  repcountrysummary        text            null,
  storyparts               int(7)          null,
  locked                   enum ('Y', 'N') null,
  inputfilecode            int(7)          null,
  issuecodeofstoryitem     varchar(14)     null,
  maintenanceteamcode      varchar(10)     null,
  storyheadercode          varchar(3)      null
);

create index fk_inducks_story0
  on inducks_story (originalstoryversioncode);

create index fk_inducks_story1
  on inducks_story (firstpublicationdate);

create fulltext index fulltext_inducks_story
  on inducks_story (title, repcountrysummary);

create table inducks_storycodes
(
  storycode       varchar(19) not null,
  alternativecode varchar(72) not null,
  unpackedcode    varchar(82) null,
  codecomment     varchar(34) null,
  primary key (storycode, alternativecode)
);

create index fk_inducks_storycodes0
  on inducks_storycodes (alternativecode);

create table inducks_storydescription
(
  storyversioncode varchar(19)   not null,
  languagecode     varchar(7)    not null,
  desctext         varchar(2814) null,
  primary key (storyversioncode, languagecode)
);

create index fk_inducks_storydescription0
  on inducks_storydescription (languagecode);

create table inducks_storyheader
(
  storyheadercode    varchar(12)  not null,
  level              varchar(1)   not null,
  title              varchar(195) null,
  storyheadercomment varchar(544) null,
  countrycode        varchar(2)   null,
  primary key (storyheadercode, level)
);

create table inducks_storyjob
(
  storyversioncode varchar(19)     not null,
  personcode       varchar(79)     not null,
  plotwritartink   varchar(1)      not null,
  storyjobcomment  varchar(141)    null,
  indirect         enum ('Y', 'N') null,
  doubt            enum ('Y', 'N') null,
  primary key (storyversioncode, personcode, plotwritartink)
);

create index fk_inducks_storyjob0
  on inducks_storyjob (personcode);

create table inducks_storyreference
(
  fromstorycode     varchar(18) not null,
  tostorycode       varchar(17) not null,
  referencereasonid int(7)      null,
  primary key (fromstorycode, tostorycode)
);

create index fk_inducks_storyreference0
  on inducks_storyreference (tostorycode);

create index fk_inducks_storyreference1
  on inducks_storyreference (referencereasonid);

create table inducks_storysubseries
(
  storycode             varchar(18)  not null,
  subseriescode         varchar(144) not null,
  storysubseriescomment varchar(29)  null,
  primary key (storycode, subseriescode)
);

create index fk_inducks_storysubseries0
  on inducks_storysubseries (subseriescode);

create table inducks_storyurl
(
  storycode varchar(13) not null,
  sitecode  varchar(15) not null,
  url       varchar(43) null,
  primary key (storycode, sitecode)
);

create index fk_inducks_storyurl0
  on inducks_storyurl (sitecode);

create table inducks_storyversion
(
  storyversioncode      varchar(19)     not null
    primary key,
  storycode             varchar(19)     null,
  entirepages           int(7)          null,
  brokenpagenumerator   int(7)          null,
  brokenpagedenominator int(7)          null,
  brokenpageunspecified enum ('Y', 'N') null,
  kind                  varchar(1)      null,
  rowsperpage           int(7)          null,
  columnsperpage        int(7)          null,
  appisxapp             enum ('Y', 'N') null,
  what                  varchar(1)      null,
  appsummary            text            null,
  plotsummary           text            null,
  writsummary           text            null,
  artsummary            text            null,
  inksummary            text            null,
  creatorrefsummary     text            null,
  keywordsummary        text            null,
  estimatedpanels       int(7)          null
);

create index fk_inducks_storyversion1
  on inducks_storyversion (storycode);

create fulltext index fulltext_inducks_storyversion
  on inducks_storyversion (appsummary, plotsummary, writsummary, artsummary, inksummary, creatorrefsummary,
                           keywordsummary);

create table inducks_storyversion_nofulltext
(
  storyversioncode      varchar(19)     null,
  storycode             varchar(19)     null,
  entirepages           int(7)          null,
  brokenpagenumerator   int(7)          null,
  brokenpagedenominator int(7)          null,
  brokenpageunspecified enum ('Y', 'N') null,
  kind                  varchar(1)      null,
  rowsperpage           int(7)          null,
  columnsperpage        int(7)          null,
  appisxapp             enum ('Y', 'N') null,
  what                  varchar(1)      null,
  appsummary            text            null,
  plotsummary           text            null,
  writsummary           text            null,
  artsummary            text            null,
  inksummary            text            null,
  creatorrefsummary     text            null,
  keywordsummary        text            null,
  estimatedpanels       int(7)          null
)
  engine = MyISAM;

create index fk1
  on inducks_storyversion_nofulltext (storycode);

create index pk0
  on inducks_storyversion_nofulltext (storyversioncode);

create table inducks_studio
(
  studiocode    varchar(23)  not null
    primary key,
  countrycode   varchar(2)   null,
  studioname    varchar(24)  null,
  city          varchar(12)  null,
  description   varchar(415) null,
  othertext     varchar(94)  null,
  photofilename varchar(18)  null,
  photocomment  varchar(40)  null,
  photosource   varchar(42)  null,
  studiorefs    varchar(204) null
);

create index fk_inducks_studio0
  on inducks_studio (countrycode);

create table inducks_studiowork
(
  studiocode varchar(23) not null,
  personcode varchar(24) not null,
  primary key (studiocode, personcode)
);

create index fk_inducks_studiowork0
  on inducks_studiowork (personcode);

create table inducks_subseries
(
  subseriescode     varchar(50)     not null
    primary key,
  subseriesname     varchar(54)     null,
  official          enum ('Y', 'N') null,
  subseriescomment  varchar(285)    null,
  subseriescategory varchar(46)     null
);

create table inducks_subseriesname
(
  subseriescode        varchar(44)     not null,
  languagecode         varchar(7)      not null,
  subseriesname        varchar(294)    null,
  preferred            enum ('Y', 'N') null,
  subseriesnamecomment varchar(28)     null,
  primary key (subseriescode, languagecode)
);

create index fk_inducks_subseriesname0
  on inducks_subseriesname (languagecode);

create table inducks_substory
(
  storycode                varchar(12)     not null
    primary key,
  originalstoryversioncode varchar(12)     null,
  superstorycode           varchar(13)     null,
  part                     varchar(3)      null,
  firstpublicationdate     varchar(10)     null,
  title                    varchar(101)    null,
  substorycomment          varchar(607)    null,
  error                    enum ('Y', 'N') null,
  locked                   enum ('Y', 'N') null,
  inputfilecode            int(7)          null,
  maintenanceteamcode      varchar(8)      null
);

create index fk_inducks_substory0
  on inducks_substory (firstpublicationdate);

create table inducks_team
(
  teamcode            varchar(13) not null
    primary key,
  teamdescriptionname varchar(25) null,
  teamshortname       varchar(7)  null
);

create table inducks_teammember
(
  teamcode   varchar(13) not null
    primary key,
  personcode varchar(3)  null
);

create table inducks_ucrelation
(
  universecode  varchar(28) not null,
  charactercode varchar(45) not null,
  primary key (universecode, charactercode)
);

create index fk_inducks_ucrelation0
  on inducks_ucrelation (charactercode);

create table inducks_universe
(
  universecode    varchar(28) not null
    primary key,
  universecomment varchar(1)  null
);

create table inducks_universename
(
  universecode varchar(28) not null,
  languagecode varchar(5)  not null,
  universename varchar(76) null,
  primary key (universecode, languagecode)
);

create index fk_inducks_universename0
  on inducks_universename (languagecode);

create table numeros_cpt
(
  Pays            varchar(6)  not null,
  Magazine        varchar(8)  not null,
  publicationcode varchar(15) not null,
  Numero          varchar(8)  not null,
  Cpt             int         null,
  primary key (publicationcode, Numero)
);

create index numeros_cpt_Pays_Magazine_uindex
  on numeros_cpt (publicationcode);

CREATE DATABASE IF NOT EXISTS cover_info;
USE cover_info;

create table cover_imports
(
  coverid      int auto_increment
    primary key,
  imported     datetime     null,
  import_error varchar(200) null,
  constraint uniquefieldset_cover_imports
    unique (coverid, imported, import_error)
)
  charset = utf8;

create table covers
(
  ID        int auto_increment
    primary key,
  issuecode varchar(17) not null,
  sitecode  varchar(11) not null,
  url       varchar(98) not null,
  constraint uniquefieldset_covers
    unique (issuecode, url)
)
  engine = MyISAM
  charset = utf8;

CREATE DATABASE IF NOT EXISTS dm;
USE dm;

create table abonnements_sorties
(
  Pays            varchar(3)           not null,
  Magazine        varchar(6)           not null,
  Numero          varchar(8)           not null,
  Date_sortie     date                 not null,
  Numeros_ajoutes tinyint(1) default 0 not null,
  primary key (Pays, Magazine, Numero)
);

create table achats
(
  ID_Acquisition int auto_increment
    primary key,
  ID_User        int          not null,
  Date           date         not null,
  Description    varchar(100) not null,
  constraint user_date_description_unique
    unique (ID_User, Date, Description)
)
  engine = MyISAM;

create table auteurs_pseudos
(
  ID              int auto_increment
    primary key,
  NomAuteurAbrege varchar(79) charset latin1 not null,
  ID_user         int                        not null,
  Notation        int(4) default -1          not null,
  constraint auteurs_pseudos_uindex
    unique (ID_user, NomAuteurAbrege)
)
  engine = MyISAM
  collate = utf8_bin;

create table bibliotheque_contributeurs
(
  ID    int auto_increment
    primary key,
  Nom   varchar(30) null,
  Texte text        null
)
  engine = MyISAM
  collate = latin1_german2_ci;

create table bibliotheque_ordre_magazines
(
  ID              int auto_increment
    primary key,
  ID_Utilisateur  int         not null,
  publicationcode varchar(12) not null,
  Ordre           int(3)      not null,
  constraint bibliotheque_ordre_magazines_uindex
    unique (ID_Utilisateur, publicationcode)
)
  engine = MyISAM
  collate = latin1_german2_ci;

create table bouquineries
(
  ID              int auto_increment
    primary key,
  Nom             varchar(25) charset latin1 not null,
  AdresseComplete text                       not null,
  CoordX          double                     not null,
  CoordY          double                     not null
)
  charset = utf8;

create table demo
(
  ID              int default 1 not null
    primary key,
  DateDernierInit datetime      not null
)
  engine = MyISAM
  collate = latin1_german2_ci;

create table magazines
(
  PaysAbrege     varchar(4) charset latin1 not null,
  NomAbrege      varchar(7) charset latin1 not null,
  NomComplet     varchar(70)               not null,
  RedirigeDepuis varchar(7)                not null,
  NeParaitPlus   tinyint(1)                null,
  primary key (PaysAbrege, NomAbrege, RedirigeDepuis)
)
  engine = MyISAM
  collate = utf8_bin;

create table numeros
(
  ID             int auto_increment
    primary key,
  Pays           varchar(3)                                                               not null,
  Magazine       varchar(10)                                                              not null,
  Numero         varchar(12) collate utf8_bin                                             not null,
  Numero_nospace varchar(12) as (replace(`Numero`, ' ', '')),
  Etat           enum ('mauvais', 'moyen', 'bon', 'indefini') default 'indefini'          not null,
  ID_Acquisition int                                          default -1                  not null,
  AV             tinyint(1)                                                               not null,
  Abonnement     tinyint                                      default 0                   not null,
  ID_Utilisateur int                                                                      not null,
  DateAjout      timestamp                                    default current_timestamp() not null,
  issuecode      varchar(23) as (concat(`Pays`, '/', `Magazine`, ' ', `Numero`))
)
  engine = MyISAM
  collate = latin1_german2_ci;

create index Numero_Utilisateur
  on numeros (Pays, Magazine, Numero, ID_Utilisateur);

create index Numero_nospace_Utilisateur
  on numeros (Pays, Magazine, Numero_nospace, ID_Utilisateur);

create index Pays_Magazine_Numero
  on numeros (Pays, Magazine, Numero);

create index Pays_Magazine_Numero_DateAjout
  on numeros (DateAjout, Pays, Magazine, Numero);

create index Utilisateur
  on numeros (ID_Utilisateur);

create index numeros_issuecode_index
  on numeros (issuecode);

create table numeros_popularite
(
  Pays       varchar(3)  not null,
  Magazine   varchar(6)  not null,
  Numero     varchar(12) not null,
  Popularite int         not null,
  ID         int auto_increment
    primary key,
  constraint numeros_popularite_unique
    unique (Pays, Magazine, Numero)
)
  engine = MyISAM
  charset = utf8;

create table tranches_doublons
(
  ID               int auto_increment
    primary key,
  Pays             varchar(3)  not null,
  Magazine         varchar(6)  not null,
  Numero           varchar(12) not null,
  NumeroReference  varchar(12) not null,
  TrancheReference int         null,
  constraint tranches_doublons_Pays_Magazine_Numero_uindex
    unique (Pays, Magazine, Numero)
)
  engine = MyISAM
  collate = latin1_german2_ci;

create index tranches_doublons_tranches_pretes_ID_fk
  on tranches_doublons (TrancheReference);

create table tranches_pretes
(
  ID              int auto_increment
    primary key,
  publicationcode varchar(12)                           not null,
  issuenumber     varchar(12)                           not null,
  dateajout       timestamp default current_timestamp() not null,
  points          int                                   null,
  slug            varchar(30) as (concat('edges-', replace(`publicationcode`, '/', '-'), '-', `issuenumber`)),
  issuecode       varchar(23) as (concat(`publicationcode`, ' ', `issuenumber`)),
  constraint tranches_pretes_issuecode_uindex
    unique (issuecode),
  constraint tranchespretes_unique
    unique (publicationcode, issuenumber)
)
  collate = latin1_german2_ci;

create index tranches_pretes_dateajout_index
  on tranches_pretes (dateajout);

create table tranches_pretes_contributeurs
(
  publicationcode varchar(15)                                         not null,
  issuenumber     varchar(30)                                         not null,
  contributeur    int                                                 not null,
  contribution    enum ('photographe', 'createur') default 'createur' not null,
  primary key (publicationcode, issuenumber, contributeur, contribution)
)
  engine = MyISAM
  charset = utf8;

create index tranches_pretes_contributeurs_contributeur_index
  on tranches_pretes_contributeurs (contributeur);

create index tranches_pretes_contributeurs_publicationcode_issuenumber_index
  on tranches_pretes_contributeurs (publicationcode, issuenumber);

create table tranches_pretes_contributions
(
  ID           int auto_increment
    primary key,
  ID_tranche   int                                   not null,
  ID_user      int                                   not null,
  dateajout    timestamp default current_timestamp() not null on update current_timestamp(),
  contribution enum ('photographe', 'createur')      not null,
  points_new   int                                   not null,
  points_total int                                   not null
);

create index tranches_pretes_contributions_ID_user_contribution_index
  on tranches_pretes_contributions (ID_user, contribution);

create table tranches_pretes_sprites
(
  ID          int auto_increment
    primary key,
  ID_Tranche  int         not null,
  Sprite_name varchar(25) not null,
  Sprite_size int         null,
  constraint tranches_pretes_sprites_unique
    unique (ID_Tranche, Sprite_name)
)
  engine = MyISAM;

create table tranches_pretes_sprites_size
(
  ID          int auto_increment
    primary key,
  sprite_name varchar(25) null,
  size        int         null
);

create table tranches_pretes_sprites_urls
(
  ID          int auto_increment
    primary key,
  Sprite_name varchar(25) not null,
  Version     varchar(12) not null,
  constraint tranches_pretes_sprites_urls_unique
    unique (Sprite_name, Version)
);

create table users
(
  ID                           int auto_increment
    primary key,
  username                     varchar(25) collate utf8_bin                           not null,
  password                     varchar(40) charset latin1                             not null,
  AccepterPartage              tinyint(1)                 default 1                   not null,
  DateInscription              date                                                   not null,
  EMail                        varchar(50) charset latin1                             not null,
  RecommandationsListeMags     tinyint(1)                 default 1                   not null,
  BetaUser                     tinyint(1)                 default 0                   not null,
  AfficherVideo                tinyint(1)                 default 1                   not null,
  Bibliotheque_AfficherDoubles tinyint                    default 1                   null,
  Bibliotheque_Texture1        varchar(20) charset latin1 default 'bois'              not null,
  Bibliotheque_Sous_Texture1   varchar(50) charset latin1 default 'HONDURAS MAHOGANY' not null,
  Bibliotheque_Texture2        varchar(20) charset latin1 default 'bois'              not null,
  Bibliotheque_Sous_Texture2   varchar(50) charset latin1 default 'KNOTTY PINE'       not null,
  TextePresentation            varchar(100)                                           null,
  DernierAcces                 datetime                                               null,
  PrecedentAcces               datetime                                               null,
  constraint username
    unique (username)
)
  collate = latin1_german2_ci;

create table abonnements
(
  ID             int auto_increment
    primary key,
  ID_Utilisateur int        not null,
  Pays           varchar(3) not null,
  Magazine       varchar(6) not null,
  Date_debut     date       not null,
  Date_fin       date       not null,
  constraint abonnements_unique
    unique (Pays, Magazine, ID_Utilisateur, Date_debut, Date_fin),
  constraint abonnements_users_ID_fk
    foreign key (ID_Utilisateur) references users (ID)
      on update cascade on delete cascade
);

create table bouquineries_commentaires
(
  ID             int auto_increment
    primary key,
  ID_Utilisateur int                                    null,
  Commentaire    text collate utf8mb4_unicode_ci        not null,
  DateAjout      timestamp  default current_timestamp() not null,
  Actif          tinyint(1) default 0                   not null,
  ID_Bouquinerie int                                    not null,
  constraint bouquineries_commentaires_bouquineries_ID_fk
    foreign key (ID_Bouquinerie) references bouquineries (ID),
  constraint bouquineries_commentaires_users_ID_fk
    foreign key (ID_Utilisateur) references users (ID)
)
  charset = utf8;

create table users_contributions
(
  ID                   int auto_increment
    primary key,
  ID_user              int                                     not null,
  date                 datetime default current_timestamp()    not null,
  contribution         varchar(255) collate utf8mb4_unicode_ci not null,
  points_new           int                                     not null,
  points_total         int                                     not null,
  emails_sent          tinyint(1)                              not null,
  ID_tranche           int                                     null,
  ID_bookstore         int                                     null,
  ID_bookstore_comment int                                     null,
  constraint FK_7FDC16F375567043
    foreign key (ID_tranche) references tranches_pretes (ID),
  constraint FK_7FDC16F3A5778B6C
    foreign key (ID_bookstore) references bouquineries (ID),
  constraint users_contributions___fk_user
    foreign key (ID_user) references users (ID),
  constraint users_contributions_bouquineries_commentaires_ID_fk
    foreign key (ID_bookstore_comment) references bouquineries_commentaires (ID)
)
  collate = latin1_german2_ci;

create index IDX_7FDC16F375567043
  on users_contributions (ID_tranche);

create index IDX_7FDC16F3A5778B6C
  on users_contributions (ID_bookstore);

create index users_contributions__user_contribution
  on users_contributions (ID_user, contribution);

create table users_options
(
  ID            int auto_increment
    primary key,
  ID_User       int                                                                         not null,
  Option_nom    enum ('suggestion_notification_country', 'sales_notification_publications') not null,
  Option_valeur varchar(50)                                                                 not null,
  constraint users_options__unique
    unique (ID_User, Option_nom, Option_valeur),
  constraint users_options_users_ID_fk
    foreign key (ID_User) references users (ID)
)
  collate = latin1_german2_ci;

create index users_options__user_option
  on users_options (ID_User, Option_nom);

create table users_password_tokens
(
  ID      int auto_increment
    primary key,
  ID_User int         not null,
  Token   varchar(16) not null,
  constraint users_password_tokens_unique
    unique (ID_User, Token)
)
  collate = utf8_unicode_ci;

create table users_permissions
(
  ID        int auto_increment
    primary key,
  username  varchar(25)                            not null,
  role      varchar(20)                            not null,
  privilege enum ('Admin', 'Edition', 'Affichage') not null,
  constraint permission_username_role
    unique (username, role, privilege)
)
  engine = MyISAM
  collate = latin1_german2_ci;

create table users_points
(
  ID               int auto_increment
    primary key,
  ID_Utilisateur   int                                            not null,
  TypeContribution enum ('photographe', 'createur', 'duckhunter') not null,
  NbPoints         int default 0                                  null
);

create table users_suggestions_notifications
(
  ID        int auto_increment
    primary key,
  ID_User   int(10)                              not null,
  issuecode varchar(12)                          not null,
  text      text                                 null,
  date      datetime default current_timestamp() null,
  constraint users_notifications__index_user_issue
    unique (ID_User, issuecode)
);

CREATE DATABASE IF NOT EXISTS dm_stats;
USE dm_stats;

create table auteurs_histoires
(
  ID         int auto_increment
    primary key,
  personcode varchar(22) not null,
  storycode  varchar(19) not null,
  constraint unique_index
    unique (personcode, storycode)
);

create index index_storycode
  on auteurs_histoires (storycode);

create table auteurs_pseudos
(
  ID_User         int         not null,
  NomAuteurAbrege varchar(79) not null,
  Notation        tinyint     null,
  primary key (ID_User, NomAuteurAbrege)
);

create table histoires_publications
(
  ID              int auto_increment
    primary key,
  storycode       varchar(19) not null,
  publicationcode varchar(12) not null,
  issuenumber     varchar(12) not null,
  oldestdate      date        null,
  constraint unique_index
    unique (publicationcode, issuenumber, storycode)
);

create index index_issue
  on histoires_publications (publicationcode, issuenumber);

create index index_oldestdate
  on histoires_publications (oldestdate);

create index index_story
  on histoires_publications (storycode);

create table numeros_simple
(
  ID_Utilisateur  int         not null,
  Publicationcode varchar(12) not null,
  Numero          varchar(12) not null,
  primary key (ID_Utilisateur, Publicationcode, Numero),
  constraint numeros_simple_auteurs_pseudos_ID_User_fk
    foreign key (ID_Utilisateur) references auteurs_pseudos (ID_User)
);

create index ID_Utilisateur
  on numeros_simple (ID_Utilisateur);

create index user_issue
  on numeros_simple (Publicationcode, Numero);

create table utilisateurs_histoires_manquantes
(
  ID         int auto_increment
    primary key,
  ID_User    int         not null,
  personcode varchar(22) not null,
  storycode  varchar(19) not null,
  constraint missing_issue_for_user
    unique (ID_User, personcode, storycode)
);

create table utilisateurs_publications_manquantes
(
  ID              int auto_increment
    primary key,
  ID_User         int              not null,
  personcode      varchar(22)      not null,
  storycode       varchar(19)      not null,
  publicationcode varchar(12)      not null,
  issuenumber     varchar(12)      not null,
  oldestdate      date             null,
  Notation        tinyint unsigned not null,
  constraint unique_index
    unique (ID_User, personcode, storycode, publicationcode, issuenumber)
);

create index missing_user_issue
  on utilisateurs_publications_manquantes (ID_User, publicationcode, issuenumber);

create index suggested
  on utilisateurs_publications_manquantes (ID_User, publicationcode, issuenumber, oldestdate);

create index user_stories
  on utilisateurs_publications_manquantes (ID_User, personcode, storycode);

CREATE DATABASE IF NOT EXISTS edgecreator;
USE edgecreator;

create table edgecreator_intervalles
(
  ID           int auto_increment
    primary key,
  ID_Valeur    int(10)     not null,
  Numero_debut varchar(10) not null,
  Numero_fin   varchar(10) not null,
  username     varchar(25) not null
)
  engine = MyISAM
  collate = latin1_german2_ci;

create index index_intervalles
  on edgecreator_intervalles (ID_Valeur, Numero_debut, Numero_fin, username);

create table edgecreator_modeles2
(
  ID           int auto_increment
    primary key,
  Pays         varchar(3)  not null,
  Magazine     varchar(6)  not null,
  Ordre        int         not null,
  Nom_fonction varchar(30) not null,
  Option_nom   varchar(20) null
)
  engine = MyISAM
  collate = latin1_german2_ci;

create table edgecreator_valeurs
(
  ID            int(10) auto_increment
    primary key,
  ID_Option     int(10)      null,
  Option_valeur varchar(200) null
)
  engine = MyISAM
  collate = latin1_german2_ci;

create table images_myfonts
(
  ID         int auto_increment
    primary key,
  Font       varchar(150) null,
  Color      varchar(10)  null,
  ColorBG    varchar(10)  null,
  Width      varchar(7)   null,
  Texte      varchar(150) null,
  Precision_ varchar(5)   null
)
  collate = utf8_unicode_ci;

create table images_tranches
(
  ID             int auto_increment
    primary key,
  ID_Utilisateur int          null,
  Hash           varchar(40)  null,
  DateHeure      datetime     null,
  NomFichier     varchar(255) not null,
  constraint images_tranches_Hash_uindex
    unique (Hash)
)
  collate = utf8_unicode_ci;

create table tranches_en_cours_modeles
(
  ID                 int auto_increment
    primary key,
  Pays               varchar(3)  not null,
  Magazine           varchar(6)  not null,
  Numero             varchar(10) not null,
  username           varchar(25) null,
  NomPhotoPrincipale varchar(60) null,
  photographes       text        null,
  createurs          text        null,
  Active             tinyint(1)  not null,
  constraint tranches_en_cours_modeles__numero
    unique (Pays, Magazine, Numero, username)
)
  collate = utf8_unicode_ci;

