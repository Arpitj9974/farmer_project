/**
 * Lightweight SQL Migration System for FarmerConnect
 * 
 * No ORM required — runs raw .sql files in order.
 * Tracks applied migrations in `schema_migrations` table.
 * 
 * Usage:
 *   node database/migrate.js up      — Run pending migrations
 *   node database/migrate.js down     — Rollback last migration
 *   node database/migrate.js status   — Show migration status
 *   node database/migrate.js create <name>  — Create new migration file
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const logger = require('../config/logger').child('MIGRATE');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// ─── DB connection (separate from app pool) ───
function createPool() {
    if (process.env.DATABASE_URL) {
        return new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        });
    }
    return new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });
}

// ─── Ensure migration tracking table exists ───
async function ensureMigrationTable(pool) {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            version VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            checksum VARCHAR(64)
        )
    `);
}

// ─── Get list of applied migrations ───
async function getAppliedMigrations(pool) {
    const result = await pool.query(
        'SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC'
    );
    return result.rows;
}

// ─── Get list of available migration files ───
function getAvailableMigrations() {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
        return [];
    }

    return fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql') && !f.endsWith('.down.sql'))
        .sort()
        .map(filename => {
            const version = filename.split('_')[0];
            const name = filename.replace('.sql', '');
            const upFile = path.join(MIGRATIONS_DIR, filename);
            const downFile = path.join(MIGRATIONS_DIR, filename.replace('.sql', '.down.sql'));
            const upSQL = fs.readFileSync(upFile, 'utf8');
            const downSQL = fs.existsSync(downFile) ? fs.readFileSync(downFile, 'utf8') : null;

            // Simple checksum
            const crypto = require('crypto');
            const checksum = crypto.createHash('md5').update(upSQL).digest('hex');

            return { version, name, upSQL, downSQL, checksum, filename };
        });
}

// ─── Run pending migrations (UP) ───
async function migrateUp(pool) {
    await ensureMigrationTable(pool);
    const applied = await getAppliedMigrations(pool);
    const appliedVersions = applied.map(m => m.version);
    const available = getAvailableMigrations();
    const pending = available.filter(m => !appliedVersions.includes(m.version));

    if (pending.length === 0) {
        logger.info('No pending migrations');
        return { applied: 0, total: available.length };
    }

    logger.info(`Found ${pending.length} pending migration(s)`);

    let appliedCount = 0;
    for (const migration of pending) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            logger.info(`Applying migration: ${migration.name}...`);

            // Strip comment lines first, then split by semicolons
            const cleanSQL = migration.upSQL
                .split('\n')
                .map(line => line.trim())
                .filter(line => !line.startsWith('--') && line.length > 0)
                .join('\n');

            const statements = cleanSQL
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (const stmt of statements) {
                await client.query(stmt);
            }

            await client.query(
                'INSERT INTO schema_migrations (version, name, checksum) VALUES ($1, $2, $3)',
                [migration.version, migration.name, migration.checksum]
            );

            await client.query('COMMIT');
            appliedCount++;
            logger.info(`✅ Applied: ${migration.name}`);
        } catch (err) {
            await client.query('ROLLBACK');
            logger.error(`❌ Migration failed: ${migration.name}`, {
                errorMessage: err.message,
                errorCode: err.code,
            });
            throw new Error(`Migration ${migration.name} failed: ${err.message}`);
        } finally {
            client.release();
        }
    }

    return { applied: appliedCount, total: available.length };
}

// ─── Rollback last migration (DOWN) ───
async function migrateDown(pool) {
    await ensureMigrationTable(pool);
    const applied = await getAppliedMigrations(pool);

    if (applied.length === 0) {
        logger.info('No migrations to rollback');
        return;
    }

    const last = applied[applied.length - 1];
    const available = getAvailableMigrations();
    const migration = available.find(m => m.version === last.version);

    if (!migration) {
        logger.error(`Cannot find migration file for version: ${last.version}`);
        return;
    }

    if (!migration.downSQL) {
        logger.error(`No down migration file for: ${migration.name}`);
        logger.error(`Create: database/migrations/${migration.filename.replace('.sql', '.down.sql')}`);
        return;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        logger.info(`Rolling back: ${migration.name}...`);

        const cleanSQL = migration.downSQL
            .split('\n')
            .map(line => line.trim())
            .filter(line => !line.startsWith('--') && line.length > 0)
            .join('\n');

        const statements = cleanSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const stmt of statements) {
            await client.query(stmt);
        }

        await client.query('DELETE FROM schema_migrations WHERE version = $1', [migration.version]);
        await client.query('COMMIT');
        logger.info(`✅ Rolled back: ${migration.name}`);
    } catch (err) {
        await client.query('ROLLBACK');
        logger.error(`❌ Rollback failed: ${migration.name}`, { errorMessage: err.message });
        throw err;
    } finally {
        client.release();
    }
}

// ─── Show migration status ───
async function migrationStatus(pool) {
    await ensureMigrationTable(pool);
    const applied = await getAppliedMigrations(pool);
    const available = getAvailableMigrations();
    const appliedVersions = applied.map(m => m.version);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Migration Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (available.length === 0) {
        console.log('  No migration files found.\n');
        return;
    }

    for (const m of available) {
        const isApplied = appliedVersions.includes(m.version);
        const appliedInfo = applied.find(a => a.version === m.version);
        const status = isApplied ? '✅ Applied' : '⏳ Pending';
        const date = appliedInfo ? ` (${new Date(appliedInfo.applied_at).toLocaleString()})` : '';
        console.log(`  ${status}  ${m.name}${date}`);
    }

    const pendingCount = available.length - applied.length;
    console.log(`\n  Total: ${available.length} | Applied: ${applied.length} | Pending: ${pendingCount}\n`);

    return { total: available.length, applied: applied.length, pending: pendingCount };
}

// ─── Create new migration file ───
function createMigration(name) {
    if (!name) {
        console.error('Usage: node database/migrate.js create <migration_name>');
        process.exit(1);
    }

    if (!fs.existsSync(MIGRATIONS_DIR)) {
        fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const safeName = name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    const upFile = path.join(MIGRATIONS_DIR, `${timestamp}_${safeName}.sql`);
    const downFile = path.join(MIGRATIONS_DIR, `${timestamp}_${safeName}.down.sql`);

    fs.writeFileSync(upFile, `-- Migration: ${safeName}\n-- Created: ${new Date().toISOString()}\n\n-- Write your UP migration SQL here\n\n`);
    fs.writeFileSync(downFile, `-- Rollback: ${safeName}\n-- Created: ${new Date().toISOString()}\n\n-- Write your DOWN (rollback) migration SQL here\n\n`);

    console.log(`\n✅ Created migration files:`);
    console.log(`   UP:   database/migrations/${path.basename(upFile)}`);
    console.log(`   DOWN: database/migrations/${path.basename(downFile)}\n`);
}

// ─── CLI Entry Point ───
async function main() {
    const command = process.argv[2] || 'status';
    const arg = process.argv[3];

    if (command === 'create') {
        createMigration(arg);
        return;
    }

    const pool = createPool();

    try {
        switch (command) {
            case 'up':
                const result = await migrateUp(pool);
                console.log(`\n✅ Applied ${result.applied} migration(s) (${result.total} total)\n`);
                break;
            case 'down':
                await migrateDown(pool);
                break;
            case 'status':
                await migrationStatus(pool);
                break;
            default:
                console.log('Usage: node database/migrate.js [up|down|status|create <name>]');
        }
    } catch (err) {
        console.error('Migration error:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Export for programmatic use (server startup)
module.exports = { migrateUp, migrationStatus, ensureMigrationTable };

// Run if called directly
if (require.main === module) {
    main();
}
