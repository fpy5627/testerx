import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  unique,
  uniqueIndex,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uuid: varchar({ length: 255 }).notNull().unique(),
    email: varchar({ length: 255 }).notNull(),
    created_at: timestamp({ withTimezone: true }),
    nickname: varchar({ length: 255 }),
    avatar_url: varchar({ length: 255 }),
    locale: varchar({ length: 50 }),
    signin_type: varchar({ length: 50 }),
    signin_ip: varchar({ length: 255 }),
    signin_provider: varchar({ length: 50 }),
    signin_openid: varchar({ length: 255 }),
    invite_code: varchar({ length: 255 }).notNull().default(""),
    updated_at: timestamp({ withTimezone: true }),
    invited_by: varchar({ length: 255 }).notNull().default(""),
    is_affiliate: boolean().notNull().default(false),
  },
  (table) => [
    uniqueIndex("email_provider_unique_idx").on(
      table.email,
      table.signin_provider
    ),
  ]
);

// Orders table
export const orders = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  order_no: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp({ withTimezone: true }),
  user_uuid: varchar({ length: 255 }).notNull().default(""),
  user_email: varchar({ length: 255 }).notNull().default(""),
  amount: integer().notNull(),
  interval: varchar({ length: 50 }),
  expired_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }).notNull(),
  stripe_session_id: varchar({ length: 255 }),
  credits: integer().notNull(),
  currency: varchar({ length: 50 }),
  sub_id: varchar({ length: 255 }),
  sub_interval_count: integer(),
  sub_cycle_anchor: integer(),
  sub_period_end: integer(),
  sub_period_start: integer(),
  sub_times: integer(),
  product_id: varchar({ length: 255 }),
  product_name: varchar({ length: 255 }),
  valid_months: integer(),
  order_detail: text(),
  paid_at: timestamp({ withTimezone: true }),
  paid_email: varchar({ length: 255 }),
  paid_detail: text(),
});

// API Keys table
export const apikeys = pgTable("apikeys", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  api_key: varchar({ length: 255 }).notNull().unique(),
  title: varchar({ length: 100 }),
  user_uuid: varchar({ length: 255 }).notNull(),
  created_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }),
});

// Credits table
export const credits = pgTable("credits", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  trans_no: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp({ withTimezone: true }),
  user_uuid: varchar({ length: 255 }).notNull(),
  trans_type: varchar({ length: 50 }).notNull(),
  credits: integer().notNull(),
  order_no: varchar({ length: 255 }),
  expired_at: timestamp({ withTimezone: true }),
});

// Posts table
export const posts = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: varchar({ length: 255 }).notNull().unique(),
  slug: varchar({ length: 255 }),
  title: varchar({ length: 255 }),
  description: text(),
  content: text(),
  created_at: timestamp({ withTimezone: true }),
  updated_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }),
  cover_url: varchar({ length: 255 }),
  author_name: varchar({ length: 255 }),
  author_avatar_url: varchar({ length: 255 }),
  locale: varchar({ length: 50 }),
});

// Affiliates table
export const affiliates = pgTable("affiliates", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_uuid: varchar({ length: 255 }).notNull(),
  created_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }).notNull().default(""),
  invited_by: varchar({ length: 255 }).notNull(),
  paid_order_no: varchar({ length: 255 }).notNull().default(""),
  paid_amount: integer().notNull().default(0),
  reward_percent: integer().notNull().default(0),
  reward_amount: integer().notNull().default(0),
});

// Feedbacks table
export const feedbacks = pgTable("feedbacks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  created_at: timestamp({ withTimezone: true }),
  status: varchar({ length: 50 }),
  user_uuid: varchar({ length: 255 }),
  content: text(),
  rating: integer(),
});

// Test Dimensions table
export const testDimensions = pgTable("test_dimensions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  dimension_id: varchar({ length: 255 }).notNull(),
  key: varchar({ length: 255 }).notNull(),
  name: text().notNull(),
  description: text(),
  min_score: doublePrecision().notNull().default(0),
  max_score: doublePrecision().notNull().default(100),
  locale: varchar({ length: 50 }).notNull().default("en"),
  created_at: timestamp({ withTimezone: true }),
  updated_at: timestamp({ withTimezone: true }),
}, (table) => [
  uniqueIndex("dimension_locale_idx").on(table.dimension_id, table.locale),
]);

// Test Questions table (with audit status)
export const testQuestions = pgTable("test_questions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  question_id: varchar({ length: 255 }).notNull(),
  text_key: varchar({ length: 255 }),
  text: text().notNull(),
  hint_key: varchar({ length: 255 }),
  hint: text(),
  weights: jsonb().notNull().$type<Record<string, number>>(),
  skippable: boolean().notNull().default(true),
  locale: varchar({ length: 50 }).notNull().default("en"),
  audit_status: varchar({ length: 50 }).notNull().default("pending"), // pending, approved, rejected
  created_at: timestamp({ withTimezone: true }),
  updated_at: timestamp({ withTimezone: true }),
  created_by: varchar({ length: 255 }),
}, (table) => [
  uniqueIndex("question_locale_idx").on(table.question_id, table.locale),
]);

// Test Question Audit Logs table
export const testQuestionAudits = pgTable("test_question_audits", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  question_id: integer().notNull(),
  audit_status: varchar({ length: 50 }).notNull(),
  audit_reason: text(),
  auditor_uuid: varchar({ length: 255 }),
  created_at: timestamp({ withTimezone: true }),
});

// Test Results table (anonymous, using anonymous_id instead of user_uuid)
export const testResults = pgTable("test_results", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  anonymous_id: varchar({ length: 255 }).notNull(), // 匿名标识，可基于 IP + User-Agent 哈希
  scores: jsonb().notNull().$type<Record<string, number>>(),
  normalized_scores: jsonb().$type<Record<string, number>>(),
  locale: varchar({ length: 50 }),
  created_at: timestamp({ withTimezone: true }),
  deleted_at: timestamp({ withTimezone: true }), // Soft delete for GDPR
}, (table) => [
  uniqueIndex("anonymous_id_idx").on(table.anonymous_id),
]);

// Test Answer Items table
export const testAnswerItems = pgTable("test_answer_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  result_id: integer().notNull(),
  question_id: varchar({ length: 255 }).notNull(),
  value: integer(), // Likert 1-5
  skipped: boolean().notNull().default(false),
  created_at: timestamp({ withTimezone: true }),
});
