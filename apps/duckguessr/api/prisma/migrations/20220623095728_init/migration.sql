-- CreateTable
CREATE TABLE `dataset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `title` VARCHAR(100) NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `dataset_name_uindex`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dataset_entryurl` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dataset_id` INTEGER NOT NULL,
    `sitecode_url` VARCHAR(99) NOT NULL,

    INDEX `datasets_entryurl_validations_entryurl_validations_id_fk`(`sitecode_url`),
    UNIQUE INDEX `datasets_entryurl_validations_dataset_validation`(`dataset_id`, `sitecode_url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `game` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `started_at` DATETIME(0) NULL,
    `finished_at` DATETIME(0) NULL,
    `dataset_id` INTEGER NOT NULL,

    INDEX `game__dataset_id_fk`(`dataset_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `game_player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `game_id` INTEGER NOT NULL,
    `player_id` INTEGER NOT NULL,

    INDEX `game_player_game_id_fk`(`game_id`),
    INDEX `game_player_player_id_fk`(`player_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `ducksmanager_id` INTEGER NULL,
    `avatar` VARCHAR(25) NOT NULL DEFAULT 'HDL''s father',

    UNIQUE INDEX `player_username_uindex`(`username`),
    UNIQUE INDEX `player_ducksmanager_id_uindex`(`ducksmanager_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `round` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `game_id` INTEGER NOT NULL,
    `round_number` TINYINT UNSIGNED NULL,
    `sitecode_url` VARCHAR(100) NOT NULL,
    `personcode` VARCHAR(79) NOT NULL,
    `started_at` DATETIME(0) NULL,
    `finished_at` DATETIME(0) NULL,

    INDEX `round_game_id_fk`(`game_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `round_score` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player_id` INTEGER NOT NULL,
    `round_id` INTEGER NOT NULL,
    `score_type_name` VARCHAR(20) NOT NULL,
    `score` SMALLINT UNSIGNED NOT NULL,
    `time_spent_guessing` FLOAT NULL,
    `speed_bonus` INTEGER NULL,

    INDEX `round_score__score_type_type_name_fk`(`score_type_name`),
    INDEX `round_score_player_id_fk`(`player_id`),
    INDEX `round_score_round_id_fk`(`round_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `score_type` (
    `type_name` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`type_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entryurl_details` (
    `sitecode_url` VARCHAR(99) NOT NULL,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `decision` ENUM('ok', 'shows_author', 'no_drawing') NULL,
    `personcode` VARCHAR(79) NULL,

    UNIQUE INDEX `entryurl_details_sitecode_url_uindex`(`sitecode_url`),
    INDEX `decision_index`(`decision`),
    INDEX `entryurl_details_personcode_index`(`personcode`),
    PRIMARY KEY (`sitecode_url`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `dataset_entryurl` ADD CONSTRAINT `dataset_entryurl__dataset_id_fk` FOREIGN KEY (`dataset_id`) REFERENCES `dataset`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `dataset_entryurl` ADD CONSTRAINT `dataset_entryurl__entryurl_details_sitecode_url_fk` FOREIGN KEY (`sitecode_url`) REFERENCES `entryurl_details`(`sitecode_url`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `game` ADD CONSTRAINT `game__dataset_id_fk` FOREIGN KEY (`dataset_id`) REFERENCES `dataset`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `game_player` ADD CONSTRAINT `game_player_game_id_fk` FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `game_player` ADD CONSTRAINT `game_player_player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `round` ADD CONSTRAINT `round_game_id_fk` FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `round_score` ADD CONSTRAINT `round_score_player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `round_score` ADD CONSTRAINT `round_score_round_id_fk` FOREIGN KEY (`round_id`) REFERENCES `round`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `round_score` ADD CONSTRAINT `round_score__score_type_type_name_fk` FOREIGN KEY (`score_type_name`) REFERENCES `score_type`(`type_name`) ON DELETE RESTRICT ON UPDATE RESTRICT;
