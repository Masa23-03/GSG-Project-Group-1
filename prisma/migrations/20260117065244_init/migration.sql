-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('PATIENT', 'PHARMACY', 'DRIVER', 'ADMIN') NOT NULL DEFAULT 'PATIENT',
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `name` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(255) NOT NULL,
    `dateOfBirth` DATE NULL,
    `profile_image_url` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `idx_users_role`(`role`),
    INDEX `idx_users_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pharmacies` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `verifiedBy` BIGINT UNSIGNED NULL,
    `pharmacy_name` VARCHAR(255) NOT NULL,
    `license_number` VARCHAR(255) NOT NULL,
    `license_document_url` VARCHAR(255) NULL,
    `city` VARCHAR(255) NOT NULL,
    `address` TEXT NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `cover_image_url` VARCHAR(255) NULL,
    `verification_status` ENUM('UNDER_REVIEW', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'UNDER_REVIEW',
    `verified_at` TIMESTAMP NULL,
    `work_open_time` DATETIME NULL,
    `work_close_time` DATETIME NULL,
    `avg_prep_time_minutes` TINYINT NOT NULL DEFAULT 10,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `pharmacies_userId_key`(`userId`),
    UNIQUE INDEX `pharmacies_license_number_key`(`license_number`),
    INDEX `idx_pharmacies_verified`(`verification_status`),
    INDEX `idx_pharmacies_cities`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `drivers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,
    `verifiedBy` BIGINT UNSIGNED NULL,
    `verified_at` TIMESTAMP NULL,
    `vehicle_name` VARCHAR(255) NOT NULL,
    `vehicle_plate` VARCHAR(255) NOT NULL,
    `license_document_url` VARCHAR(255) NOT NULL,
    `current_city` VARCHAR(255) NOT NULL,
    `current_area` VARCHAR(255) NULL,
    `availability_status` ENUM('ONLINE', 'OFFLINE') NOT NULL DEFAULT 'OFFLINE',
    `verification_status` ENUM('UNDER_REVIEW', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'UNDER_REVIEW',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `drivers_userId_key`(`userId`),
    UNIQUE INDEX `drivers_vehicle_plate_key`(`vehicle_plate`),
    INDEX `idx_drivers_verified`(`verification_status`),
    INDEX `idx_drivers_availability`(`availability_status`),
    INDEX `idx_drivers_cities`(`current_city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pharmacies` ADD CONSTRAINT `pharmacies_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacies` ADD CONSTRAINT `pharmacies_verifiedBy_fkey` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `drivers` ADD CONSTRAINT `drivers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `drivers` ADD CONSTRAINT `drivers_verifiedBy_fkey` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
