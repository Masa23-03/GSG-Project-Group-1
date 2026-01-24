/*
  Warnings:

  - You are about to drop the column `city` on the `city_delivery_fees` table. All the data in the column will be lost.
  - You are about to alter the column `standard_fee_amount` on the `city_delivery_fees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,7)` to `Decimal(10,2)`.
  - You are about to alter the column `express_fee_amount` on the `city_delivery_fees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,7)` to `Decimal(10,2)`.
  - You are about to alter the column `currency` on the `city_delivery_fees` table. The data in that column could be lost. The data in that column will be cast from `Char(3)` to `Enum(EnumId(16))`.
  - You are about to alter the column `verified_at` on the `drivers` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `last_location_at` on the `drivers` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to drop the column `delivery_city` on the `orders` table. All the data in the column will be lost.
  - You are about to alter the column `subtotal_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,7)` to `Decimal(10,2)`.
  - You are about to alter the column `original_subtotal_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,7)` to `Decimal(10,2)`.
  - You are about to alter the column `discount_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,7)` to `Decimal(10,2)`.
  - You are about to alter the column `delivery_fee_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,7)` to `Decimal(10,2)`.
  - You are about to alter the column `total_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,7)` to `Decimal(10,2)`.
  - You are about to alter the column `original_total_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,7)` to `Decimal(10,2)`.
  - You are about to alter the column `currency` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Char(3)` to `Enum(EnumId(16))`.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,7)` to `Decimal(10,2)`.
  - You are about to alter the column `currency` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Char(3)` to `Enum(EnumId(16))`.
  - You are about to drop the column `city` on the `pharmacies` table. All the data in the column will be lost.
  - You are about to alter the column `verified_at` on the `pharmacies` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `currency` on the `pharmacy_order_items` table. The data in that column could be lost. The data in that column will be cast from `Char(3)` to `Enum(EnumId(16))`.
  - You are about to alter the column `picked_up_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `subtotal_amount` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,7)` to `Decimal(10,2)`.
  - You are about to alter the column `currency` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Char(3)` to `Enum(EnumId(16))`.
  - You are about to alter the column `accepted_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `rejected_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `reupload_requested_at` on the `prescriptions` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `expires_at` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `revoked_at` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - A unique constraint covering the columns `[cityId]` on the table `city_delivery_fees` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cityId` to the `city_delivery_fees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delivery_city_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cityId` to the `pharmacies` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `city_delivery_fees_city_key` ON `city_delivery_fees`;

-- DropIndex
DROP INDEX `idx_pharmacies_cities` ON `pharmacies`;

-- AlterTable
ALTER TABLE `city_delivery_fees` DROP COLUMN `city`,
    ADD COLUMN `cityId` INTEGER UNSIGNED NOT NULL,
    MODIFY `standard_fee_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    MODIFY `express_fee_amount` DECIMAL(10, 2) NULL,
    MODIFY `currency` ENUM('ILS', 'USD', 'JOD') NOT NULL DEFAULT 'ILS';

-- AlterTable
ALTER TABLE `drivers` MODIFY `verified_at` TIMESTAMP NULL,
    MODIFY `last_location_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `delivery_city`,
    ADD COLUMN `delivery_city_id` INTEGER UNSIGNED NOT NULL,
    MODIFY `subtotal_amount` DECIMAL(10, 2) NOT NULL,
    MODIFY `original_subtotal_amount` DECIMAL(10, 2) NULL,
    MODIFY `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    MODIFY `delivery_fee_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    MODIFY `total_amount` DECIMAL(10, 2) NOT NULL,
    MODIFY `original_total_amount` DECIMAL(10, 2) NULL,
    MODIFY `currency` ENUM('ILS', 'USD', 'JOD') NOT NULL DEFAULT 'ILS';

-- AlterTable
ALTER TABLE `payments` MODIFY `amount` DECIMAL(10, 2) NOT NULL,
    MODIFY `currency` ENUM('ILS', 'USD', 'JOD') NOT NULL DEFAULT 'ILS';

-- AlterTable
ALTER TABLE `pharmacies` DROP COLUMN `city`,
    ADD COLUMN `cityId` INTEGER UNSIGNED NOT NULL,
    MODIFY `verified_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `pharmacy_order_items` MODIFY `currency` ENUM('ILS', 'USD', 'JOD') NOT NULL DEFAULT 'ILS';

-- AlterTable
ALTER TABLE `pharmacy_orders` MODIFY `picked_up_at` TIMESTAMP NULL,
    MODIFY `subtotal_amount` DECIMAL(10, 2) NOT NULL,
    MODIFY `currency` ENUM('ILS', 'USD', 'JOD') NOT NULL DEFAULT 'ILS',
    MODIFY `accepted_at` TIMESTAMP NULL,
    MODIFY `rejected_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `prescriptions` MODIFY `reupload_requested_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `expires_at` TIMESTAMP NOT NULL,
    MODIFY `revoked_at` TIMESTAMP NULL;

-- CreateTable
CREATE TABLE `City` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `City_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `city_delivery_fees_cityId_key` ON `city_delivery_fees`(`cityId`);

-- AddForeignKey
ALTER TABLE `pharmacies` ADD CONSTRAINT `pharmacies_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `city_delivery_fees` ADD CONSTRAINT `city_delivery_fees_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_delivery_city_id_fkey` FOREIGN KEY (`delivery_city_id`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
