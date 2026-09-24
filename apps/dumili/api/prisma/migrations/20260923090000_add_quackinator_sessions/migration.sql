-- CreateTable
CREATE TABLE `quackinator_session` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entry_id` INTEGER NOT NULL,
    `remote_session_id` VARCHAR(32) NULL,
    `index_fingerprint` VARCHAR(64) NULL,

    UNIQUE INDEX `quackinator_session_entry_id_uindex`(`entry_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quackinator_answer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `session_id` INTEGER NOT NULL,
    `family` ENUM('char', 'plot') NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `option` TINYINT NULL,
    `position` INTEGER NOT NULL,

    UNIQUE INDEX `quackinator_answer_unique`(`session_id`, `family`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `story_suggestion` ADD COLUMN `quackinator_session_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `story_suggestion_quackinator_session_id_fk` ON `story_suggestion`(`quackinator_session_id`);

-- AddForeignKey
ALTER TABLE `quackinator_session` ADD CONSTRAINT `quackinator_session_entry_id_fk` FOREIGN KEY (`entry_id`) REFERENCES `entry`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `quackinator_answer` ADD CONSTRAINT `quackinator_answer_session_id_fk` FOREIGN KEY (`session_id`) REFERENCES `quackinator_session`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `story_suggestion` ADD CONSTRAINT `story_suggestion_quackinator_session_id_fk` FOREIGN KEY (`quackinator_session_id`) REFERENCES `quackinator_session`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
