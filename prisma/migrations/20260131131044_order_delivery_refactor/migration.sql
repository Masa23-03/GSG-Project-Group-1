/*
  Warnings:

  - You are about to alter the column `last_location_at` on the `drivers` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `reviewed_at` on the `drivers` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to drop the column `delivery_area` on the `orders` table. All the data in the column will be lost.
  - You are about to alter the column `verified_at` on the `otps` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `sent_at` on the `otps` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `reviewed_at` on the `pharmacies` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `price_per_item` on the `pharmacy_order_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,7)` to `Decimal(10,2)`.
  - You are about to alter the column `total` on the `pharmacy_order_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,7)` to `Decimal(10,2)`.
  - You are about to drop the column `delivery_fee` on the `pharmacy_orders` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal_amount` on the `pharmacy_orders` table. All the data in the column will be lost.
  - You are about to alter the column `picked_up_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `accepted_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `rejected_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `reupload_requested_at` on the `prescriptions` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `expires_at` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `revoked_at` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `drivers` MODIFY `last_location_at` TIMESTAMP NULL,
    MODIFY `reviewed_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `delivery_area`,
    ADD COLUMN `delivery_latitude` DECIMAL(10, 8) NULL,
    ADD COLUMN `delivery_longitude` DECIMAL(11, 8) NULL;

-- AlterTable
ALTER TABLE `otps` MODIFY `verified_at` TIMESTAMP NULL,
    MODIFY `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE `payments` ADD COLUMN `method` ENUM('COD', 'CREDIT_CARD') NOT NULL DEFAULT 'COD';

-- AlterTable
ALTER TABLE `pharmacies` MODIFY `reviewed_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `pharmacy_order_items` MODIFY `price_per_item` DECIMAL(10, 2) NOT NULL,
    MODIFY `total` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `pharmacy_orders` DROP COLUMN `delivery_fee`,
    DROP COLUMN `subtotal_amount`,
    MODIFY `picked_up_at` TIMESTAMP NULL,
    MODIFY `requires_prescription` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `accepted_at` TIMESTAMP NULL,
    MODIFY `rejected_at` TIMESTAMP NULL,
    MODIFY `rejection_reason` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `prescriptions` MODIFY `reupload_requested_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `expires_at` TIMESTAMP NOT NULL,
    MODIFY `revoked_at` TIMESTAMP NULL;
