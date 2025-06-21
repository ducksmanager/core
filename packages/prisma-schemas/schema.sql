create table inducks_appearance
(
    storyversioncode  varchar(20)     not null,
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
    fromcharactercode   varchar(36)     not null,
    tocharactercode     varchar(36)     not null,
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
    entrycode               varchar(37)     not null
        primary key,
    issuecode               varchar(19)     null,
    storyversioncode        varchar(37)     null,
    languagecode            varchar(7)      null,
    includedinentrycode     varchar(36)     null,
    position                varchar(25)     null,
    printedcode             varchar(88)     null,
    guessedcode             varchar(39)     null,
    title                   varchar(284)    null,
    reallytitle             enum ('Y', 'N') null,
    printedhero             varchar(96)     null,
    changes                 varchar(628)    null,
    cut                     varchar(295)    null,
    minorchanges            varchar(558)    null,
    missingpanels           varchar(2)      null,
    mirrored                enum ('Y', 'N') null,
    sideways                enum ('Y', 'N') null,
    startdate               varchar(10)     null,
    enddate                 varchar(10)     null,
    identificationuncertain enum ('Y', 'N') null,
    alsoreprint             varchar(336)    null,
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
    entrycode       varchar(20)     not null,
    personcode      varchar(50)     not null,
    transletcol     varchar(1)      not null,
    entryjobcomment varchar(85)     null,
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
    url        varchar(46)     null,
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
    issuecode           varchar(19)     not null
        primary key,
    issuerangecode      varchar(15)     null,
    publicationcode     varchar(12)     null,
    issuenumber         varchar(13)     null,
    title               varchar(158)    null,
    size                varchar(82)     null,
    pages               varchar(94)     null,
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
    issuecode  varchar(19)     not null,
    date       varchar(10)     not null,
    kindofdate varchar(76)     null,
    doubt      enum ('Y', 'N') null,
    primary key (issuecode, date)
);

create table inducks_issuejob
(
    issuecode       varchar(19)     not null,
    personcode      varchar(48)     not null,
    inxtransletcol  varchar(1)      not null,
    issuejobcomment varchar(48)     null,
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
    comment        varchar(75) null,
    sequencenumber int(7)      null,
    primary key (issuecode, amount)
);

create table inducks_issuequotation
(
    ID              int auto_increment
        primary key,
    publicationcode varchar(15) not null,
    issuenumber     varchar(12) not null,
    estimationmin   float       null,
    estimationmax   float       null,
    scrapedate      datetime    null,
    source          varchar(15) not null,
    issuecode       varchar(28) as (concat(`publicationcode`, ' ', `issuenumber`)),
    issuecode varchar(28) as (concat(`publicationcode`, ' ', `issuenumber`)),
    constraint inducks_issuequotation__uindex_issuecode
        unique (issuecode),
    constraint inducks_issuequotation__uindex_issuecode
        unique (issuecode)
);

create index inducks_issuequotation__index_publication
    on inducks_issuequotation (publicationcode);

create table inducks_issuerange
(
    issuerangecode    varchar(15)     not null
        primary key,
    publicationcode   varchar(9)      null,
    title             varchar(186)    null,
    circulation       varchar(6)      null,
    issuerangecomment varchar(463)    null,
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
    par3                varchar(381)    null,
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
    entrycode            varchar(36)     not null,
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
    charactercode    varchar(38)     not null,
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
    publicationcomment  varchar(1449)   null,
    circulation         varchar(15)     null,
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
    yearrange       varchar(108) null,
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
    storycomment             varchar(903)    null,
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
    codecomment     varchar(45) null,
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
    title              varchar(96)  null,
    storyheadercomment varchar(582) null,
    countrycode        varchar(2)   null,
    primary key (storyheadercode, level)
);

create table inducks_storyjob
(
    storyversioncode varchar(20)     not null,
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
    storysubseriescomment varchar(33)  null,
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
    storyversioncode      varchar(37)     not null
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
    subseriescode     varchar(57)     not null
        primary key,
    subseriesname     varchar(57)     null,
    official          enum ('Y', 'N') null,
    subseriescomment  varchar(410)    null,
    subseriescategory varchar(46)     null
);

create table inducks_subseriesname
(
    subseriescode        varchar(54)     not null,
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
    storycode                varchar(13)     not null
        primary key,
    originalstoryversioncode varchar(13)     null,
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

create definer = root@`%` view duckguessr_published_fr_recent_artists as
select distinct `duckguessr_published_fr_recent_game`.`personcode` AS `personcode`
from `coa`.`duckguessr_published_fr_recent_game`;

create definer = root@`%` view duckguessr_published_fr_recent_game as
select distinct `storyjob`.`personcode`      AS `personcode`,
                `entryurl`.`sitecode`        AS `sitecode`,
                `entryurl`.`url`             AS `url`,
                `entryurl_ids`.`entryurl_id` AS `entryurl_id`
from ((((((`coa`.`duckguessr_published_fr_recent_game_all` `entryurl_ids` join `coa`.`inducks_entryurl` `entryurl`
           on (`entryurl_ids`.`entryurl_id` = `entryurl`.`id`)) join `coa`.`inducks_entry` `entry`
          on (`entryurl`.`entrycode` = `entry`.`entrycode`)) join `coa`.`inducks_storyversion` `storyversion`
         on (`entry`.`storyversioncode` = `storyversion`.`storyversioncode`)) join `coa`.`inducks_story` `story`
        on (`storyversion`.`storycode` = `story`.`storycode`)) join `coa`.`inducks_storyjob` `storyjob`
       on (`entry`.`storyversioncode` = `storyjob`.`storyversioncode`)) join (select `artist_with_2000s_entries`.`personcode` AS `personcode`,
                                                                                     `person`.`nationalitycountrycode`        AS `nationalitycountrycode`,
                                                                                     `person`.`fullname`                      AS `fullname`
                                                                              from (`coa`.`duckguessr_published_fr_recent_game_all` `artist_with_2000s_entries` join `coa`.`inducks_person` `person`
                                                                                    on (`artist_with_2000s_entries`.`personcode` = `person`.`personcode`))
                                                                              group by `artist_with_2000s_entries`.`personcode`
                                                                              having count(0) >= 20) `artist_with_at_least_20_entries`
      on (`artist_with_at_least_20_entries`.`personcode` = `storyjob`.`personcode`));

create definer = root@`%` view duckguessr_published_fr_recent_game_all as
select distinct `entryurl`.`id` AS `entryurl_id`, `storyjob`.`personcode` AS `personcode`
from ((((`coa`.`inducks_issue` `issue` join `coa`.`inducks_entry` `entry`
         on (`issue`.`issuecode` = `entry`.`issuecode`)) join `coa`.`inducks_entryurl` `entryurl`
        on (`entry`.`entrycode` = `entryurl`.`entrycode`)) join `coa`.`inducks_storyversion` `storyversion`
       on (`entry`.`storyversioncode` = `storyversion`.`storyversioncode`)) join `coa`.`inducks_storyjob` `storyjob`
      on (`storyversion`.`storyversioncode` = `storyjob`.`storyversioncode`))
where `issue`.`publicationcode` in ('fr/MP', 'fr/PM', 'fr/SPG', 'fr/JM')
  and `issue`.`oldestdate` >= '2001'
  and `entryurl`.`sitecode` = 'thumbnails3'
  and `storyversion`.`kind` = 'n'
  and `storyjob`.`plotwritartink` = 'a'
  and 1 = (select count(distinct `coa`.`inducks_storyjob`.`personcode`)
           from `coa`.`inducks_storyjob`
           where `storyversion`.`storyversioncode` = `coa`.`inducks_storyjob`.`storyversioncode`
             and `coa`.`inducks_storyjob`.`plotwritartink` in ('a', 'i'))
  and `storyjob`.`personcode` <> '?';

