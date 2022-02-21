CREATE TABLE `dataset`
(
  `id`    int(11) NOT NULL AUTO_INCREMENT,
  `name`  varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dataset_name_uindex` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `dataset_entryurl`
(
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `dataset_id`   int(11) NOT NULL,
  `sitecode_url` varchar(99) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `datasets_entryurl_validations_dataset_validation` (`dataset_id`,`sitecode_url`),
  KEY            `datasets_entryurl_validations_entryurl_validations_id_fk` (`sitecode_url`),
  CONSTRAINT `dataset_entryurl__dataset_id_fk` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`id`),
  CONSTRAINT `dataset_entryurl__entryurl_details_sitecode_url_fk` FOREIGN KEY (`sitecode_url`) REFERENCES `entryurl_details` (`sitecode_url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `entryurl_details`
(
  `sitecode_url` varchar(99) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at`   timestamp                              NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `decision`     enum('ok','shows_author','no_drawing') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `personcode`   varchar(79) COLLATE utf8mb4_unicode_ci          DEFAULT NULL,
  PRIMARY KEY (`sitecode_url`),
  UNIQUE KEY `entryurl_details_sitecode_url_uindex` (`sitecode_url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `game`
(
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `created_at`  datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `started_at`  datetime          DEFAULT NULL,
  `finished_at` datetime          DEFAULT NULL,
  `game_type`   enum('against_bot','against_players') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'against_players',
  `dataset_id`  int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY           `game__dataset_id_fk` (`dataset_id`),
  CONSTRAINT `game__dataset_id_fk` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `game_player`
(
  `id`        int(11) NOT NULL AUTO_INCREMENT,
  `game_id`   int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY         `game_player_game_id_fk` (`game_id`),
  KEY         `game_player_player_id_fk` (`player_id`),
  CONSTRAINT `game_player_game_id_fk` FOREIGN KEY (`game_id`) REFERENCES `game` (`id`),
  CONSTRAINT `game_player_player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `player`
(
  `id`              int(11) NOT NULL AUTO_INCREMENT,
  `username`        varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ducksmanager_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `player_username_uindex` (`username`),
  UNIQUE KEY `player_ducksmanager_id_uindex` (`ducksmanager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `round`
(
  `id`           int(11) NOT NULL AUTO_INCREMENT,
  `game_id`      int(11) NOT NULL,
  `round_number` tinyint(3) unsigned DEFAULT NULL,
  `sitecode_url` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `personcode`   varchar(79) COLLATE utf8mb4_unicode_ci  NOT NULL,
  `started_at`   datetime DEFAULT NULL,
  `finished_at`  datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY            `round_game_id_fk` (`game_id`),
  CONSTRAINT `round_game_id_fk` FOREIGN KEY (`game_id`) REFERENCES `game` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `round_score`
(
  `id`              int(11) NOT NULL AUTO_INCREMENT,
  `player_id`       int(11) NOT NULL,
  `round_id`        int(11) NOT NULL,
  `score_type_name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score`           smallint(5) unsigned NOT NULL,
  `speed_bonus`     int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY               `round_score__score_type_type_name_fk` (`score_type_name`),
  KEY               `round_score_player_id_fk` (`player_id`),
  KEY               `round_score_round_id_fk` (`round_id`),
  CONSTRAINT `round_score__score_type_type_name_fk` FOREIGN KEY (`score_type_name`) REFERENCES `score_type` (`type_name`),
  CONSTRAINT `round_score_player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player` (`id`),
  CONSTRAINT `round_score_round_id_fk` FOREIGN KEY (`round_id`) REFERENCES `round` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `score_type`
(
  `type_name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`type_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

