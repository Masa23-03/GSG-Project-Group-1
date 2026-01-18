/*
  Warnings:

  - You are about to alter the column `verified_at` on the `drivers` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `verified_at` on the `pharmacies` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to drop the `delivery` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `drivers` MODIFY `verified_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `pharmacies` MODIFY `verified_at` TIMESTAMP NULL;

-- DropTable
DROP TABLE `delivery`;

-- CreateTable
CREATE TABLE `deliveries` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `driver_id` BIGINT UNSIGNED NULL,
    `status` ENUM('PENDING', 'ASSIGNED', 'PICKUP_IN_PROGRESS', 'EN_ROUTE', 'DELIVERED') NOT NULL DEFAULT 'PENDING',
    `confirmation_method` ENUM('PHOTO', 'OTP') NULL,
    `confirmation_photo_url` VARCHAR(255) NULL,
    `confirmation_otp_hash` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `accepted_at` DATETIME(0) NULL,
    `delivered_at` DATETIME(0) NULL,

    UNIQUE INDEX `deliveries_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_driver_id_fkey` FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
