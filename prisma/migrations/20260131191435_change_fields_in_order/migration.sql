/*
  Warnings:

  - You are about to alter the column `last_location_at` on the `drivers` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `reviewed_at` on the `drivers` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `verified_at` on the `otps` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `sent_at` on the `otps` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `reviewed_at` on the `pharmacies` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `picked_up_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `accepted_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `rejected_at` on the `pharmacy_orders` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `reupload_requested_at` on the `prescriptions` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `expires_at` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `revoked_at` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - Added the required column `contact_email` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `drivers` MODIFY `last_location_at` TIMESTAMP NULL,
    MODIFY `reviewed_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `contact_email` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `otps` MODIFY `verified_at` TIMESTAMP NULL,
    MODIFY `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE `pharmacies` MODIFY `reviewed_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `pharmacy_orders` MODIFY `picked_up_at` TIMESTAMP NULL,
    MODIFY `accepted_at` TIMESTAMP NULL,
    MODIFY `rejected_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `prescriptions` MODIFY `reupload_requested_at` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `expires_at` TIMESTAMP NOT NULL,
    MODIFY `revoked_at` TIMESTAMP NULL;
