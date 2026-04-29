CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('معاينة','توقيع_عقد','تسليم_وحدة','استلام_وحدة','صيانة','اجتماع','أخرى') DEFAULT 'أخرى',
	`propertyId` int,
	`unitId` int,
	`clientName` varchar(255),
	`clientPhone` varchar(20),
	`clientEmail` varchar(320),
	`assignedTo` int,
	`appointmentDate` date NOT NULL,
	`appointmentTime` varchar(10),
	`duration` int DEFAULT 60,
	`status` enum('مجدول','مؤكد','مكتمل','ملغي','لم_يحضر') DEFAULT 'مجدول',
	`notes` text,
	`reminderSent` tinyint DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('عقد_إيجار','عقد_بيع','عقد_إدارة','إشعار','فاتورة','تقرير','أخرى') DEFAULT 'أخرى',
	`type` enum('واتساب','بريد_إلكتروني','رسالة_نصية','PDF','طباعة') DEFAULT 'PDF',
	`subject` varchar(255),
	`content` text NOT NULL,
	`variables` text,
	`isActive` tinyint DEFAULT 1,
	`usageCount` int DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `document_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expense_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(20) DEFAULT '#6B7280',
	`isActive` tinyint DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expense_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`categoryId` int,
	`propertyId` int,
	`unitId` int,
	`amount` decimal(12,2) NOT NULL,
	`expenseDate` date NOT NULL,
	`paymentMethod` enum('نقدي','تحويل_بنكي','شيك','بطاقة') DEFAULT 'نقدي',
	`vendor` varchar(255),
	`invoiceNumber` varchar(100),
	`description` text,
	`attachments` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`type` enum('إيجار','صيانة','خدمات','رسوم_إدارية','أخرى') DEFAULT 'إيجار',
	`contractId` int,
	`tenantName` varchar(255),
	`tenantPhone` varchar(20),
	`propertyName` varchar(255),
	`unitNumber` varchar(50),
	`items` text,
	`subtotal` decimal(12,2),
	`tax` decimal(12,2) DEFAULT '0',
	`discount` decimal(12,2) DEFAULT '0',
	`total` decimal(12,2) NOT NULL,
	`status` enum('مسودة','مرسلة','مدفوعة','متأخرة','ملغاة') DEFAULT 'مسودة',
	`issueDate` date NOT NULL,
	`dueDate` date,
	`paidDate` date,
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `property_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('صك_ملكية','رخصة_بناء','مخطط','عقد','صورة','أخرى') DEFAULT 'أخرى',
	`propertyId` int,
	`unitId` int,
	`contractId` int,
	`fileUrl` text,
	`fileSize` int,
	`mimeType` varchar(100),
	`uploadedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `property_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_forms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formType` enum('استلام_وحدة','تسليم_وحدة','فحص_دوري','طلب_صيانة','شكوى','طلب_إيجار') DEFAULT 'طلب_إيجار',
	`propertyId` int,
	`unitId` int,
	`contractId` int,
	`submittedBy` varchar(255),
	`submitterPhone` varchar(20),
	`submitterEmail` varchar(320),
	`formData` text,
	`status` enum('جديد','قيد_المراجعة','مكتمل','مرفوض') DEFAULT 'جديد',
	`notes` text,
	`attachments` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_forms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`label` varchar(255),
	`category` varchar(100) DEFAULT 'general',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('متابعة_عقد','صيانة','تحصيل','تسويق','إداري','أخرى') DEFAULT 'أخرى',
	`priority` enum('عاجل','عالي','متوسط','منخفض') DEFAULT 'متوسط',
	`status` enum('جديدة','قيد_التنفيذ','مكتملة','ملغاة') DEFAULT 'جديدة',
	`assignedTo` int,
	`relatedType` varchar(50),
	`relatedId` int,
	`dueDate` date,
	`completedAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
