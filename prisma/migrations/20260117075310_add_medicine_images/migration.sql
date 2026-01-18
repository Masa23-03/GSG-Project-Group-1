/*
  Warnings:

  - You are about to alter the column `verified_at` on the `drivers` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `verified_at` on the `pharmacies` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `drivers` MODIFY `verified_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `pharmacies` MODIFY `verified_at` TIMESTAMP NULL;

-- CreateTable
CREATE TABLE `medicine_images` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `medicine_id` BIGINT UNSIGNED NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `sort_order` TINYINT NOT NULL,

    INDEX `idx_medicine_images_medicine_id`(`medicine_id`),
    UNIQUE INDEX `uq_medicine_images_medicine_sort`(`medicine_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `medicine_images` ADD CONSTRAINT `medicine_images_medicine_id_fkey` FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
