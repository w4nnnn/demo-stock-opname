import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sku: text('sku').notNull().unique(),
    name: text('name').notNull(),
    system_stock: integer('system_stock').notNull().default(0),
});

export const opnameSessions = sqliteTable('opname_sessions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    status: text('status', { enum: ['OPEN', 'LOCKED', 'COMPLETED'] }).notNull().default('OPEN'),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    completed_at: integer('completed_at', { mode: 'timestamp' }),
});

export const opnameEntries = sqliteTable('opname_entries', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    session_id: integer('session_id').references(() => opnameSessions.id, { onDelete: 'cascade' }).notNull(),
    product_id: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
    qty_actual: integer('qty_actual').notNull(),
    notes: text('notes'),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
