import { db } from './lib/db';
import { products, opnameSessions, opnameEntries } from './lib/schema';
import { eq } from 'drizzle-orm';

async function seed() {
    console.log('🌱 Starting seed...');

    // 1. Seed Products (Bahan Baku)
    const productData = [
        { sku: 'BB-001', name: 'Biji Kopi Arabica (kg)', system_stock: 50 },
        { sku: 'BB-002', name: 'Biji Kopi Robusta (kg)', system_stock: 35 },
        { sku: 'BB-003', name: 'Susu UHT Full Cream (L)', system_stock: 120 },
        { sku: 'BB-004', name: 'Sirup Vanilla (btl)', system_stock: 15 },
        { sku: 'BB-005', name: 'Sirup Hazelnut (btl)', system_stock: 12 },
        { sku: 'BB-006', name: 'Gula Pasir (kg)', system_stock: 40 },
        { sku: 'BB-007', name: 'Cup 12oz (pcs)', system_stock: 500 },
        { sku: 'BB-008', name: 'Cup 16oz (pcs)', system_stock: 450 },
        { sku: 'BB-009', name: 'Sedotan (pack)', system_stock: 20 },
        { sku: 'BB-010', name: 'Bubuk Coklat Premium (kg)', system_stock: 25 },
        { sku: 'BB-011', name: 'Teh Hitam (box)', system_stock: 30 },
        { sku: 'BB-012', name: 'Teh Hijau (box)', system_stock: 28 },
        { sku: 'BB-013', name: 'Lychee Kaleng (klg)', system_stock: 15 },
        { sku: 'BB-014', name: 'Air Mineral Galon (galon)', system_stock: 10 },
        { sku: 'BB-015', name: 'Es Batu (pack)', system_stock: 5 },
    ];

    console.log(`Inserting ${productData.length} products...`);
    // Use loop or insert many if supported by dialect/driver well enough for unique constraints silently, 
    // but for seed we can just insert.
    await db.insert(products).values(productData).onConflictDoNothing();

    // 2. Seed Sessions
    console.log('Creating sessions...');

    // Completed Session
    const [completedSession] = await db.insert(opnameSessions).values({
        title: 'Opname Bulan Lalu (November)',
        status: 'COMPLETED',
        created_at: new Date('2025-11-25T09:00:00'),
        completed_at: new Date('2025-11-25T16:00:00'),
    }).returning();

    // Open Session (Active)
    const [activeSession] = await db.insert(opnameSessions).values({
        title: 'Opname Harian - Desember',
        status: 'OPEN',
        created_at: new Date(),
    }).returning();

    // 3. Dummy Entries for Active Session
    console.log('Adding dummy entries to active session...');

    // Fetch products to map IDs
    const allProducts = await db.select().from(products);
    const kopiArabica = allProducts.find(p => p.sku === 'BB-001');
    const susuUHT = allProducts.find(p => p.sku === 'BB-003');

    if (kopiArabica && activeSession) {
        await db.insert(opnameEntries).values({
            session_id: activeSession.id,
            product_id: kopiArabica.id,
            qty_actual: 48, // Selisih -2
            notes: 'Ada yang tumpah sedikit',
            updated_at: new Date(),
        });
    }

    if (susuUHT && activeSession) {
        await db.insert(opnameEntries).values({
            session_id: activeSession.id,
            product_id: susuUHT.id,
            qty_actual: 120, // Match
            updated_at: new Date(),
        });
    }

    console.log('✅ Seeding completed!');
}

seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
