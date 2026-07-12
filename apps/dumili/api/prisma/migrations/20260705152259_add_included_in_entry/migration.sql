-- AlterTable
ALTER TABLE `entry` ADD COLUMN `included_in_entry_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `entry_included_in_entry_id_fk` ON `entry`(`included_in_entry_id`);

-- AddForeignKey
ALTER TABLE `entry` ADD CONSTRAINT `entry_included_in_entry_id_fk` FOREIGN KEY (`included_in_entry_id`) REFERENCES `entry`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
