
import { serial, text, pgTable, timestamp, varchar, integer } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const businessCardsTable = pgTable('business_cards', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  title: text('title'), // Nullable by default
  company: text('company'), // Nullable by default
  email: text('email'), // Nullable by default
  phone_number: text('phone_number'), // Nullable by default
  linkedin_url: text('linkedin_url'), // Nullable by default
  twitter_url: text('twitter_url'), // Nullable by default
  instagram_url: text('instagram_url'), // Nullable by default
  profile_picture_url: text('profile_picture_url'), // Nullable by default
  company_logo_url: text('company_logo_url'), // Nullable by default
  unique_url: varchar('unique_url', { length: 255 }).notNull().unique(), // Unique identifier for sharing
  qr_code_url: text('qr_code_url'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type User = typeof usersTable.$inferSelect; // For SELECT operations
export type NewUser = typeof usersTable.$inferInsert; // For INSERT operations
export type BusinessCard = typeof businessCardsTable.$inferSelect; // For SELECT operations
export type NewBusinessCard = typeof businessCardsTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { users: usersTable, businessCards: businessCardsTable };
