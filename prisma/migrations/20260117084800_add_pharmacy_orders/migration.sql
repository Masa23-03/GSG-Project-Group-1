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
CREATE TABLE `pharmacy_orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `pharmacy_id` BIGINT UNSIGNED NOT NULL,
    `delivery_id` BIGINT UNSIGNED NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `pickup_order` SMALLINT NULL,
    `picked_up_at` TIMESTAMP NULL,
    `requires_prescription` BOOLEAN NOT NULL,
    `subtotal_amount` DECIMAL(10, 7) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'ILS',
    `accepted_at` TIMESTAMP NULL,
    `rejected_at` TIMESTAMP NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_pharmacy_orders_order`(`order_id`),
    INDEX `idx_pharmacy_orders_pharmacy_status`(`pharmacy_id`, `status`),
    INDEX `idx_pharmacy_orders_delivery`(`delivery_id`),
    UNIQUE INDEX `uq_pharmacy_orders_order_pharmacy`(`order_id`, `pharmacy_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pharmacy_orders` ADD CONSTRAINT `pharmacy_orders_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacy_orders` ADD CONSTRAINT `pharmacy_orders_pharmacy_id_fkey` FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacy_orders` ADD CONSTRAINT `pharmacy_orders_delivery_id_fkey` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
