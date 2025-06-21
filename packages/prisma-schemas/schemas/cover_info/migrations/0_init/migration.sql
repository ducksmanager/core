create table _prisma_migrations (
    id varchar(36) not null primary key,
    checksum varchar(64) not null,
    finished_at datetime(3) null,
    migration_name varchar(255) not null,
    logs text null,
    rolled_back_at datetime(3) null,
    started_at datetime(3) default current_timestamp(3) not null,
    applied_steps_count int unsigned default 0 not null
) collate = utf8mb4_unicode_ci;
create table cover_imports (
    coverid int auto_increment primary key,
    imported datetime null,
    import_error varchar(200) null,
    constraint uniquefieldset_cover_imports unique (coverid, imported, import_error)
) collate = utf8mb3_general_ci;
create table covers (
    ID int auto_increment primary key,
    issuecode varchar(17) not null,
    sitecode varchar(11) not null,
    url varchar(98) not null,
    short_issuecode varchar(19) as (regexp_replace(`issuecode`, '[ ]+', ' ')),
    constraint uniquefieldset_covers unique (issuecode, url)
) engine = MyISAM collate = utf8mb3_general_ci;
create table covers_in_index_tmp (id int null) charset = latin1;