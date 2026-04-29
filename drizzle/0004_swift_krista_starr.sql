ALTER TABLE `properties` MODIFY COLUMN `deedType` enum('صك','وثيقة_ملكية') DEFAULT 'صك';--> statement-breakpoint
ALTER TABLE `properties` MODIFY COLUMN `propertyType` enum('فيلا','شقة','عمارة','مكتب','محل','مستودع','أرض','برج','مجمع','أخرى') DEFAULT 'أخرى';--> statement-breakpoint
ALTER TABLE `properties` MODIFY COLUMN `propertyUsage` enum('سكني','تجاري','صناعي','مختلط') DEFAULT 'سكني';--> statement-breakpoint
ALTER TABLE `properties` ADD `status` enum('نشط','غير_نشط','تحت_الإنشاء') DEFAULT 'نشط';--> statement-breakpoint
ALTER TABLE `properties` ADD `mainImageUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `properties` ADD `reportDate` date;--> statement-breakpoint
ALTER TABLE `properties` ADD `district` varchar(100);--> statement-breakpoint
ALTER TABLE `properties` ADD `nationalAddress` varchar(255);--> statement-breakpoint
ALTER TABLE `properties` ADD `buildingNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `properties` ADD `streetName` varchar(100);--> statement-breakpoint
ALTER TABLE `properties` ADD `postalCode` varchar(10);--> statement-breakpoint
ALTER TABLE `properties` ADD `additionalNumber` varchar(10);--> statement-breakpoint
ALTER TABLE `properties` ADD `deedIssueDate` date;--> statement-breakpoint
ALTER TABLE `properties` ADD `deedIssuer` varchar(255);--> statement-breakpoint
ALTER TABLE `properties` ADD `documentNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `properties` ADD `plotNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `properties` ADD `planNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `properties` ADD `deedArea` decimal(12,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `realEstateRegistrationNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `properties` ADD `realEstateRegistrationDate` date;--> statement-breakpoint
ALTER TABLE `properties` ADD `realEstateRegistrationStatus` enum('مسجل','غير_مسجل','تحت_الإجراء') DEFAULT 'غير_مسجل';--> statement-breakpoint
ALTER TABLE `properties` ADD `buildingType` enum('برج','فيلا','عمارة','مجمع','مستودع','أخرى') DEFAULT 'عمارة';--> statement-breakpoint
ALTER TABLE `properties` ADD `usagePurpose` varchar(255);--> statement-breakpoint
ALTER TABLE `properties` ADD `amenities` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `floorsCount` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `elevatorsCount` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `parkingCount` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `additionalFacilities` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `ownerNationality` varchar(50);--> statement-breakpoint
ALTER TABLE `properties` ADD `ownershipPercentage` decimal(5,2) DEFAULT '100';--> statement-breakpoint
ALTER TABLE `properties` ADD `ownershipArea` decimal(12,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `ownerType` enum('فرد','شركة','جهة_حكومية','وقف') DEFAULT 'فرد';--> statement-breakpoint
ALTER TABLE `properties` ADD `hasOwnersAssociation` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `properties` ADD `associationName` varchar(255);--> statement-breakpoint
ALTER TABLE `properties` ADD `associationRegNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `properties` ADD `associationUnifiedNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `properties` ADD `associationStatus` enum('فعّالة','غير_فعّالة') DEFAULT 'غير_فعّالة';--> statement-breakpoint
ALTER TABLE `properties` ADD `associationStartDate` date;--> statement-breakpoint
ALTER TABLE `properties` ADD `associationEndDate` date;--> statement-breakpoint
ALTER TABLE `properties` ADD `associationPresidentName` varchar(255);--> statement-breakpoint
ALTER TABLE `properties` ADD `associationPresidentPhone` varchar(20);--> statement-breakpoint
ALTER TABLE `properties` ADD `propertyManagerName` varchar(255);--> statement-breakpoint
ALTER TABLE `properties` ADD `propertyManagerPhone` varchar(20);--> statement-breakpoint
ALTER TABLE `properties` ADD `associationTotalFees` decimal(12,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `associationVotersCount` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `associationApprovalRate` decimal(5,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `brokerName` varchar(255);--> statement-breakpoint
ALTER TABLE `properties` ADD `brokerCommercialReg` varchar(50);--> statement-breakpoint
ALTER TABLE `properties` ADD `managementFeeType` enum('نسبة_مئوية','مبلغ_ثابت') DEFAULT 'نسبة_مئوية';--> statement-breakpoint
ALTER TABLE `properties` ADD `managementFeeRate` decimal(5,2) DEFAULT '5';--> statement-breakpoint
ALTER TABLE `properties` ADD `managementFeeAmount` decimal(12,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `maintenanceReserveRate` decimal(5,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `properties` ADD `vatRate` decimal(5,2) DEFAULT '15';--> statement-breakpoint
ALTER TABLE `properties` ADD `images` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `keyType` enum('ميكانيكي','إلكتروني','بطاقة_دخول','بصمة') DEFAULT 'ميكانيكي';--> statement-breakpoint
ALTER TABLE `properties` ADD `keysCount` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `properties` ADD `notes` text;