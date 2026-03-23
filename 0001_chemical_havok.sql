CREATE TABLE `daily_wird` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`date` timestamp NOT NULL,
	`start_verse_id` int NOT NULL,
	`end_verse_id` int NOT NULL,
	`reception` text,
	`role_model` text,
	`application` text,
	`impact` text,
	`reflections` text,
	`completion_status` varchar(20) DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_wird_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hadiths` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hadith_text` text NOT NULL,
	`hadith_narrator` varchar(200),
	`hadith_source` varchar(100) NOT NULL,
	`hadith_grade` varchar(50),
	`translation_english` text,
	`translation_arabic` text,
	`related_verses` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hadiths_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memorization` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`verse_id` int NOT NULL,
	`memorized_date` timestamp,
	`tajweed_quality` int DEFAULT 0,
	`recitation_quality` int DEFAULT 0,
	`review_count` int DEFAULT 0,
	`last_review_date` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memorization_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paradise_garden` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`total_good_deeds` int DEFAULT 0,
	`total_bad_deeds` int DEFAULT 0,
	`palace_level` int DEFAULT 0,
	`garden_level` int DEFAULT 0,
	`net_reward` int DEFAULT 0,
	`last_updated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `paradise_garden_id` PRIMARY KEY(`id`),
	CONSTRAINT `paradise_garden_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `performance_indicators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`date` timestamp NOT NULL,
	`good_deeds` int DEFAULT 0,
	`bad_deeds` int DEFAULT 0,
	`recitation_score` int DEFAULT 0,
	`memorization_score` int DEFAULT 0,
	`mental_state` int DEFAULT 0,
	`worldly_duties` int DEFAULT 0,
	`faith_deepening` int DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performance_indicators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quran_verses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surah_number` int NOT NULL,
	`surah_name` varchar(100) NOT NULL,
	`surah_name_arabic` varchar(100) NOT NULL,
	`verse_number` int NOT NULL,
	`verse_text` text NOT NULL,
	`verse_text_simple` text NOT NULL,
	`translation_english` text,
	`translation_french` text,
	`translation_spanish` text,
	`translation_german` text,
	`translation_chinese` text,
	`translation_urdu` text,
	`revelation_context` text,
	`revelation_order` int,
	`revelation_type` varchar(20),
	`linguistic_analysis` text,
	`root_words` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quran_verses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`reminder_type` varchar(50) NOT NULL,
	`reminder_time` varchar(10),
	`reminder_content` text,
	`is_active` int DEFAULT 1,
	`frequency` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seerah_stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`story_title` varchar(200) NOT NULL,
	`story_content` text NOT NULL,
	`story_source` varchar(100),
	`story_period` varchar(100),
	`related_verses` text,
	`related_hadiths` text,
	`moral_lesson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seerah_stories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tafsir_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`verse_id` int NOT NULL,
	`tafsir_source` varchar(100) NOT NULL,
	`tafsir_text` text NOT NULL,
	`tafsir_author` varchar(100),
	`tafsir_century` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tafsir_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `worldly_duties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`date` timestamp NOT NULL,
	`work_excellence` int DEFAULT 0,
	`family_ties` int DEFAULT 0,
	`neighborhood_goodness` int DEFAULT 0,
	`ethical_conduct` int DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `worldly_duties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `daily_wird` ADD CONSTRAINT `daily_wird_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `daily_wird` ADD CONSTRAINT `daily_wird_start_verse_id_quran_verses_id_fk` FOREIGN KEY (`start_verse_id`) REFERENCES `quran_verses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `daily_wird` ADD CONSTRAINT `daily_wird_end_verse_id_quran_verses_id_fk` FOREIGN KEY (`end_verse_id`) REFERENCES `quran_verses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memorization` ADD CONSTRAINT `memorization_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memorization` ADD CONSTRAINT `memorization_verse_id_quran_verses_id_fk` FOREIGN KEY (`verse_id`) REFERENCES `quran_verses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paradise_garden` ADD CONSTRAINT `paradise_garden_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performance_indicators` ADD CONSTRAINT `performance_indicators_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tafsir_entries` ADD CONSTRAINT `tafsir_entries_verse_id_quran_verses_id_fk` FOREIGN KEY (`verse_id`) REFERENCES `quran_verses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `worldly_duties` ADD CONSTRAINT `worldly_duties_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;