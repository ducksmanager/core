create table dataset
(
  id    int auto_increment
    primary key,
  name  varchar(30) not null,
  title varchar(50) null,
  constraint dataset_name_uindex
    unique (name)
) collate = utf8mb4_unicode_ci;

create table entryurl_details
(
  sitecode_url varchar(99)                           not null
    primary key,
  updated_at   timestamp default CURRENT_TIMESTAMP() not null,
  decision     enum ('ok', 'shows_author', 'no_drawing') null,
  personcode   varchar(79) null,
  constraint entryurl_details_sitecode_url_uindex
    unique (sitecode_url)
) collate = utf8mb4_unicode_ci;

create table dataset_entryurl
(
  id           int auto_increment
    primary key,
  dataset_id   int         not null,
  sitecode_url varchar(99) not null,
  constraint datasets_entryurl_validations_dataset_validation
    unique (dataset_id, sitecode_url),
  constraint dataset_entryurl__dataset_id_fk
    foreign key (dataset_id) references dataset (id),
  constraint dataset_entryurl__entryurl_details_sitecode_url_fk
    foreign key (sitecode_url) references entryurl_details (sitecode_url)
) collate = utf8mb4_unicode_ci;

create index datasets_entryurl_validations_entryurl_validations_id_fk
  on dataset_entryurl (sitecode_url);

create table game
(
  id          int auto_increment
    primary key,
  created_at  datetime default CURRENT_TIMESTAMP() not null,
  started_at  datetime null,
  finished_at datetime null,
  game_type   enum ('against_bot', 'against_players') default 'against_players' not null,
  dataset_id  int                                  not null,
  constraint game__dataset_id_fk
    foreign key (dataset_id) references dataset (id)
) collate = utf8mb4_unicode_ci;

create table player
(
  id              int auto_increment
    primary key,
  username        varchar(50) not null,
  ducksmanager_id int null,
  constraint player_ducksmanager_id_uindex
    unique (ducksmanager_id),
  constraint player_username_uindex
    unique (username)
) collate = utf8mb4_unicode_ci;

create table game_player
(
  id        int auto_increment
    primary key,
  game_id   int not null,
  player_id int not null,
  constraint game_player_game_id_fk
    foreign key (game_id) references game (id),
  constraint game_player_player_id_fk
    foreign key (player_id) references player (id)
) collate = utf8mb4_unicode_ci;

create table round
(
  id           int auto_increment
    primary key,
  game_id      int          not null,
  round_number tinyint unsigned null,
  sitecode_url varchar(100) not null,
  personcode   varchar(79)  not null,
  started_at   datetime null,
  finished_at  datetime null,
  constraint round_game_id_fk
    foreign key (game_id) references game (id)
) collate = utf8mb4_unicode_ci;

create table score_type
(
  type_name varchar(20) not null
    primary key
) collate = utf8mb4_unicode_ci;

create table round_score
(
  id              int auto_increment
    primary key,
  player_id       int         not null,
  round_id        int         not null,
  score_type_name varchar(20) not null,
  score           smallint unsigned not null,
  speed_bonus     int null,
  constraint round_score__score_type_type_name_fk
    foreign key (score_type_name) references score_type (type_name),
  constraint round_score_player_id_fk
    foreign key (player_id) references player (id),
  constraint round_score_round_id_fk
    foreign key (round_id) references round (id)
) collate = utf8mb4_unicode_ci;

