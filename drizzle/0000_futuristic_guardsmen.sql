CREATE TABLE `crisis_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`country` varchar(10) NOT NULL,
	`region` varchar(100),
	`name` varchar(255) NOT NULL,
	`phone` varchar(50),
	`sms` varchar(50),
	`website` varchar(500),
	`description` text,
	`type` enum('suicide_prevention','crisis_hotline','mental_health','addiction','domestic_violence','general') NOT NULL,
	`available24_7` boolean DEFAULT true,
	`languages` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crisis_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_rituals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`dailyTruthViewed` boolean DEFAULT false,
	`dailyBlessingViewed` boolean DEFAULT false,
	`confessionCompleted` boolean DEFAULT false,
	`breathingExerciseCompleted` boolean DEFAULT false,
	`cbtCardCompleted` boolean DEFAULT false,
	`journalEntryCompleted` boolean DEFAULT false,
	`streakCount` int DEFAULT 0,
	`tokensEarnedToday` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_rituals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_circle_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`circleId` int NOT NULL,
	`userId` int NOT NULL,
	`anonymousToOthers` boolean DEFAULT true,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_circle_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_circles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`ownerUserId` int NOT NULL,
	`subscriptionTier` enum('nine') NOT NULL,
	`maxMembers` int NOT NULL DEFAULT 5,
	`sharedTokenPool` int NOT NULL DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_circles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `impact_pool` (
	`id` int AUTO_INCREMENT NOT NULL,
	`totalTokensDonated` int NOT NULL DEFAULT 0,
	`totalMoneyAllocated` decimal(10,2) NOT NULL DEFAULT '0.00',
	`impactDescription` text,
	`recipientCount` int DEFAULT 0,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `impact_pool_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`aiPromptUsed` varchar(255),
	`aiReflectionGenerated` boolean DEFAULT false,
	`moodTag` enum('very_low','low','neutral','good','very_good','anxious','calm','angry','peaceful','sad','joyful'),
	`wordCount` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userCount` int NOT NULL,
	`commitmentDescription` text NOT NULL,
	`commitmentAmount` decimal(10,2),
	`achieved` boolean DEFAULT false,
	`achievedAt` timestamp,
	`impactDescription` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `milestones_id` PRIMARY KEY(`id`),
	CONSTRAINT `milestones_userCount_unique` UNIQUE(`userCount`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('therapy_practice','clinic','nonprofit','corporate') NOT NULL,
	`subscriptionTier` enum('guardian') NOT NULL,
	`stripeCustomerId` varchar(255),
	`maxLicenses` int NOT NULL DEFAULT 5,
	`activeLicenses` int NOT NULL DEFAULT 0,
	`adminUserId` int NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredUserId` int,
	`referralCode` varchar(50) NOT NULL,
	`status` enum('pending','completed','rewarded') NOT NULL DEFAULT 'pending',
	`tokensAwarded` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `scribe_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`response` text NOT NULL,
	`valence` enum('light','heavy'),
	`userVoice` text,
	`ageTierAnonymized` enum('teen','young_adult','adult','senior'),
	`regionAnonymized` varchar(50),
	`crisisDetected` boolean DEFAULT false,
	`publishedToFeed` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scribe_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `soul_token_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('earned','donated','bonus','referral') NOT NULL,
	`amount` int NOT NULL,
	`source` varchar(255),
	`description` text,
	`balanceAfter` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `soul_token_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `therapist_shared_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`therapistId` int NOT NULL,
	`weeklyEngagementDays` int DEFAULT 0,
	`moodTrend` enum('improving','stable','declining','unknown') DEFAULT 'unknown',
	`slippingFlagCount` int DEFAULT 0,
	`crisisResourceAccessCount` int DEFAULT 0,
	`weekStartDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `therapist_shared_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `truth_nuggets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`journalEntryId` int,
	`content` text NOT NULL,
	`category` varchar(50),
	`savedToVault` boolean DEFAULT false,
	`markedAsFavorite` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`savedAt` timestamp,
	CONSTRAINT `truth_nuggets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin','org_admin','therapist') NOT NULL DEFAULT 'user',
	`ageTier` enum('13-17','18-24','25-44','45-64','65+'),
	`region` varchar(10),
	`genderExpression` enum('masc','fem','neutral','prefer_not_to_say'),
	`adviceMode` enum('normal','formal','unhinged') DEFAULT 'normal',
	`voicePersona` enum('gentle','steady','strong') DEFAULT 'gentle',
	`spiritualLens` enum('secular','christian','mystic','jewish','muslim','buddhist') DEFAULT 'secular',
	`dailyBlessingEnabled` boolean DEFAULT false,
	`soulTokenBalance` int NOT NULL DEFAULT 0,
	`subscriptionTier` enum('zero','three','six','nine','twelve','guardian') NOT NULL DEFAULT 'zero',
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`subscriptionStatus` enum('active','canceled','past_due','trialing'),
	`subscriptionEndsAt` timestamp,
	`linkedTherapistId` int,
	`therapistDataSharingEnabled` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	`lastActiveAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `waitlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`interestedInTherapistTier` boolean DEFAULT false,
	`referralSource` varchar(255),
	`inviteSent` boolean DEFAULT false,
	`inviteSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waitlist_id` PRIMARY KEY(`id`),
	CONSTRAINT `waitlist_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `waitlist_signups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`referralSource` varchar(255),
	`soulTokensAwarded` boolean DEFAULT false,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waitlist_signups_id` PRIMARY KEY(`id`),
	CONSTRAINT `waitlist_signups_email_unique` UNIQUE(`email`)
);
