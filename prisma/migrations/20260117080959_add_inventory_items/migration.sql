/*
  Warnings:

  - You are about to alter the column `verified_at` on the `drivers` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `verified_at` on the `pharmacies` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - Added the required column `updated_at` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `city_delivery_fees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `medicine_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `medicines` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `categories` ADD COLUMN `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updated_at` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `city_delivery_fees` ADD COLUMN `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updated_at` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `delivery` ADD COLUMN `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updated_at` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `drivers` MODIFY `verified_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `medicine_images` ADD COLUMN `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updated_at` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `medicines` ADD COLUMN `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updated_at` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `pharmacies` MODIFY `verified_at` TIMESTAMP NULL;

-- CreateTable
CREATE TABLE `inventory_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `pharmacy_id` BIGINT UNSIGNED NOT NULL,
    `medicine_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `stock_quantity` INTEGER NOT NULL DEFAULT 0,
    `min_stock` INTEGER NOT NULL DEFAULT 0,
    `sell_price` DECIMAL(10, 8) NOT NULL,
    `cost_price` DECIMAL(10, 8) NULL,
    `batch_number` VARCHAR(255) NULL,
    `expiry_date` DATE NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `notes` LONGTEXT NULL,
    `shelf_location` VARCHAR(255) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `idx_inventory_pharmacy`(`pharmacy_id`),
    INDEX `idx_inventory_medicine`(`medicine_id`),
    INDEX `idx_inventory_pharmacy_expiry`(`pharmacy_id`, `expiry_date`),
    UNIQUE INDEX `uq_inventory_pharmacy_medicine`(`pharmacy_id`, `medicine_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_medicine_id_fkey` FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_pharmacy_id_fkey` FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
