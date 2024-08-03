create table inducks_appearance
(
    storyversioncode  varchar(20)     null,
    charactercode     varchar(62)     null,
    number            int(7)          null,
    appearancecomment varchar(209)    null,
    doubt             enum ('Y', 'N') null
);

create index fk0
    on inducks_appearance (charactercode);

create index fk1
    on inducks_appearance (appearancecomment);

create index pk0
    on inducks_appearance (storyversioncode, charactercode);

create table inducks_character
(
    charactercode    varchar(69)     null,
    charactername    text            null,
    official         enum ('Y', 'N') null,
    onetime          enum ('Y', 'N') null,
    heroonly         enum ('Y', 'N') null,
    charactercomment varchar(671)    null
);

create fulltext index fulltext_inducks_character
    on inducks_character (charactername);

create index pk0
    on inducks_character (charactercode);

create table inducks_characteralias
(
    charactercode varchar(31) null,
    charactername varchar(58) null
);

create index fk0
    on inducks_characteralias (charactercode);

create index pk0
    on inducks_characteralias (charactername);

create table inducks_characterdetail
(
    charactername varchar(7) null,
    charactercode varchar(6) null,
    number        int(7)     null
);

create index fk0
    on inducks_characterdetail (charactername);

create index pk0
    on inducks_characterdetail (charactercode);

create table inducks_charactername
(
    charactercode        varchar(45)     null,
    languagecode         varchar(7)      null,
    charactername        varchar(83)     null,
    preferred            enum ('Y', 'N') null,
    characternamecomment varchar(99)     null
);

create index fk0
    on inducks_charactername (languagecode);

create index pk0
    on inducks_charactername (charactercode, languagecode, charactername);

create table inducks_characterreference
(
    fromcharactercode   varchar(36)     null,
    tocharactercode     varchar(36)     null,
    isgroupofcharacters enum ('Y', 'N') null
);

create index fk0
    on inducks_characterreference (tocharactercode);

create index pk0
    on inducks_characterreference (fromcharactercode, tocharactercode);

create table inducks_characterurl
(
    charactercode varchar(1) null,
    sitecode      varchar(1) null,
    url           varchar(1) null
);

create index fk0
    on inducks_characterurl (sitecode);

create index pk0
    on inducks_characterurl (charactercode, sitecode);

create table inducks_country
(
    countrycode            varchar(2)  null,
    countryname            varchar(20) null,
    defaultlanguage        varchar(7)  null,
    defaultmaintenanceteam varchar(8)  null
);

create index pk0
    on inducks_country (countrycode);

create table inducks_countryname
(
    countrycode  varchar(2)  null,
    languagecode varchar(5)  null,
    countryname  varchar(56) null
);

create index fk0
    on inducks_countryname (languagecode);

create index pk0
    on inducks_countryname (countrycode, languagecode);

create table inducks_currency
(
    currencycode varchar(3)  null,
    currencyname varchar(18) null
);

create index pk0
    on inducks_currency (currencycode);

create table inducks_currencyname
(
    currencycode      varchar(3)  null,
    languagecode      varchar(2)  null,
    shortcurrencyname varchar(19) null,
    longcurrencyname  varchar(20) null
);

create index fk0
    on inducks_currencyname (languagecode);

create index pk0
    on inducks_currencyname (currencycode, languagecode);

create table inducks_entry
(
    entrycode               varchar(37)     null,
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
    error                   enum ('Y', 'N') null,
    short_issuecode         varchar(19) as (regexp_replace(`issuecode`, '[ ]+', ' '))
);

create fulltext index entryTitleFullText
    on inducks_entry (title);

create index fk0
    on inducks_entry (issuecode);

create index fk1
    on inducks_entry (storyversioncode);

create index fk2
    on inducks_entry (languagecode);

create index fk3
    on inducks_entry (includedinentrycode);

create index fk4
    on inducks_entry (position);

create index pk0
    on inducks_entry (entrycode);

create table inducks_entrycharactername
(
    entrycode     varchar(22)  null,
    charactercode varchar(49)  null,
    charactername varchar(131) null
);

create index fk0
    on inducks_entrycharactername (charactercode);

create index pk0
    on inducks_entrycharactername (entrycode, charactercode);

create table inducks_entryjob
(
    entrycode       varchar(20)     null,
    personcode      varchar(50)     null,
    transletcol     varchar(1)      null,
    entryjobcomment varchar(85)     null,
    doubt           enum ('Y', 'N') null
);

create index fk0
    on inducks_entryjob (personcode);

create index pk0
    on inducks_entryjob (entrycode, personcode, transletcol);

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

create index fk0
    on inducks_entryurl (entrycode);

create index fk1
    on inducks_entryurl (sitecode);

create index fk2
    on inducks_entryurl (url);

create index fk3
    on inducks_entryurl (storycode);

create table inducks_equiv
(
    issuecode       varchar(15) null,
    equivid         int(7)      null,
    equivcomment    varchar(3)  null,
    short_issuecode varchar(15) as (regexp_replace(`issuecode`, '[ ]+', ' '))
);

create index fk0
    on inducks_equiv (equivid);

create index pk0
    on inducks_equiv (issuecode, equivid);

create table inducks_herocharacter
(
    storycode     varchar(18)     null,
    charactercode varchar(54)     null,
    number        int(7)          null,
    doubt         enum ('Y', 'N') null
);

create index fk0
    on inducks_herocharacter (charactercode);

create index pk0
    on inducks_herocharacter (storycode, charactercode);

create table inducks_inputfile
(
    inputfilecode       int(7)          null,
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

create index pk0
    on inducks_inputfile (inputfilecode);

create table inducks_issue
(
    issuecode           varchar(19)     null,
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
    maintenanceteamcode varchar(8)      null,
    short_issuecode     varchar(19) as (regexp_replace(`issuecode`, '[ ]+', ' '))
);

create index fk0
    on inducks_issue (issuerangecode);

create index fk1
    on inducks_issue (publicationcode);

create index inducks_issue_short_issuecode_index
    on inducks_issue (short_issuecode);

create index pk0
    on inducks_issue (issuecode);

create table inducks_issue2
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
    maintenanceteamcode varchar(8)      null,
    short_issuecode     varchar(19) as (regexp_replace(`issuecode`, '[ ]+', ' '))
);

create index fk0
    on inducks_issue2 (issuerangecode);

create index fk1
    on inducks_issue2 (publicationcode);

create table inducks_issuecollecting
(
    collectingissuecode varchar(17) null,
    collectedissuecode  varchar(15) null
);

create index fk0
    on inducks_issuecollecting (collectedissuecode);

create index pk0
    on inducks_issuecollecting (collectingissuecode, collectedissuecode);

create table inducks_issuedate
(
    issuecode       varchar(19)     null,
    date            varchar(10)     null,
    kindofdate      varchar(76)     null,
    doubt           enum ('Y', 'N') null,
    short_issuecode varchar(19) as (regexp_replace(`issuecode`, '[ ]+', ' '))
);

create index pk0
    on inducks_issuedate (issuecode, date);

create table inducks_issuejob
(
    issuecode       varchar(19)     null,
    personcode      varchar(48)     null,
    inxtransletcol  varchar(1)      null,
    issuejobcomment varchar(48)     null,
    doubt           enum ('Y', 'N') null,
    short_issuecode varchar(19) as (regexp_replace(`issuecode`, '[ ]+', ' '))
);

create index fk0
    on inducks_issuejob (personcode);

create index pk0
    on inducks_issuejob (issuecode, personcode, inxtransletcol);

create table inducks_issueprice
(
    issuecode       varchar(17) null,
    amount          varchar(86) null,
    currency        varchar(14) null,
    comment         varchar(75) null,
    sequencenumber  int(7)      null,
    short_issuecode varchar(17) as (regexp_replace(`issuecode`, '[ ]+', ' '))
);

create index pk0
    on inducks_issueprice (issuecode, amount);

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
    short_issuecode varchar(28) as (concat(`publicationcode`, ' ', `issuenumber`)),
    constraint inducks_issuequotation__uindex_short_issuecode_source
        unique (short_issuecode, source)
);

create index inducks_issuequotation__index_publication
    on inducks_issuequotation (publicationcode);

create table inducks_issuerange
(
    issuerangecode    varchar(15)     null,
    publicationcode   varchar(9)      null,
    title             varchar(186)    null,
    circulation       varchar(6)      null,
    issuerangecomment varchar(463)    null,
    numbersarefake    enum ('Y', 'N') null,
    error             enum ('Y', 'N') null
);

create index fk0
    on inducks_issuerange (publicationcode);

create index pk0
    on inducks_issuerange (issuerangecode);

create table inducks_issueurl
(
    issuecode       varchar(14) null,
    sitecode        varchar(12) null,
    url             varchar(12) null,
    short_issuecode varchar(14) as (regexp_replace(`issuecode`, '[ ]+', ' '))
);

create index fk0
    on inducks_issueurl (sitecode);

create index pk0
    on inducks_issueurl (issuecode, sitecode);

create table inducks_language
(
    languagecode        varchar(7)  null,
    defaultlanguagecode varchar(5)  null,
    languagename        varchar(20) null
);

create index fk0
    on inducks_language (defaultlanguagecode);

create index pk0
    on inducks_language (languagecode);

create table inducks_languagename
(
    desclanguagecode varchar(5)  null,
    languagecode     varchar(7)  null,
    languagename     varchar(57) null
);

create index fk0
    on inducks_languagename (languagecode);

create index pk0
    on inducks_languagename (desclanguagecode, languagecode);

create table inducks_log
(
    number              int(7)          null,
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

create index pk0
    on inducks_log (number);

create table inducks_logdata
(
    logid    varchar(4)   null,
    category int(7)       null,
    logtext  varchar(108) null
);

create index pk0
    on inducks_logdata (logid);

create table inducks_logocharacter
(
    entrycode            varchar(36)     null,
    charactercode        varchar(54)     null,
    reallyintitle        enum ('Y', 'N') null,
    number               int(7)          null,
    logocharactercomment varchar(28)     null
);

create index fk0
    on inducks_logocharacter (charactercode);

create index pk0
    on inducks_logocharacter (entrycode, charactercode);

create table inducks_movie
(
    moviecode           varchar(14)     null,
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

create index pk0
    on inducks_movie (moviecode);

create table inducks_moviecharacter
(
    moviecode        varchar(14)     null,
    charactercode    varchar(38)     null,
    istitlecharacter enum ('Y', 'N') null
);

create index fk0
    on inducks_moviecharacter (charactercode);

create index pk0
    on inducks_moviecharacter (moviecode, charactercode);

create table inducks_moviejob
(
    moviecode       varchar(13)     null,
    personcode      varchar(39)     null,
    role            varchar(15)     null,
    moviejobcomment varchar(82)     null,
    indirect        enum ('Y', 'N') null,
    doubt           enum ('Y', 'N') null
);

create index fk0
    on inducks_moviejob (personcode);

create index pk0
    on inducks_moviejob (moviecode, personcode, role);

create table inducks_moviereference
(
    storycode         varchar(17)     null,
    moviecode         varchar(14)     null,
    referencereasonid int(7)          null,
    frommovietostory  enum ('Y', 'N') null
);

create index fk0
    on inducks_moviereference (moviecode);

create index fk1
    on inducks_moviereference (referencereasonid);

create index pk0
    on inducks_moviereference (storycode, moviecode);

create table inducks_person
(
    personcode             varchar(79)     null,
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

create index fk0
    on inducks_person (nationalitycountrycode);

create fulltext index fulltext_inducks_person
    on inducks_person (fullname, birthname);

create index pk0
    on inducks_person (personcode);

create table inducks_personalias
(
    personcode varchar(31)     null,
    surname    varchar(48)     null,
    givenname  varchar(31)     null,
    official   enum ('Y', 'N') null
);

create index fk0
    on inducks_personalias (personcode);

create table inducks_personurl
(
    personcode varchar(24) null,
    sitecode   varchar(15) null,
    url        varchar(31) null
);

create index fk0
    on inducks_personurl (sitecode);

create index pk0
    on inducks_personurl (personcode, sitecode);

create table inducks_publication
(
    publicationcode     varchar(12)     null,
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

create index fk0
    on inducks_publication (countrycode);

create index fk1
    on inducks_publication (languagecode);

create fulltext index fulltext_inducks_publication
    on inducks_publication (title);

create index pk0
    on inducks_publication (publicationcode);

create table inducks_publicationcategory
(
    publicationcode varchar(12) null,
    category        varchar(61) null
);

create index pk0
    on inducks_publicationcategory (publicationcode);

create table inducks_publicationname
(
    publicationcode varchar(9)  null,
    publicationname varchar(62) null
);

create index pk0
    on inducks_publicationname (publicationcode);

create table inducks_publicationurl
(
    publicationcode varchar(10)  null,
    sitecode        varchar(16)  null,
    url             varchar(236) null
);

create index fk0
    on inducks_publicationurl (sitecode);

create index pk0
    on inducks_publicationurl (publicationcode, sitecode);

create table inducks_publisher
(
    publisherid   varchar(94) null,
    publishername text        null
);

create fulltext index fulltext_inducks_publisher
    on inducks_publisher (publishername);

create index pk0
    on inducks_publisher (publisherid);

create table inducks_publishingjob
(
    publisherid          varchar(94) null,
    issuecode            varchar(17) null,
    publishingjobcomment varchar(67) null,
    short_issuecode      varchar(17) as (regexp_replace(`issuecode`, '[ ]+', ' '))
);

create index fk0
    on inducks_publishingjob (issuecode);

create index pk0
    on inducks_publishingjob (publisherid, issuecode);

create table inducks_referencereason
(
    referencereasonid   int(7)       null,
    referencereasontext varchar(129) null
);

create index pk0
    on inducks_referencereason (referencereasonid);

create table inducks_referencereasonname
(
    referencereasonid          int(7)      null,
    languagecode               varchar(2)  null,
    referencereasontranslation varchar(28) null
);

create index fk0
    on inducks_referencereasonname (languagecode);

create index pk0
    on inducks_referencereasonname (referencereasonid, languagecode);

create table inducks_site
(
    sitecode   varchar(16)     null,
    urlbase    varchar(51)     null,
    images     enum ('Y', 'N') null,
    sitename   varchar(85)     null,
    sitelogo   varchar(107)    null,
    properties varchar(1)      null
);

create index pk0
    on inducks_site (sitecode);

create table inducks_statcharactercharacter
(
    charactercode   varchar(58)  null,
    cocharactercode varchar(58)  null,
    total           int(7)       null,
    yearrange       varchar(152) null
);

create index pk0
    on inducks_statcharactercharacter (charactercode, total);

create table inducks_statcharactercountry
(
    charactercode varchar(58) null,
    countrycode   varchar(2)  null,
    total         int(7)      null
);

create index pk0
    on inducks_statcharactercountry (charactercode, countrycode);

create table inducks_statcharacterstory
(
    charactercode   varchar(58)  null,
    storyheadercode varchar(3)   null,
    total           int(7)       null,
    yearrange       varchar(108) null
);

create index pk0
    on inducks_statcharacterstory (charactercode, storyheadercode);

create table inducks_statpersoncharacter
(
    personcode    varchar(79)  null,
    charactercode varchar(58)  null,
    total         int(7)       null,
    yearrange     varchar(113) null
);

create index pk0
    on inducks_statpersoncharacter (personcode, total);

create table inducks_statpersoncountry
(
    personcode  varchar(79) null,
    countrycode varchar(2)  null,
    total       int(7)      null
);

create index pk0
    on inducks_statpersoncountry (personcode, countrycode);

create table inducks_statpersonperson
(
    personcode   varchar(79) null,
    copersoncode varchar(79) null,
    total        int(7)      null,
    yearrange    varchar(59) null
);

create index pk0
    on inducks_statpersonperson (personcode, total);

create table inducks_statpersonstory
(
    personcode      varchar(79) null,
    storyheadercode varchar(3)  null,
    total           int(7)      null,
    yearrange       varchar(62) null
);

create index pk0
    on inducks_statpersonstory (personcode, storyheadercode);

create table inducks_story
(
    storycode                varchar(19)     null,
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

create index fk0
    on inducks_story (originalstoryversioncode);

create index fk1
    on inducks_story (firstpublicationdate);

create fulltext index fulltext_inducks_story
    on inducks_story (title, repcountrysummary);

create index pk0
    on inducks_story (storycode);

create table inducks_storycodes
(
    storycode       varchar(19) null,
    alternativecode varchar(72) null,
    unpackedcode    varchar(82) null,
    codecomment     varchar(45) null
);

create index fk0
    on inducks_storycodes (alternativecode);

create index pk0
    on inducks_storycodes (storycode, alternativecode);

create table inducks_storydescription
(
    storyversioncode varchar(19)   null,
    languagecode     varchar(7)    null,
    desctext         varchar(2814) null
);

create index fk0
    on inducks_storydescription (languagecode);

create index pk0
    on inducks_storydescription (storyversioncode, languagecode);

create table inducks_storyheader
(
    storyheadercode    varchar(12)  null,
    level              varchar(1)   null,
    title              varchar(96)  null,
    storyheadercomment varchar(582) null,
    countrycode        varchar(2)   null
);

create index pk0
    on inducks_storyheader (storyheadercode, level);

create table inducks_storyjob
(
    storyversioncode varchar(20)     null,
    personcode       varchar(79)     null,
    plotwritartink   varchar(1)      null,
    storyjobcomment  varchar(141)    null,
    indirect         enum ('Y', 'N') null,
    doubt            enum ('Y', 'N') null
);

create index fk0
    on inducks_storyjob (personcode);

create index pk0
    on inducks_storyjob (storyversioncode, personcode, plotwritartink);

create table inducks_storyreference
(
    fromstorycode     varchar(18) null,
    tostorycode       varchar(17) null,
    referencereasonid int(7)      null
);

create index fk0
    on inducks_storyreference (tostorycode);

create index fk1
    on inducks_storyreference (referencereasonid);

create index pk0
    on inducks_storyreference (fromstorycode, tostorycode);

create table inducks_storysubseries
(
    storycode             varchar(18)  null,
    subseriescode         varchar(144) null,
    storysubseriescomment varchar(33)  null
);

create index fk0
    on inducks_storysubseries (subseriescode);

create index pk0
    on inducks_storysubseries (storycode, subseriescode);

create table inducks_storyurl
(
    storycode varchar(13) null,
    sitecode  varchar(15) null,
    url       varchar(43) null
);

create index fk0
    on inducks_storyurl (sitecode);

create index pk0
    on inducks_storyurl (storycode, sitecode);

create table inducks_storyversion
(
    storyversioncode      varchar(37)     null,
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

create index fk1
    on inducks_storyversion (storycode);

create fulltext index fulltext_inducks_storyversion
    on inducks_storyversion (appsummary, plotsummary, writsummary, artsummary, inksummary, creatorrefsummary,
                             keywordsummary);

create index pk0
    on inducks_storyversion (storyversioncode);

create table inducks_studio
(
    studiocode    varchar(23)  null,
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

create index fk0
    on inducks_studio (countrycode);

create index pk0
    on inducks_studio (studiocode);

create table inducks_studiowork
(
    studiocode varchar(23) null,
    personcode varchar(24) null
);

create index fk0
    on inducks_studiowork (personcode);

create index pk0
    on inducks_studiowork (studiocode, personcode);

create table inducks_subseries
(
    subseriescode     varchar(57)     null,
    subseriesname     varchar(57)     null,
    official          enum ('Y', 'N') null,
    subseriescomment  varchar(410)    null,
    subseriescategory varchar(46)     null
);

create index pk0
    on inducks_subseries (subseriescode);

create table inducks_subseriesname
(
    subseriescode        varchar(54)     null,
    languagecode         varchar(7)      null,
    subseriesname        varchar(294)    null,
    preferred            enum ('Y', 'N') null,
    subseriesnamecomment varchar(28)     null
);

create index fk0
    on inducks_subseriesname (languagecode);

create index pk0
    on inducks_subseriesname (subseriescode, languagecode);

create table inducks_substory
(
    storycode                varchar(13)     null,
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

create index fk0
    on inducks_substory (firstpublicationdate);

create index pk0
    on inducks_substory (storycode);

create table inducks_team
(
    teamcode            varchar(13) null,
    teamdescriptionname varchar(25) null,
    teamshortname       varchar(7)  null
);

create index pk0
    on inducks_team (teamcode);

create table inducks_teammember
(
    teamcode   varchar(13) null,
    personcode varchar(3)  null
);

create index pk0
    on inducks_teammember (teamcode);

create table inducks_ucrelation
(
    universecode  varchar(28) null,
    charactercode varchar(45) null
);

create index fk0
    on inducks_ucrelation (charactercode);

create index pk0
    on inducks_ucrelation (universecode, charactercode);

create table inducks_universe
(
    universecode    varchar(28) null,
    universecomment varchar(1)  null
);

create index pk0
    on inducks_universe (universecode);

create table inducks_universename
(
    universecode varchar(28) null,
    languagecode varchar(5)  null,
    universename varchar(76) null
);

create index fk0
    on inducks_universename (languagecode);

create index pk0
    on inducks_universename (universecode, languagecode);

create table induckspriv_entry
(
    entrycode    varchar(37)   null,
    entrycomment varchar(1936) null
);

create index pk0
    on induckspriv_entry (entrycode);

create table induckspriv_issue
(
    issuecode       varchar(16)   null,
    issuecomment    varchar(1167) null,
    short_issuecode varchar(16) as (regexp_replace(`issuecode`, '[ ]+', ' '))
);

create index pk0
    on induckspriv_issue (issuecode);

create table induckspriv_story
(
    storycode    varchar(18)   null,
    storycomment varchar(4098) null
);

create index pk0
    on induckspriv_story (storycode);

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

