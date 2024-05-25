-- AlterTable
ALTER TABLE `entry` MODIFY `indexation_id` VARCHAR(20) NOT NULL;

-- AddForeignKey
ALTER TABLE `entry` ADD CONSTRAINT `entry_indexation_id_fk` FOREIGN KEY (`indexation_id`) REFERENCES `indexation`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
