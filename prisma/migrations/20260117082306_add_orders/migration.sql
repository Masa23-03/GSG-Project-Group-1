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
CREATE TABLE `orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `patient_id` BIGINT UNSIGNED NOT NULL,
    `address_id` BIGINT UNSIGNED NULL,
    `delivery_city` VARCHAR(255) NOT NULL,
    `delivery_area` VARCHAR(255) NULL,
    `delivery_address_line` TEXT NOT NULL,
    `contact_name` VARCHAR(255) NOT NULL,
    `contact_phone` VARCHAR(255) NOT NULL,
    `subtotal_amount` DECIMAL(10, 7) NOT NULL,
    `original_subtotal_amount` DECIMAL(10, 7) NULL,
    `discount_amount` DECIMAL(10, 7) NOT NULL DEFAULT 0,
    `delivery_fee_amount` DECIMAL(10, 7) NOT NULL DEFAULT 0,
    `total_amount` DECIMAL(10, 7) NOT NULL,
    `original_total_amount` DECIMAL(10, 7) NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'ILS',
    `items_count` INTEGER NOT NULL,
    `original_items_count` INTEGER NULL,
    `status` ENUM('PENDING', 'PARTIALLY_ACCEPTED', 'ACCEPTED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `delivery_type` ENUM('STANDARD', 'EXPRESS') NOT NULL DEFAULT 'STANDARD',
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_orders_patient_status`(`patient_id`, `status`),
    INDEX `idx_orders_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `patient_addresses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
