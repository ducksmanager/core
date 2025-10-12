-- CreateTable
CREATE TABLE `entry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accepted_story_suggested_id` INTEGER NULL,
    `accepted_story_kind_suggested_id` INTEGER NULL,
    `indexation_id` VARCHAR(20) NOT NULL,
    `position` INTEGER NOT NULL,
    `entrycomment` VARCHAR(2009) NULL,
    `part` VARCHAR(5) NULL,
    `title` VARCHAR(100) NULL,
    `entirepages` INTEGER NOT NULL,
    `brokenpagenumerator` INTEGER NOT NULL DEFAULT 0,
    `brokenpagedenominator` INTEGER NOT NULL DEFAULT 1,

    INDEX `entry_story_kind_suggestion_id_fk`(`accepted_story_kind_suggested_id`),
    INDEX `entry_story_suggestion_id_fk`(`accepted_story_suggested_id`),
    INDEX `entry_indexation_id_fk`(`indexation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(255) NOT NULL,
    `ai_ocr_result_id` INTEGER NULL,
    `ai_story_search_result_id` INTEGER NULL,
    `ai_kumiko_result_id` INTEGER NULL,

    UNIQUE INDEX `image_url_uindex`(`url`),
    INDEX `image_ai_kumiko_result_id_fk`(`ai_kumiko_result_id`),
    INDEX `image_ai_story_search_result_id_fk`(`ai_story_search_result_id`),
    INDEX `image_ai_ocr_result_id_fk`(`ai_ocr_result_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page_number` SMALLINT NOT NULL,
    `indexation_id` VARCHAR(20) NOT NULL,
    `image_id` INTEGER NULL,

    INDEX `page_image_id_fk`(`image_id`),
    UNIQUE INDEX `page_indexation_id_page_number_uindex`(`indexation_id`, `page_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `indexation` (
    `id` VARCHAR(20) NOT NULL,
    `accepted_issue_suggestion_id` INTEGER NULL,
    `dm_user_id` INTEGER NOT NULL,
    `price` VARCHAR(150) NULL,
    `release_date` VARCHAR(10) NULL,

    INDEX `indexation_issue_suggestion_id_fk`(`accepted_issue_suggestion_id`),
    INDEX `indexation_user_dm_id_fk`(`dm_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `story_kind_suggestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kind_number_of_rows` VARCHAR(4) NOT NULL,
    `entry_id` INTEGER NOT NULL,
    `ai_kumiko_result_id` INTEGER NULL,

    INDEX `story_kind_suggestion_entry_id_fk`(`entry_id`),
    INDEX `story_kind_suggestion_story_kind_rows_id_fk`(`kind_number_of_rows`),
    INDEX `story_kind_suggestion_ai_kumiko_result_id_fk`(`ai_kumiko_result_id`),
    UNIQUE INDEX `story_kind_suggestion_unique`(`entry_id`, `kind_number_of_rows`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `story_suggestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storycode` VARCHAR(19) NOT NULL,
    `entry_id` INTEGER NOT NULL,
    `ai_story_suggestion_id` INTEGER NULL,

    INDEX `story_suggestion_ai_story_suggestion_id_fk`(`ai_story_suggestion_id`),
    UNIQUE INDEX `story_suggestion_entry_id_storycode_uindex`(`entry_id`, `storycode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `issue_suggestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `indexation_id` VARCHAR(20) NOT NULL,
    `publicationcode` VARCHAR(12) NOT NULL,
    `issuenumber` VARCHAR(13) NOT NULL,
    `story_search_possible_story_id` INTEGER NULL,

    INDEX `issue_suggestion_indexation_id_fk`(`indexation_id`),
    INDEX `issue_suggestion_ai_story_search_result_id_fk`(`story_search_possible_story_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_story_search_result` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_story_search_possible_story` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `score` SMALLINT NOT NULL,

    INDEX `ai_story_search_possible_story_ai_story_search_result_id_fk`(`result_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_ocr_possible_story` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `score` SMALLINT NOT NULL,
    `result_id` INTEGER NOT NULL,

    INDEX `ai_ocr_possible_story_ai_ocr_result_id_fk`(`result_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_ocr_result` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_ocr_result_match` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `x1` INTEGER NOT NULL,
    `x2` INTEGER NOT NULL,
    `y1` INTEGER NOT NULL,
    `y2` INTEGER NOT NULL,
    `text` TEXT NOT NULL,
    `confidence` FLOAT NOT NULL,

    INDEX `ai_ocr_result_id_index`(`result_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_kumiko_result_panel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result_id` INTEGER NOT NULL,
    `x` SMALLINT NOT NULL,
    `y` SMALLINT NOT NULL,
    `width` SMALLINT NOT NULL,
    `height` SMALLINT NOT NULL,

    INDEX `ai_kumiko_result_panel_result_id_fk`(`result_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_kumiko_result` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ai_kumiko_inferred_story_kind_rows` VARCHAR(4) NULL,

    INDEX `ai_kumiko_result_story_kind_rows_id_fk`(`ai_kumiko_inferred_story_kind_rows`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_story_suggestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ocr_possible_story_id` INTEGER NULL,
    `story_search_possible_story_id` INTEGER NULL,

    UNIQUE INDEX `ai_ocr_possible_story_id_unique`(`ocr_possible_story_id`),
    UNIQUE INDEX `ai_story_search_possible_story_id_unique`(`story_search_possible_story_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `dm_id` INTEGER NOT NULL,
    `inducks_username` VARCHAR(64) NULL,

    PRIMARY KEY (`dm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `story_kind_rows` (
    `id` VARCHAR(4) NOT NULL,
    `kind` ENUM('a', 'c', 'f', 'g', 'i', 'k', 'n', 't', 'L', 'P') NOT NULL,
    `number_of_rows` TINYINT NOT NULL,

    UNIQUE INDEX `story_kind_rows_pk`(`kind`, `number_of_rows`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `entry` ADD CONSTRAINT `entry_indexation_id_fk` FOREIGN KEY (`indexation_id`) REFERENCES `indexation`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `entry` ADD CONSTRAINT `entry_story_kind_suggestion_id_fk` FOREIGN KEY (`accepted_story_kind_suggested_id`) REFERENCES `story_kind_suggestion`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `entry` ADD CONSTRAINT `entry_story_suggestion_id_fk` FOREIGN KEY (`accepted_story_suggested_id`) REFERENCES `story_suggestion`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `image` ADD CONSTRAINT `image_ai_kumiko_result_id_fk` FOREIGN KEY (`ai_kumiko_result_id`) REFERENCES `ai_kumiko_result`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `image` ADD CONSTRAINT `image_ai_ocr_result_id_fk` FOREIGN KEY (`ai_ocr_result_id`) REFERENCES `ai_ocr_result`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `image` ADD CONSTRAINT `image_ai_story_search_result_id_fk` FOREIGN KEY (`ai_story_search_result_id`) REFERENCES `ai_story_search_result`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `page` ADD CONSTRAINT `page_image_id_fk` FOREIGN KEY (`image_id`) REFERENCES `image`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `page` ADD CONSTRAINT `page_indexation_id_fk` FOREIGN KEY (`indexation_id`) REFERENCES `indexation`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `indexation` ADD CONSTRAINT `indexation_issue_suggestion_id_fk` FOREIGN KEY (`accepted_issue_suggestion_id`) REFERENCES `issue_suggestion`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `indexation` ADD CONSTRAINT `indexation_user_dm_id_fk` FOREIGN KEY (`dm_user_id`) REFERENCES `user`(`dm_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_kind_suggestion` ADD CONSTRAINT `story_kind_suggestion_ai_kumiko_result_id_fk` FOREIGN KEY (`ai_kumiko_result_id`) REFERENCES `ai_kumiko_result`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_kind_suggestion` ADD CONSTRAINT `story_kind_suggestion_entry_id_fk` FOREIGN KEY (`entry_id`) REFERENCES `entry`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_kind_suggestion` ADD CONSTRAINT `story_kind_suggestion_story_kind_rows_id_fk` FOREIGN KEY (`kind_number_of_rows`) REFERENCES `story_kind_rows`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_suggestion` ADD CONSTRAINT `story_suggestion_ai_story_suggestion_id_fk` FOREIGN KEY (`ai_story_suggestion_id`) REFERENCES `ai_story_suggestion`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_suggestion` ADD CONSTRAINT `story_suggestion_entry_id_fk` FOREIGN KEY (`entry_id`) REFERENCES `entry`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `issue_suggestion` ADD CONSTRAINT `issue_suggestion_ai_story_search_result_id_fk` FOREIGN KEY (`story_search_possible_story_id`) REFERENCES `ai_story_search_result`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `issue_suggestion` ADD CONSTRAINT `issue_suggestion_indexation_id_fk` FOREIGN KEY (`indexation_id`) REFERENCES `indexation`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_story_search_possible_story` ADD CONSTRAINT `ai_story_search_result_ai_story_search_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `ai_story_search_result`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_ocr_possible_story` ADD CONSTRAINT `ai_ocr_possible_story_ai_ocr_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `ai_ocr_result`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_ocr_result_match` ADD CONSTRAINT `ai_ocr_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `ai_ocr_result`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_kumiko_result_panel` ADD CONSTRAINT `ai_kumiko_result_panel_result_id_fk` FOREIGN KEY (`result_id`) REFERENCES `ai_kumiko_result`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_kumiko_result` ADD CONSTRAINT `ai_kumiko_result_story_kind_rows_id_fk` FOREIGN KEY (`ai_kumiko_inferred_story_kind_rows`) REFERENCES `story_kind_rows`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_story_suggestion` ADD CONSTRAINT `ai_story_suggestion_ai_ocr_possible_story_id_fk` FOREIGN KEY (`ocr_possible_story_id`) REFERENCES `ai_ocr_possible_story`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_story_suggestion` ADD CONSTRAINT `ai_story_suggestion_ai_story_search_possible_story_id_fk` FOREIGN KEY (`story_search_possible_story_id`) REFERENCES `ai_story_search_possible_story`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

