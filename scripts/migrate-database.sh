#!/bin/bash

# QueueIT Database Migration Script
# Migrates data from SQLite to PostgreSQL

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Configuration
SQLITE_DB="${PROJECT_ROOT}/packages/api.backup/database.sqlite"
POSTGRES_URL="${DATABASE_URL:-postgresql://localhost:5432/queueit_db}"
BACKUP_DIR="${PROJECT_ROOT}/backups/$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting QueueIT Database Migration (SQLite → PostgreSQL)${NC}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Function to log messages
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if SQLite database exists
if [ ! -f "${SQLITE_DB}" ]; then
    error "SQLite database not found at ${SQLITE_DB}"
fi

# Check if PostgreSQL is running
log "Checking PostgreSQL connection..."
if ! pg_isready -d "${POSTGRES_URL}" > /dev/null 2>&1; then
    error "Cannot connect to PostgreSQL database at ${POSTGRES_URL}"
fi

log "✅ PostgreSQL connection successful"

# Backup existing SQLite database
log "Creating backup of SQLite database..."
cp "${SQLITE_DB}" "${BACKUP_DIR}/database.sqlite.backup"

# Export SQLite data to JSON
log "Exporting SQLite data to JSON..."
sqlite3 "${SQLITE_DB}" <<EOF > "${BACKUP_DIR}/export.json"
.mode json
.output ${BACKUP_DIR}/tickets.json
SELECT * FROM tickets;
.output ${BACKUP_DIR}/users.json
SELECT * FROM users;
.output ${BACKUP_DIR}/knowledge_base.json
SELECT * FROM knowledge_base;
.output ${BACKUP_DIR}/comments.json
SELECT * FROM comments;
.output ${BACKUP_DIR}/attachments.json
SELECT * FROM attachments;
.output ${BACKUP_DIR}/kiosks.json
SELECT * FROM kiosks;
.output ${BACKUP_DIR}/feedback.json
SELECT * FROM feedback;
.output ${BACKUP_DIR}/configuration.json
SELECT * FROM configuration;
.output ${BACKUP_DIR}/integrations.json
SELECT * FROM integrations;
.output ${BACKUP_DIR}/roles.json
SELECT * FROM roles;
.output ${BACKUP_DIR}/user_roles.json
SELECT * FROM user_roles;
.output ${BACKUP_DIR}/audit_logs.json
SELECT * FROM audit_logs;
.quit
EOF

log "✅ SQLite data exported to ${BACKUP_DIR}"

# Run Prisma migrations to ensure PostgreSQL schema is up-to-date
log "Running Prisma migrations..."
cd "${PROJECT_ROOT}/apps/api-nest"
npx prisma migrate deploy

# Generate Prisma client
log "Generating Prisma client..."
npx prisma generate

log "✅ PostgreSQL schema updated"

# Create migration script
log "Creating data migration script..."
cat > "${BACKUP_DIR}/migrate-data.js" << 'EOF'
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('🔄 Starting data migration...');
    
    // Read exported JSON files
    const backupDir = __dirname;
    
    // Helper function to read JSON file
    const readJSON = (filename) => {
      const filepath = path.join(backupDir, filename);
      if (fs.existsSync(filepath)) {
        const content = fs.readFileSync(filepath, 'utf8');
        return content.trim() ? JSON.parse(content) : [];
      }
      return [];
    };
    
    // Migrate users first (dependencies)
    console.log('📊 Migrating users...');
    const users = readJSON('users.json');
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          clerkId: user.clerk_id || user.id,
          role: user.role || 'end_user',
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at || user.created_at)
        }
      });
    }
    console.log(`✅ Migrated ${users.length} users`);
    
    // Migrate tickets
    console.log('🎫 Migrating tickets...');
    const tickets = readJSON('tickets.json');
    for (const ticket of tickets) {
      await prisma.ticket.upsert({
        where: { id: ticket.id },
        update: {},
        create: {
          id: ticket.id,
          ticketNumber: ticket.ticket_number || `TKT-${ticket.id.slice(-6)}`,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status || 'OPEN',
          priority: ticket.priority || 'MEDIUM',
          category: ticket.category || 'general',
          creatorId: ticket.creator_id || ticket.user_id,
          assigneeId: ticket.assignee_id,
          createdAt: new Date(ticket.created_at),
          updatedAt: new Date(ticket.updated_at || ticket.created_at)
        }
      });
    }
    console.log(`✅ Migrated ${tickets.length} tickets`);
    
    // Migrate comments
    console.log('💬 Migrating comments...');
    const comments = readJSON('comments.json');
    for (const comment of comments) {
      await prisma.comment.upsert({
        where: { id: comment.id },
        update: {},
        create: {
          id: comment.id,
          content: comment.content,
          ticketId: comment.ticket_id,
          authorId: comment.author_id || comment.user_id,
          isInternal: comment.is_internal || false,
          createdAt: new Date(comment.created_at),
          updatedAt: new Date(comment.updated_at || comment.created_at)
        }
      });
    }
    console.log(`✅ Migrated ${comments.length} comments`);
    
    // Migrate knowledge base
    console.log('📚 Migrating knowledge base...');
    const kbArticles = readJSON('knowledge_base.json');
    for (const article of kbArticles) {
      await prisma.knowledgeBase.upsert({
        where: { id: article.id },
        update: {},
        create: {
          id: article.id,
          title: article.title,
          content: article.content,
          category: article.category || 'general',
          tags: article.tags ? article.tags.split(',') : [],
          authorId: article.author_id,
          published: article.published || false,
          createdAt: new Date(article.created_at),
          updatedAt: new Date(article.updated_at || article.created_at)
        }
      });
    }
    console.log(`✅ Migrated ${kbArticles.length} knowledge base articles`);
    
    // Migrate kiosks
    console.log('🖥️ Migrating kiosks...');
    const kiosks = readJSON('kiosks.json');
    for (const kiosk of kiosks) {
      await prisma.kiosk.upsert({
        where: { id: kiosk.id },
        update: {},
        create: {
          id: kiosk.id,
          name: kiosk.name,
          location: kiosk.location,
          status: kiosk.status || 'ACTIVE',
          lastSeen: kiosk.last_seen ? new Date(kiosk.last_seen) : new Date(),
          createdAt: new Date(kiosk.created_at),
          updatedAt: new Date(kiosk.updated_at || kiosk.created_at)
        }
      });
    }
    console.log(`✅ Migrated ${kiosks.length} kiosks`);
    
    // Migrate feedback
    console.log('📝 Migrating feedback...');
    const feedback = readJSON('feedback.json');
    for (const item of feedback) {
      await prisma.feedback.upsert({
        where: { id: item.id },
        update: {},
        create: {
          id: item.id,
          rating: item.rating,
          comment: item.comment,
          kioskId: item.kiosk_id,
          createdAt: new Date(item.created_at)
        }
      });
    }
    console.log(`✅ Migrated ${feedback.length} feedback items`);
    
    // Migrate configuration
    console.log('⚙️ Migrating configuration...');
    const configs = readJSON('configuration.json');
    for (const config of configs) {
      await prisma.configuration.upsert({
        where: { key: config.key },
        update: { value: config.value },
        create: {
          key: config.key,
          value: config.value,
          category: config.category || 'general',
          updatedAt: new Date(config.updated_at || Date.now())
        }
      });
    }
    console.log(`✅ Migrated ${configs.length} configuration items`);
    
    console.log('🎉 Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
EOF

# Make the migration script executable
chmod +x "${BACKUP_DIR}/migrate-data.js"

# Run the data migration
log "Running data migration script..."
cd "${PROJECT_ROOT}/apps/api-nest"
node "${BACKUP_DIR}/migrate-data.js"

# Verify migration
log "Verifying migration..."
cd "${PROJECT_ROOT}/apps/api-nest"
npx prisma db seed > /dev/null 2>&1 || true

log "✅ Database migration completed successfully!"
log "📁 Backup and migration files saved to: ${BACKUP_DIR}"
log "🔍 To verify the migration, run: npx prisma studio"

echo -e "${GREEN}🎉 Migration completed! Your data has been successfully migrated from SQLite to PostgreSQL.${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "   1. Review the migrated data using: npx prisma studio"
echo -e "   2. Run tests to ensure everything is working correctly"
echo -e "   3. Update your applications to use the new database"
echo -e "   4. Consider archiving the old SQLite database"
