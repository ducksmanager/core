-- CreateTable
CREATE TABLE `entry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accepted_story_suggested_id` INTEGER NULL,
    `accepted_story_kind_suggested_id` INTEGER NULL,
    `indexation_id` VARCHAR(20) NOT NULL,
    `entrycomment` VARCHAR(2009) NULL,
    `part` VARCHAR(5) NULL,
    `title` VARCHAR(100) NULL,
    `position` VARCHAR(9) NOT NULL,

    INDEX `entry_story_kind_suggestion_id_fk`(`accepted_story_kind_suggested_id`),
    INDEX `entry_story_suggestion_id_fk`(`accepted_story_suggested_id`),
    UNIQUE INDEX `entry_indexation_position_unique`(`indexation_id`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page_number` SMALLINT NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `indexation_id` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `page_url_uindex`(`url`),
    INDEX `page_indexation_id_fk`(`indexation_id`),
    UNIQUE INDEX `page_indexation_id_page_number_uindex`(`indexation_id`, `page_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `indexation` (
    `id` VARCHAR(20) NOT NULL,
    `issuecode` VARCHAR(9) NULL,
    `accepted_issue_suggestion_id` INTEGER NULL,
    `dm_user_id` INTEGER NOT NULL,

    INDEX `indexation_issue_suggestion_id_fk`(`accepted_issue_suggestion_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `story_kind_suggestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kind` ENUM('a', 'c', 'f', 'g', 'i', 'k', 'n', 't', 'L', 'P') NOT NULL,
    `ai_source_page_id` INTEGER NULL,
    `entry_id` INTEGER NOT NULL,

    INDEX `story_kind_suggestion_entry_id_fk`(`entry_id`),
    INDEX `story_kind_suggestion_ai_source_page_id_fk`(`ai_source_page_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `story_suggestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storyversioncode` VARCHAR(9) NOT NULL,
    `entry_id` INTEGER NOT NULL,
    `ocr_details_id` INTEGER NULL,

    INDEX `story_suggestion_entry_id_fk`(`entry_id`),
    INDEX `story_suggestion_ai_ocr_possible_story_id_fk`(`ocr_details_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `issue_suggestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `indexation_id` VARCHAR(20) NOT NULL,
    `source` ENUM('ai', 'user') NOT NULL,
    `publicationcode` VARCHAR(12) NULL,
    `issuenumber` VARCHAR(13) NULL,
    `issuecode` VARCHAR(25) NULL,

    INDEX `issue_suggestion_indexation_id_fk`(`indexation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_ocr_possible_story` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page_id` INTEGER NOT NULL,
    `ocr_result_id` INTEGER NULL,
    `confidence_score` SMALLINT NOT NULL,

    INDEX `ai_ocr_possible_story_page_id_fk`(`page_id`),
    INDEX `ai_ocr_possible_story_ai_ocr_result_id_fk`(`ocr_result_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_ocr_result` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page_id` INTEGER NOT NULL,
    `x1` INTEGER NOT NULL,
    `x2` INTEGER NOT NULL,
    `x3` INTEGER NOT NULL,
    `x4` INTEGER NOT NULL,
    `y1` INTEGER NOT NULL,
    `y2` INTEGER NOT NULL,
    `y3` INTEGER NOT NULL,
    `y4` INTEGER NOT NULL,
    `text` TEXT NOT NULL,
    `confidence` FLOAT NOT NULL,

    INDEX `ai_ocr_result_page_id_fk`(`page_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_kumiko_result_panel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page_id` INTEGER NOT NULL,
    `x` SMALLINT NOT NULL,
    `y` SMALLINT NOT NULL,
    `width` SMALLINT NOT NULL,
    `height` SMALLINT NOT NULL,

    INDEX `ai_kumiko_result_panel_page_id_fk`(`page_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entry_page` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entry_id` INTEGER NOT NULL,
    `page_id` INTEGER NOT NULL,

    INDEX `entry_page_entry_id_fk`(`entry_id`),
    UNIQUE INDEX `entry_page_unique`(`page_id`, `entry_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `entry` ADD CONSTRAINT `entry_indexation_id_fk` FOREIGN KEY (`indexation_id`) REFERENCES `indexation`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `entry` ADD CONSTRAINT `entry_story_kind_suggestion_id_fk` FOREIGN KEY (`accepted_story_kind_suggested_id`) REFERENCES `story_kind_suggestion`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `entry` ADD CONSTRAINT `entry_story_suggestion_id_fk` FOREIGN KEY (`accepted_story_suggested_id`) REFERENCES `story_suggestion`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `page` ADD CONSTRAINT `page_indexation_id_fk` FOREIGN KEY (`indexation_id`) REFERENCES `indexation`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `indexation` ADD CONSTRAINT `indexation_issue_suggestion_id_fk` FOREIGN KEY (`accepted_issue_suggestion_id`) REFERENCES `issue_suggestion`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_kind_suggestion` ADD CONSTRAINT `story_kind_suggestion_page_id_fk` FOREIGN KEY (`ai_source_page_id`) REFERENCES `page`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_kind_suggestion` ADD CONSTRAINT `story_kind_suggestion_entry_id_fk` FOREIGN KEY (`entry_id`) REFERENCES `entry`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_suggestion` ADD CONSTRAINT `story_suggestion_ai_ocr_possible_story_id_fk` FOREIGN KEY (`ocr_details_id`) REFERENCES `ai_ocr_possible_story`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_suggestion` ADD CONSTRAINT `story_suggestion_entry_id_fk` FOREIGN KEY (`entry_id`) REFERENCES `entry`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `issue_suggestion` ADD CONSTRAINT `issue_suggestion_indexation_id_fk` FOREIGN KEY (`indexation_id`) REFERENCES `indexation`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_ocr_possible_story` ADD CONSTRAINT `ai_ocr_possible_story_ai_ocr_result_id_fk` FOREIGN KEY (`ocr_result_id`) REFERENCES `ai_ocr_result`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_ocr_possible_story` ADD CONSTRAINT `ai_ocr_possible_story_page_id_fk` FOREIGN KEY (`page_id`) REFERENCES `page`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_ocr_result` ADD CONSTRAINT `ai_ocr_result_page_id_fk` FOREIGN KEY (`page_id`) REFERENCES `page`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_kumiko_result_panel` ADD CONSTRAINT `ai_kumiko_result_panel_page_id_fk` FOREIGN KEY (`page_id`) REFERENCES `page`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `entry_page` ADD CONSTRAINT `entry_page_entry_id_fk` FOREIGN KEY (`entry_id`) REFERENCES `entry`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `entry_page` ADD CONSTRAINT `entry_page_page_id_fk` FOREIGN KEY (`page_id`) REFERENCES `page`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
