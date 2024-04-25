-- AlterTable
ALTER TABLE `PackPage` ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'PageType.info';

-- AlterTable
ALTER TABLE `PackPageItem` ADD COLUMN `notDeletable` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `position` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `PackPageItemBodyContent` ADD COLUMN `isCorrectAnswer` BOOLEAN NULL;

-- CreateTable
CREATE TABLE `EventLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `platform` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `event` VARCHAR(191) NULL,
    `stackTrace` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
