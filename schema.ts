import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Quranic Verses Table
 * Stores all verses of the Quran with Tajweed marks, revelation context, and linguistic data
 */
export const quranVerses = mysqlTable("quran_verses", {
  id: int("id").autoincrement().primaryKey(),
  surahNumber: int("surah_number").notNull(),
  surahName: varchar("surah_name", { length: 100 }).notNull(),
  surahNameArabic: varchar("surah_name_arabic", { length: 100 }).notNull(),
  verseNumber: int("verse_number").notNull(),
  verseText: text("verse_text").notNull(), // With Tajweed marks
  verseTextSimple: text("verse_text_simple").notNull(), // Without marks
  translationEnglish: text("translation_english"),
  translationFrench: text("translation_french"),
  translationSpanish: text("translation_spanish"),
  translationGerman: text("translation_german"),
  translationChinese: text("translation_chinese"),
  translationUrdu: text("translation_urdu"),
  revelationContext: text("revelation_context"), // أسباب النزول
  revelationOrder: int("revelation_order"), // ترتيب النزول
  revelationType: varchar("revelation_type", { length: 20 }), // "Meccan" or "Medinan"
  linguisticAnalysis: text("linguistic_analysis"), // تحليل لغوي
  rootWords: text("root_words"), // JSON array of root words
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuranVerse = typeof quranVerses.$inferSelect;
export type InsertQuranVerse = typeof quranVerses.$inferInsert;

/**
 * Tafsir (Quranic Interpretation) Table
 * Links verses to different tafsir books and interpretations
 */
export const tafsirEntries = mysqlTable("tafsir_entries", {
  id: int("id").autoincrement().primaryKey(),
  verseId: int("verse_id").notNull().references(() => quranVerses.id),
  tafsirSource: varchar("tafsir_source", { length: 100 }).notNull(), // "Ibn Kathir", "Tabari", etc.
  tafsirText: text("tafsir_text").notNull(),
  tafsirAuthor: varchar("tafsir_author", { length: 100 }),
  tafsirCentury: varchar("tafsir_century", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TafsirEntry = typeof tafsirEntries.$inferSelect;
export type InsertTafsirEntry = typeof tafsirEntries.$inferInsert;

/**
 * Hadith Table
 * Stores authentic hadiths from Sahih Bukhari, Muslim, and other collections
 */
export const hadiths = mysqlTable("hadiths", {
  id: int("id").autoincrement().primaryKey(),
  hadithText: text("hadith_text").notNull(),
  hadithNarrator: varchar("hadith_narrator", { length: 200 }),
  hadithSource: varchar("hadith_source", { length: 100 }).notNull(), // "Sahih Bukhari", "Sahih Muslim", etc.
  hadithGrade: varchar("hadith_grade", { length: 50 }), // "Sahih", "Hasan", etc.
  translationEnglish: text("translation_english"),
  translationArabic: text("translation_arabic"),
  relatedVerses: text("related_verses"), // JSON array of verse IDs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Hadith = typeof hadiths.$inferSelect;
export type InsertHadith = typeof hadiths.$inferInsert;

/**
 * Seerah (Prophetic Biography) Table
 * Stores stories and events from the Prophet's life
 */
export const seerahStories = mysqlTable("seerah_stories", {
  id: int("id").autoincrement().primaryKey(),
  storyTitle: varchar("story_title", { length: 200 }).notNull(),
  storyContent: text("story_content").notNull(),
  storySource: varchar("story_source", { length: 100 }), // "Al-Raheeq Al-Makhtum", etc.
  storyPeriod: varchar("story_period", { length: 100 }), // "Pre-Islamic", "Meccan", "Medinan"
  relatedVerses: text("related_verses"), // JSON array of verse IDs
  relatedHadiths: text("related_hadiths"), // JSON array of hadith IDs
  moralLesson: text("moral_lesson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SeerahStory = typeof seerahStories.$inferSelect;
export type InsertSeerahStory = typeof seerahStories.$inferInsert;

/**
 * Daily Wird (Recitation) Table
 * Tracks user's daily Quranic recitation following the ten-verse methodology
 */
export const dailyWird = mysqlTable("daily_wird", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  startVerseId: int("start_verse_id").notNull().references(() => quranVerses.id),
  endVerseId: int("end_verse_id").notNull().references(() => quranVerses.id),
  // Four dimensions of the ten-verse methodology
  reception: text("reception"), // التلقي - Understanding the verses
  roleModel: text("role_model"), // القدوة - Prophet's example
  application: text("application"), // التطبيق - Practical application
  impact: text("impact"), // الأثر - Impact on the soul
  reflections: text("reflections"),
  completionStatus: varchar("completion_status", { length: 20 }).default("pending"), // "pending", "in_progress", "completed"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyWird = typeof dailyWird.$inferSelect;
export type InsertDailyWird = typeof dailyWird.$inferInsert;

/**
 * Memorization Tracking Table
 * Tracks user's Quran memorization progress
 */
export const memorization = mysqlTable("memorization", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  verseId: int("verse_id").notNull().references(() => quranVerses.id),
  memorizedDate: timestamp("memorized_date"),
  tajweedQuality: int("tajweed_quality").default(0), // 0-100 score
  recitationQuality: int("recitation_quality").default(0), // 0-100 score
  reviewCount: int("review_count").default(0),
  lastReviewDate: timestamp("last_review_date"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Memorization = typeof memorization.$inferSelect;
export type InsertMemorization = typeof memorization.$inferInsert;

/**
 * User Performance Indicators Table
 * Tracks daily performance metrics (good deeds, bad deeds, etc.)
 */
export const performanceIndicators = mysqlTable("performance_indicators", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  goodDeeds: int("good_deeds").default(0), // حسناتي
  badDeeds: int("bad_deeds").default(0), // سيئاتي
  recitationScore: int("recitation_score").default(0), // تلاوتي
  memorizationScore: int("memorization_score").default(0), // حفظي
  mentalState: int("mental_state").default(0), // نفسيتي (0-100)
  worldlyDuties: int("worldly_duties").default(0), // دنيتي (0-100)
  faithDeepening: int("faith_deepening").default(0), // إيماني (0-100)
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PerformanceIndicator = typeof performanceIndicators.$inferSelect;
export type InsertPerformanceIndicator = typeof performanceIndicators.$inferInsert;

/**
 * Paradise Garden Table
 * Tracks user's virtual paradise garden (good deeds building)
 */
export const paradiseGarden = mysqlTable("paradise_garden", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id).unique(),
  totalGoodDeeds: int("total_good_deeds").default(0),
  totalBadDeeds: int("total_bad_deeds").default(0),
  palaceLevel: int("palace_level").default(0), // Level of palace construction
  gardenLevel: int("garden_level").default(0), // Level of garden development
  netReward: int("net_reward").default(0), // Total good deeds - bad deeds
  lastUpdated: timestamp("last_updated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParadiseGarden = typeof paradiseGarden.$inferSelect;
export type InsertParadiseGarden = typeof paradiseGarden.$inferInsert;

/**
 * Reminders Table
 * Stores user reminders for daily recitation, prayers, and obligations
 */
export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  reminderType: varchar("reminder_type", { length: 50 }).notNull(), // "daily_wird", "prayer", "dhikr", etc.
  reminderTime: varchar("reminder_time", { length: 10 }), // HH:MM format
  reminderContent: text("reminder_content"),
  isActive: int("is_active").default(1),
  frequency: varchar("frequency", { length: 20 }), // "daily", "weekly", "monthly"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

/**
 * Worldly Duties Tracking Table
 * Tracks user's daily worldly responsibilities (work, family, neighbors, etc.)
 */
export const worldlyDuties = mysqlTable("worldly_duties", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  workExcellence: int("work_excellence").default(0), // 0-100
  familyTies: int("family_ties").default(0), // 0-100
  neighborhoodGoodness: int("neighborhood_goodness").default(0), // 0-100
  ethicalConduct: int("ethical_conduct").default(0), // 0-100
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorldlyDuty = typeof worldlyDuties.$inferSelect;
export type InsertWorldlyDuty = typeof worldlyDuties.$inferInsert;