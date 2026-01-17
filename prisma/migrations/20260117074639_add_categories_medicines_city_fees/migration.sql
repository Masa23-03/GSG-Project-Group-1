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
CREATE TABLE `city_delivery_fees` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `city` VARCHAR(255) NOT NULL,
    `standard_fee_amount` DECIMAL(10, 7) NOT NULL DEFAULT 0,
    `express_fee_amount` DECIMAL(10, 7) NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'ILS',

    UNIQUE INDEX `city_delivery_fees_city_key`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `categoryImageUrl` VARCHAR(255) NULL,
    `description` MEDIUMTEXT NULL,

    INDEX `idx_categories_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicines` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `generic_name` VARCHAR(255) NOT NULL,
    `brand_name` VARCHAR(255) NULL,
    `manufacturer` VARCHAR(255) NULL,
    `dosage_form` VARCHAR(255) NULL,
    `strength_value` DECIMAL(10, 7) NULL,
    `strength_unit` VARCHAR(255) NULL,
    `pack_size` INTEGER NULL,
    `pack_unit` VARCHAR(255) NULL,
    `requires_prescription` BOOLEAN NOT NULL DEFAULT false,
    `active_ingredients` LONGTEXT NULL,
    `dosage_instructions` LONGTEXT NULL,
    `storage_instructions` LONGTEXT NULL,
    `warnings` LONGTEXT NULL,
    `description` LONGTEXT NOT NULL,
    `status` ENUM('APPROVED', 'PENDING', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `max_price` DECIMAL(10, 8) NULL,

    INDEX `idx_medicines_category_active_status`(`category_id`, `is_active`, `status`),
    INDEX `idx_medicines_generic_name`(`generic_name`),
    INDEX `idx_medicines_brand_name`(`brand_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `medicines` ADD CONSTRAINT `medicines_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
