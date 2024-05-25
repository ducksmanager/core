/*
  Warnings:

  - You are about to alter the column `kind` on the `story_kind_suggestion` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(1)`.
  - Added the required column `dm_user_id` to the `indexation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `entry` ADD COLUMN `entrycomment` VARCHAR(2009) NULL,
    ADD COLUMN `part` VARCHAR(5) NULL,
    ADD COLUMN `title` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `indexation` ADD COLUMN `accepted_issue_suggestion_id` INTEGER NULL,
    ADD COLUMN `dm_user_id` INTEGER NOT NULL,
    MODIFY `issuecode` VARCHAR(9) NULL;

-- AlterTable
ALTER TABLE `story_kind_suggestion` MODIFY `kind` VARCHAR(1) NOT NULL;

-- AlterTable
ALTER TABLE `story_suggestion` ADD COLUMN `ocr_results` LONGTEXT NULL;

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

-- CreateIndex
CREATE INDEX `entry_story_kind_suggestion_id_fk` ON `entry`(`accepted_story_kind_suggested_id`);

-- CreateIndex
CREATE INDEX `entry_story_suggestion_id_fk` ON `entry`(`accepted_story_suggested_id`);

-- CreateIndex
CREATE INDEX `indexation_issue_suggestion_id_fk` ON `indexation`(`accepted_issue_suggestion_id`);

-- AddForeignKey
ALTER TABLE `entry` ADD CONSTRAINT `entry_story_kind_suggestion_id_fk` FOREIGN KEY (`accepted_story_kind_suggested_id`) REFERENCES `story_kind_suggestion`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `entry` ADD CONSTRAINT `entry_story_suggestion_id_fk` FOREIGN KEY (`accepted_story_suggested_id`) REFERENCES `story_suggestion`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `indexation` ADD CONSTRAINT `indexation_issue_suggestion_id_fk` FOREIGN KEY (`accepted_issue_suggestion_id`) REFERENCES `issue_suggestion`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `issue_suggestion` ADD CONSTRAINT `issue_suggestion_indexation_id_fk` FOREIGN KEY (`indexation_id`) REFERENCES `indexation`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
