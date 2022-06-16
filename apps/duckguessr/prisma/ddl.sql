create table dataset
(
  id          int auto_increment
    primary key,
  name        varchar(30) not null,
  title       varchar(50) null,
  description text        null,
  constraint dataset_name_uindex
    unique (name)
);

create table entryurl_details
(
  sitecode_url varchar(99)                               not null
    primary key,
  updated_at   timestamp default current_timestamp()     not null on update current_timestamp(),
  decision     enum ('ok', 'shows_author', 'no_drawing') null,
  personcode   varchar(79)                               null,
  constraint entryurl_details_sitecode_url_uindex
    unique (sitecode_url)
);

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
);

create index datasets_entryurl_validations_entryurl_validations_id_fk
  on dataset_entryurl (sitecode_url);

create index decision_index
  on entryurl_details (decision);

create index entryurl_details_personcode_index
  on entryurl_details (personcode);

create table game
(
  id          int auto_increment
    primary key,
  created_at  datetime default current_timestamp() not null,
  started_at  datetime                             null,
  finished_at datetime                             null,
  dataset_id  int                                  not null,
  constraint game__dataset_id_fk
    foreign key (dataset_id) references dataset (id)
);

create table player
(
  id              int auto_increment
    primary key,
  username        varchar(50)                         not null,
  ducksmanager_id int                                 null,
  avatar          varchar(25) default 'HDL''s father' not null,
  constraint player_ducksmanager_id_uindex
    unique (ducksmanager_id),
  constraint player_username_uindex
    unique (username)
);

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
);

create table round
(
  id           int auto_increment
    primary key,
  game_id      int              not null,
  round_number tinyint unsigned null,
  sitecode_url varchar(100)     not null,
  personcode   varchar(79)      not null,
  started_at   datetime         null,
  finished_at  datetime         null,
  constraint round_game_id_fk
    foreign key (game_id) references game (id)
);

create table score_type
(
  type_name varchar(20) not null
    primary key
);

create table round_score
(
  id                  int auto_increment
    primary key,
  player_id           int               not null,
  round_id            int               not null,
  score_type_name     varchar(20)       not null,
  score               smallint unsigned not null,
  time_spent_guessing float             null,
  speed_bonus         int               null,
  constraint round_score__score_type_type_name_fk
    foreign key (score_type_name) references score_type (type_name),
  constraint round_score_player_id_fk
    foreign key (player_id) references player (id),
  constraint round_score_round_id_fk
    foreign key (round_id) references round (id)
);

create definer = root@`%` view game_scores as
select `duckguessr`.`game_player`.`game_id` AS `game_id`,`duckguessr`.`game_player`.`player_id` AS `player_id`,ifnull((select sum(`duckguessr`.`round_score`.`score` + `duckguessr`.`round_score`.`speed_bonus`) from `duckguessr`.`round_score` where `duckguessr`.`round_score`.`player_id` = `duckguessr`.`game_player`.`player_id` and `duckguessr`.`round_score`.`round_id` in (select `duckguessr`.`round`.`id` from `duckguessr`.`round` where `duckguessr`.`round`.`game_id` = `duckguessr`.`game_player`.`game_id`)),0) AS `Name_exp_3` from `duckguessr`.`game_player` group by `duckguessr`.`game_player`.`game_id`,`duckguessr`.`game_player`.`player_id`;

