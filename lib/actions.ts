'use server';

import { db } from './db';
import { products, opnameSessions, opnameEntries } from './schema';
import { eq, like, desc, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Search products by name or SKU
 */
export async function searchProducts(query: string) {
    if (!query || query.length < 2) return [];

    const results = await db
        .select()
        .from(products)
        .where(
            sql`${products.name} LIKE ${`%${query}%`} OR ${products.sku} LIKE ${`%${query}%`}`
        )
        .limit(20);

    return results;
}

/**
 * Submit an opname entry (Insert or Update)
 */
export async function submitOpnameEntry(
    sessionId: number,
    productId: number,
    qty: number,
    notes: string = ''
) {
    // Check if entry exists
    const existing = await db
        .select()
        .from(opnameEntries)
        .where(
            and(
                eq(opnameEntries.session_id, sessionId),
                eq(opnameEntries.product_id, productId)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        // Update
        await db
            .update(opnameEntries)
            .set({
                qty_actual: qty,
                notes: notes,
                updated_at: new Date(),
            })
            .where(eq(opnameEntries.id, existing[0].id));
    } else {
        // Insert
        await db.insert(opnameEntries).values({
            session_id: sessionId,
            product_id: productId,
            qty_actual: qty,
            notes: notes,
            updated_at: new Date(),
        });
    }

    revalidatePath(`/session/${sessionId}`);
}

/**
 * Create a new opname session
 */
export async function createSession(title: string) {
    await db.insert(opnameSessions).values({
        title,
        status: 'OPEN',
        created_at: new Date(),
    });
    revalidatePath('/session');
}

/**
 * Finalize/Complete a session
 */
export async function finalizeSession(id: number) {
    await db
        .update(opnameSessions)
        .set({
            status: 'COMPLETED',
            completed_at: new Date(),
        })
        .where(eq(opnameSessions.id, id));
    revalidatePath('/session');
}

/**
 * Toggle lock status (OPEN <-> LOCKED)
 */
export async function toggleSessionLock(id: number, currentStatus: string) {
    const newStatus = currentStatus === 'OPEN' ? 'LOCKED' : 'OPEN';
    await db
        .update(opnameSessions)
        .set({ status: newStatus as 'OPEN' | 'LOCKED' })
        .where(eq(opnameSessions.id, id));
    revalidatePath('/session');
}

/**
 * Delete a session
 */
export async function deleteSession(id: number) {
    await db.delete(opnameSessions).where(eq(opnameSessions.id, id));
    revalidatePath('/session');
}

// --- Product Management Actions ---

export async function getProducts() {
    return await db.select().from(products).orderBy(products.name);
}

export async function createProduct(sku: string, name: string, system_stock: number) {
    await db.insert(products).values({
        sku,
        name,
        system_stock,
    });
    revalidatePath('/products');
}

export async function deleteProduct(id: number) {
    await db.delete(products).where(eq(products.id, id));
    revalidatePath('/products');
}

// --- Data Fetching Helpers (Direct DB calls for Server Components) ---

export async function getSessions() {
    return await db.select().from(opnameSessions).orderBy(desc(opnameSessions.created_at));
}

export async function getOpenSessions() {
    return await db
        .select()
        .from(opnameSessions)
        .where(eq(opnameSessions.status, 'OPEN'))
        .orderBy(desc(opnameSessions.created_at));
}

export async function getSessionById(id: number) {
    const result = await db.select().from(opnameSessions).where(eq(opnameSessions.id, id));
    return result[0];
}

export async function getSessionEntries(sessionId: number) {
    // Join products with entries
    // Ideally we want ALL products, and join entries to them
    // But for "Digital Count Sheet" usually we show what's matching search OR all.
    // The requirement says "Menampilkan seluruh daftar produk".

    // So we select * products left join entries
    const rows = await db
        .select({
            product: products,
            entry: opnameEntries,
        })
        .from(products)
        .leftJoin(
            opnameEntries,
            and(
                eq(opnameEntries.product_id, products.id),
                eq(opnameEntries.session_id, sessionId)
            )
        )
        .orderBy(products.name);

    return rows;
}
