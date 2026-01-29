/*
  Warnings:

  - You are about to drop the column `verifiedBy` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `verified_at` on the `drivers` table. All the data in the column will be lost.
  - You are about to alter the column `last_location_at` on the `drivers` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `verified_at` on the `otps` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `sent_at` on the `otps` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to drop the column `country` on the `patient_addresses` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedBy` on the `pharmacies` table. All the data in the column will be lost.
  - You are about to drop the column `verified_at` on the `pharmacies` table. All the data in the column will be lost.
  - You are about to alter the column `picked_up_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `accepted_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `rejected_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `reupload_requested_at` on the `prescriptions` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `expires_at` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `revoked_at` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - A unique constraint covering the columns `[name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cityId` to the `patient_addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rejection_reason` to the `pharmacy_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_amount` to the `pharmacy_orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `drivers` DROP FOREIGN KEY `drivers_verifiedBy_fkey`;

-- DropForeignKey
ALTER TABLE `pharmacies` DROP FOREIGN KEY `pharmacies_verifiedBy_fkey`;

-- DropIndex
DROP INDEX `drivers_verifiedBy_fkey` ON `drivers`;

-- DropIndex
DROP INDEX `pharmacies_verifiedBy_fkey` ON `pharmacies`;

-- AlterTable
ALTER TABLE `drivers` DROP COLUMN `verifiedBy`,
    DROP COLUMN `verified_at`,
    ADD COLUMN `reviewedBy` INTEGER UNSIGNED NULL,
    ADD COLUMN `reviewed_at` TIMESTAMP NULL,
    MODIFY `last_location_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `medicines` ADD COLUMN `created_by_user_id` INTEGER UNSIGNED NULL,
    ADD COLUMN `min_price` DECIMAL(10, 8) NULL,
    ADD COLUMN `rejection_reason` VARCHAR(255) NULL,
    ADD COLUMN `requested_by_pharmacy_id` INTEGER UNSIGNED NULL,
    ADD COLUMN `reviewed_at` DATETIME(3) NULL,
    ADD COLUMN `reviewed_by` INTEGER UNSIGNED NULL;

-- AlterTable
ALTER TABLE `otps` MODIFY `verified_at` TIMESTAMP NULL,
    MODIFY `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE `patient_addresses` DROP COLUMN `country`,
    ADD COLUMN `cityId` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `pharmacies` DROP COLUMN `verifiedBy`,
    DROP COLUMN `verified_at`,
    ADD COLUMN `reviewedBy` INTEGER UNSIGNED NULL,
    ADD COLUMN `reviewed_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `pharmacy_orders` ADD COLUMN `delivery_fee` DECIMAL(10, 2) NULL,
    ADD COLUMN `rejection_reason` VARCHAR(255) NOT NULL,
    ADD COLUMN `total_amount` DECIMAL(10, 2) NOT NULL,
    MODIFY `picked_up_at` TIMESTAMP NULL,
    MODIFY `accepted_at` TIMESTAMP NULL,
    MODIFY `rejected_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `prescriptions` MODIFY `reupload_requested_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `expires_at` TIMESTAMP NOT NULL,
    MODIFY `revoked_at` TIMESTAMP NULL;

-- CreateIndex
CREATE UNIQUE INDEX `uq_categories_name` ON `categories`(`name`);

-- AddForeignKey
ALTER TABLE `pharmacies` ADD CONSTRAINT `pharmacies_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `drivers` ADD CONSTRAINT `drivers_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_addresses` ADD CONSTRAINT `patient_addresses_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicines` ADD CONSTRAINT `medicines_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicines` ADD CONSTRAINT `medicines_requested_by_pharmacy_id_fkey` FOREIGN KEY (`requested_by_pharmacy_id`) REFERENCES `pharmacies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicines` ADD CONSTRAINT `medicines_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
