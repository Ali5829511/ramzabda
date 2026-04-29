CREATE TABLE `brokers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`licenseNumber` varchar(50),
	`phone` varchar(20),
	`email` varchar(320),
	`company` varchar(255),
	`userId` int,
	`totalContracts` int DEFAULT 0,
	`totalCommissions` decimal(15,2) DEFAULT '0',
	`isActive` tinyint DEFAULT 1,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brokers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communication_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('واتساب','بريد_إلكتروني','رسالة_نصية','مكالمة') DEFAULT 'رسالة_نصية',
	`direction` enum('صادر','وارد') DEFAULT 'صادر',
	`recipientName` varchar(255),
	`recipientPhone` varchar(20),
	`recipientEmail` varchar(320),
	`subject` varchar(255),
	`message` text,
	`status` enum('مرسل','فشل','معلق') DEFAULT 'مرسل',
	`relatedType` varchar(50),
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communication_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int,
	`propertyId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`unitType` varchar(100),
	`propertyName` varchar(255),
	`city` varchar(100),
	`region` varchar(100),
	`area` decimal(10,2),
	`rooms` int,
	`bathrooms` int,
	`floor` varchar(20),
	`rentPrice` decimal(15,2),
	`imageUrl` varchar(500),
	`features` text,
	`status` enum('نشط','مؤجر','موقوف') DEFAULT 'نشط',
	`viewCount` int DEFAULT 0,
	`inquiryCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('واتساب','بريد_إلكتروني','رسالة_نصية','إشعار_داخلي') DEFAULT 'إشعار_داخلي',
	`recipientType` enum('مالك','مستأجر','موظف','فني','وسيط','عام') DEFAULT 'عام',
	`recipientId` int,
	`recipientName` varchar(255),
	`recipientPhone` varchar(20),
	`recipientEmail` varchar(320),
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` enum('مجدول','مرسل','فشل','مقروء') DEFAULT 'مجدول',
	`scheduledAt` timestamp,
	`sentAt` timestamp,
	`relatedType` varchar(50),
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technicians` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20),
	`email` varchar(320),
	`specialty` enum('كهرباء','سباكة','تكييف','نجارة','دهان','نظافة','أمن','عام') DEFAULT 'عام',
	`isAvailable` tinyint DEFAULT 1,
	`rating` decimal(3,1) DEFAULT '5.0',
	`totalJobs` int DEFAULT 0,
	`completedJobs` int DEFAULT 0,
	`userId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `technicians_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`identityNumber` varchar(20),
	`phone` varchar(20),
	`email` varchar(320),
	`nationality` varchar(100),
	`userId` int,
	`portalAccess` tinyint DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `viewing_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int,
	`unitId` int,
	`propertyName` varchar(255),
	`applicantName` varchar(255) NOT NULL,
	`applicantPhone` varchar(20) NOT NULL,
	`applicantEmail` varchar(320),
	`preferredDate` date,
	`preferredTime` varchar(50),
	`message` text,
	`status` enum('جديد','مؤكد','مكتمل','ملغي') DEFAULT 'جديد',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `viewing_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contracts` ADD `ejarContractId` varchar(100);--> statement-breakpoint
ALTER TABLE `contracts` ADD `ejarStatus` varchar(50);--> statement-breakpoint
ALTER TABLE `contracts` ADD `ejarSyncedAt` timestamp;--> statement-breakpoint
ALTER TABLE `employees` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `employees` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `employees` ADD `role` varchar(100);--> statement-breakpoint
ALTER TABLE `employees` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `employees` ADD `isActive` tinyint DEFAULT 1;--> statement-breakpoint
ALTER TABLE `maintenance_requests` ADD `technicianId` int;--> statement-breakpoint
ALTER TABLE `maintenance_requests` ADD `technicianName` varchar(255);--> statement-breakpoint
ALTER TABLE `owners` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `owners` ADD `portalAccess` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `owners` ADD `portalPin` varchar(10);--> statement-breakpoint
ALTER TABLE `owners` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `units` ADD `isListed` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `units` ADD `listingDescription` text;--> statement-breakpoint
ALTER TABLE `units` ADD `listingImageUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `units` ADD `viewCount` int DEFAULT 0;