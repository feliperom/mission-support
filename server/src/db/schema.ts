import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  boolean,
  date,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const supporterTypeEnum = pgEnum("supporter_type", [
  "individual",
  "couple",
  "church",
]);

export const supporterStatusEnum = pgEnum("supporter_status", [
  "prospect",
  "contacted",
  "confirmed",
  "active",
  "inactive",
]);

export const contactTypeEnum = pgEnum("contact_type", [
  "call",
  "whatsapp",
  "email",
  "in_person",
]);

// ─── Missionaries ────────────────────────────────────────────────────────────

export const missionaries = pgTable("missionaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  monthlyGoal: decimal("monthly_goal", { precision: 10, scale: 2 }).default(
    "0"
  ),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default(
    "pt-BR"
  ),
  themePreference: varchar("theme_preference", { length: 20 }).default("light"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const missionariesRelations = relations(missionaries, ({ many }) => ({
  supporters: many(supporters),
  offerings: many(offerings),
  contactLog: many(contactLog),
  expenses: many(expenses),
}));

// ─── Supporters ──────────────────────────────────────────────────────────────

export const supporters = pgTable("supporters", {
  id: uuid("id").primaryKey().defaultRandom(),
  missionaryId: uuid("missionary_id")
    .notNull()
    .references(() => missionaries.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  partnerName: varchar("partner_name", { length: 255 }),
  type: supporterTypeEnum("type").notNull().default("individual"),
  status: supporterStatusEnum("status").notNull().default("prospect"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Brasil"),
  birthday: date("birthday"),
  hasResponded: boolean("has_responded").default(false),
  hasReturnedContact: boolean("has_returned_contact").default(false),
  estimatedOffering: decimal("estimated_offering", {
    precision: 10,
    scale: 2,
  }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const supportersRelations = relations(supporters, ({ one, many }) => ({
  missionary: one(missionaries, {
    fields: [supporters.missionaryId],
    references: [missionaries.id],
  }),
  offerings: many(offerings),
  contactLog: many(contactLog),
}));

// ─── Offerings ───────────────────────────────────────────────────────────────

export const offerings = pgTable("offerings", {
  id: uuid("id").primaryKey().defaultRandom(),
  supporterId: uuid("supporter_id")
    .references(() => supporters.id, { onDelete: "cascade" }),
  supporterName: varchar("supporter_name", { length: 255 }),
  missionaryId: uuid("missionary_id")
    .notNull()
    .references(() => missionaries.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  offeringDate: date("offering_date").notNull(),
  monthReference: varchar("month_reference", { length: 7 }).notNull(), // "2026-06"
  isReceived: boolean("is_received").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const offeringsRelations = relations(offerings, ({ one }) => ({
  supporter: one(supporters, {
    fields: [offerings.supporterId],
    references: [supporters.id],
  }),
  missionary: one(missionaries, {
    fields: [offerings.missionaryId],
    references: [missionaries.id],
  }),
}));

// ─── Contact Log ─────────────────────────────────────────────────────────────

export const contactLog = pgTable("contact_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  supporterId: uuid("supporter_id")
    .notNull()
    .references(() => supporters.id, { onDelete: "cascade" }),
  missionaryId: uuid("missionary_id")
    .notNull()
    .references(() => missionaries.id, { onDelete: "cascade" }),
  contactType: contactTypeEnum("contact_type").notNull(),
  contactDate: date("contact_date").notNull(),
  notes: text("notes"),
  supporterInitiated: boolean("supporter_initiated").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contactLogRelations = relations(contactLog, ({ one }) => ({
  supporter: one(supporters, {
    fields: [contactLog.supporterId],
    references: [supporters.id],
  }),
  missionary: one(missionaries, {
    fields: [contactLog.missionaryId],
    references: [missionaries.id],
  }),
}));

// ─── Expenses ──────────────────────────────────────────────────────────────────

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  missionaryId: uuid("missionary_id")
    .notNull()
    .references(() => missionaries.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  expenseDate: date("expense_date").notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  missionary: one(missionaries, {
    fields: [expenses.missionaryId],
    references: [missionaries.id],
  }),
}));

// ─── Type exports ────────────────────────────────────────────────────────────

export type Missionary = typeof missionaries.$inferSelect;
export type NewMissionary = typeof missionaries.$inferInsert;
export type Supporter = typeof supporters.$inferSelect;
export type NewSupporter = typeof supporters.$inferInsert;
export type Offering = typeof offerings.$inferSelect;
export type NewOffering = typeof offerings.$inferInsert;
export type ContactLogEntry = typeof contactLog.$inferSelect;
export type NewContactLogEntry = typeof contactLog.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
