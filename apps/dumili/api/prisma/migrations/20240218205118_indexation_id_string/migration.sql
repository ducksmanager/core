/*
  Warnings:

  - The primary key for the `indexation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `indexation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `page` DROP FOREIGN KEY `page_indexation_id_fk`;

-- DropIndex
DROP INDEX `indexation_name_uindex` ON `indexation`;

-- AlterTable
ALTER TABLE `indexation` DROP PRIMARY KEY,
    DROP COLUMN `name`,
    MODIFY `id` VARCHAR(20) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `page` MODIFY `indexation_id` VARCHAR(20) NOT NULL;

-- AddForeignKey
ALTER TABLE `page` ADD CONSTRAINT `page_indexation_id_fk` FOREIGN KEY (`indexation_id`) REFERENCES `indexation`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
