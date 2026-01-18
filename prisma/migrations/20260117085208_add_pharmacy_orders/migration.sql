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
CREATE TABLE `pharmacy_order_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `pharmacy_order_id` BIGINT UNSIGNED NOT NULL,
    `inventory_item_id` BIGINT UNSIGNED NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price_per_item` DECIMAL(10, 7) NOT NULL,
    `total` DECIMAL(10, 7) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'ILS',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_pharmacy_order_items_order`(`pharmacy_order_id`),
    INDEX `idx_pharmacy_order_items_inventory`(`inventory_item_id`),
    UNIQUE INDEX `uq_pharmacy_order_items_order_inventory`(`pharmacy_order_id`, `inventory_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pharmacy_order_items` ADD CONSTRAINT `pharmacy_order_items_pharmacy_order_id_fkey` FOREIGN KEY (`pharmacy_order_id`) REFERENCES `pharmacy_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacy_order_items` ADD CONSTRAINT `pharmacy_order_items_inventory_item_id_fkey` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
