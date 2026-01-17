/*
  Warnings:

  - You are about to alter the column `verified_at` on the `drivers` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `verified_at` on the `pharmacies` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `picked_up_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `accepted_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `rejected_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `drivers` MODIFY `verified_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `pharmacies` MODIFY `verified_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `pharmacy_orders` MODIFY `picked_up_at` TIMESTAMP NULL,
    MODIFY `accepted_at` TIMESTAMP NULL,
    MODIFY `rejected_at` TIMESTAMP NULL;

-- CreateTable
CREATE TABLE `prescriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `pharmacy_order_id` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('UNDER_REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'UNDER_REVIEW',
    `reupload_reason` TEXT NULL,
    `reupload_requested_at` TIMESTAMP NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_prescriptions_pharmacy_order`(`pharmacy_order_id`),
    INDEX `idx_prescriptions_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_pharmacy_order_id_fkey` FOREIGN KEY (`pharmacy_order_id`) REFERENCES `pharmacy_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
