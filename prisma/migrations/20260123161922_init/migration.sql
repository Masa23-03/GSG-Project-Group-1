-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` INTEGER UNSIGNED NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expires_at` TIMESTAMP NOT NULL,
    `revoked_at` TIMESTAMP NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `idx_tokens_user`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
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
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` INTEGER UNSIGNED NOT NULL,
    `verifiedBy` INTEGER UNSIGNED NULL,
    `pharmacy_name` VARCHAR(255) NOT NULL,
    `license_number` VARCHAR(255) NOT NULL,
    `license_document_url` VARCHAR(255) NULL,
    `city` VARCHAR(255) NOT NULL,
    `address` TEXT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `cover_image_url` VARCHAR(255) NULL,
    `verification_status` ENUM('UNDER_REVIEW', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'UNDER_REVIEW',
    `verified_at` TIMESTAMP NULL,
    `work_open_time` TIME NULL,
    `work_close_time` TIME NULL,
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
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` INTEGER UNSIGNED NOT NULL,
    `verifiedBy` INTEGER UNSIGNED NULL,
    `verified_at` TIMESTAMP NULL,
    `vehicle_name` VARCHAR(255) NOT NULL,
    `vehicle_plate` VARCHAR(255) NOT NULL,
    `license_document_url` VARCHAR(255) NOT NULL,
    `availability_status` ENUM('ONLINE', 'OFFLINE') NOT NULL DEFAULT 'OFFLINE',
    `verification_status` ENUM('UNDER_REVIEW', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'UNDER_REVIEW',
    `last_latitude` DECIMAL(10, 8) NULL,
    `last_longitude` DECIMAL(11, 8) NULL,
    `license_number` VARCHAR(255) NULL,
    `last_location_at` TIMESTAMP NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `drivers_userId_key`(`userId`),
    UNIQUE INDEX `drivers_vehicle_plate_key`(`vehicle_plate`),
    UNIQUE INDEX `drivers_license_number_key`(`license_number`),
    INDEX `idx_drivers_verified`(`verification_status`),
    INDEX `idx_drivers_availability`(`availability_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deliveries` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER UNSIGNED NOT NULL,
    `driver_id` INTEGER UNSIGNED NULL,
    `status` ENUM('PENDING', 'ASSIGNED', 'PICKUP_IN_PROGRESS', 'EN_ROUTE', 'DELIVERED') NOT NULL DEFAULT 'PENDING',
    `confirmation_method` ENUM('PHOTO', 'OTP') NULL,
    `confirmation_photo_url` VARCHAR(255) NULL,
    `confirmation_otp_hash` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `accepted_at` DATETIME(0) NULL,
    `delivered_at` DATETIME(0) NULL,

    UNIQUE INDEX `deliveries_order_id_key`(`order_id`),
    INDEX `idx_deliveries_driver`(`driver_id`),
    INDEX `idx_deliveries_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_addresses` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` INTEGER UNSIGNED NOT NULL,
    `label` VARCHAR(255) NULL,
    `area` VARCHAR(255) NULL,
    `region` VARCHAR(255) NULL,
    `country` VARCHAR(255) NULL,
    `addressLine1` TEXT NOT NULL,
    `addressLine2` TEXT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_addresses_user`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `city_delivery_fees` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `city` VARCHAR(255) NOT NULL,
    `standard_fee_amount` DECIMAL(10, 7) NOT NULL DEFAULT 0,
    `express_fee_amount` DECIMAL(10, 7) NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'ILS',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `city_delivery_fees_city_key`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `categoryImageUrl` VARCHAR(255) NULL,
    `description` MEDIUMTEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_categories_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicines` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER UNSIGNED NOT NULL,
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
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_medicines_category_active_status`(`category_id`, `is_active`, `status`),
    INDEX `idx_medicines_generic_name`(`generic_name`),
    INDEX `idx_medicines_brand_name`(`brand_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicine_images` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `medicine_id` INTEGER UNSIGNED NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `sort_order` TINYINT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_medicine_images_medicine_id`(`medicine_id`),
    UNIQUE INDEX `uq_medicine_images_medicine_sort`(`medicine_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_items` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `pharmacy_id` INTEGER UNSIGNED NOT NULL,
    `medicine_id` INTEGER UNSIGNED NOT NULL,
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

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER UNSIGNED NOT NULL,
    `address_id` INTEGER UNSIGNED NULL,
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

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER UNSIGNED NOT NULL,
    `amount` DECIMAL(10, 7) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'ILS',
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `payments_order_id_key`(`order_id`),
    INDEX `idx_payments_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pharmacy_orders` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER UNSIGNED NOT NULL,
    `pharmacy_id` INTEGER UNSIGNED NOT NULL,
    `delivery_id` INTEGER UNSIGNED NULL,
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

-- CreateTable
CREATE TABLE `pharmacy_order_items` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `pharmacy_order_id` INTEGER UNSIGNED NOT NULL,
    `inventory_item_id` INTEGER UNSIGNED NOT NULL,
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

-- CreateTable
CREATE TABLE `prescriptions` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `pharmacy_order_id` INTEGER UNSIGNED NOT NULL,
    `status` ENUM('UNDER_REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'UNDER_REVIEW',
    `reupload_reason` TEXT NULL,
    `reupload_requested_at` TIMESTAMP NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_prescriptions_pharmacy_order`(`pharmacy_order_id`),
    INDEX `idx_prescriptions_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prescription_files` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `prescription_id` INTEGER UNSIGNED NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `sort_order` SMALLINT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_prescription_files_prescription`(`prescription_id`),
    INDEX `idx_prescription_files_order`(`prescription_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacies` ADD CONSTRAINT `pharmacies_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacies` ADD CONSTRAINT `pharmacies_verifiedBy_fkey` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `drivers` ADD CONSTRAINT `drivers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `drivers` ADD CONSTRAINT `drivers_verifiedBy_fkey` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_driver_id_fkey` FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_addresses` ADD CONSTRAINT `patient_addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicines` ADD CONSTRAINT `medicines_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicine_images` ADD CONSTRAINT `medicine_images_medicine_id_fkey` FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_medicine_id_fkey` FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_items` ADD CONSTRAINT `inventory_items_pharmacy_id_fkey` FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `patient_addresses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacy_orders` ADD CONSTRAINT `pharmacy_orders_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacy_orders` ADD CONSTRAINT `pharmacy_orders_pharmacy_id_fkey` FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacy_orders` ADD CONSTRAINT `pharmacy_orders_delivery_id_fkey` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacy_order_items` ADD CONSTRAINT `pharmacy_order_items_pharmacy_order_id_fkey` FOREIGN KEY (`pharmacy_order_id`) REFERENCES `pharmacy_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pharmacy_order_items` ADD CONSTRAINT `pharmacy_order_items_inventory_item_id_fkey` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_pharmacy_order_id_fkey` FOREIGN KEY (`pharmacy_order_id`) REFERENCES `pharmacy_orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescription_files` ADD CONSTRAINT `prescription_files_prescription_id_fkey` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
