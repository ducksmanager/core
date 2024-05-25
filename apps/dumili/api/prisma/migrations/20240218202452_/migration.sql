-- CreateTable
CREATE TABLE `entry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order` SMALLINT NOT NULL,
    `accepted_story_suggested_id` INTEGER NOT NULL,
    `accepted_story_kind_suggested_id` INTEGER NOT NULL,
    `indexation_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `indexation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `issuecode` VARCHAR(9) NOT NULL,

    UNIQUE INDEX `indexation_name_uindex`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page_number` SMALLINT NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `indexation_id` INTEGER NOT NULL,

    UNIQUE INDEX `page_url_uindex`(`url`),
    INDEX `page_indexation_id_fk`(`indexation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `story_kind_suggestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kind` TINYINT NOT NULL,
    `panel_boundaries` LONGTEXT NULL,
    `source` ENUM('default', 'ai') NOT NULL,
    `entry_id` INTEGER NOT NULL,

    INDEX `story_kind_suggestion_entry_id_fk`(`entry_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `story_suggestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storyversioncode` VARCHAR(9) NOT NULL,
    `source` ENUM('user', 'ai') NOT NULL,
    `entry_id` INTEGER NOT NULL,

    INDEX `story_suggestion_entry_id_fk`(`entry_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `page` ADD CONSTRAINT `page_indexation_id_fk` FOREIGN KEY (`indexation_id`) REFERENCES `indexation`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_kind_suggestion` ADD CONSTRAINT `story_kind_suggestion_entry_id_fk` FOREIGN KEY (`entry_id`) REFERENCES `entry`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_suggestion` ADD CONSTRAINT `story_suggestion_entry_id_fk` FOREIGN KEY (`entry_id`) REFERENCES `entry`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
