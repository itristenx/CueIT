#!/bin/bash

# QueueIT HelpScout Import Script
# Imports tickets and conversations from HelpScout API

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Configuration
HELPSCOUT_API_KEY="${HELPSCOUT_API_KEY:-}"
HELPSCOUT_MAILBOX_ID="${HELPSCOUT_MAILBOX_ID:-}"
IMPORT_DIR="${PROJECT_ROOT}/imports/helpscout/$(date +%Y%m%d_%H%M%S)"
POSTGRES_URL="${DATABASE_URL:-postgresql://localhost:5432/queueit_db}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting HelpScout Import to QueueIT${NC}"

# Create import directory
mkdir -p "${IMPORT_DIR}"

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

# Check required environment variables
if [ -z "${HELPSCOUT_API_KEY}" ]; then
    error "HELPSCOUT_API_KEY environment variable is required"
fi

if [ -z "${HELPSCOUT_MAILBOX_ID}" ]; then
    error "HELPSCOUT_MAILBOX_ID environment variable is required"
fi

# Check if PostgreSQL is running
log "Checking PostgreSQL connection..."
if ! pg_isready -d "${POSTGRES_URL}" > /dev/null 2>&1; then
    error "Cannot connect to PostgreSQL database at ${POSTGRES_URL}"
fi

log "✅ PostgreSQL connection successful"

# Create HelpScout import script
log "Creating HelpScout import script..."
cat > "${IMPORT_DIR}/helpscout-import.js" << 'EOF'
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// HelpScout API configuration
const HELPSCOUT_API_KEY = process.env.HELPSCOUT_API_KEY;
const HELPSCOUT_MAILBOX_ID = process.env.HELPSCOUT_MAILBOX_ID;
const HELPSCOUT_BASE_URL = 'https://api.helpscout.net/v2';

// Create axios instance with authentication
const helpscoutApi = axios.create({
  baseURL: HELPSCOUT_BASE_URL,
  headers: {
    'Authorization': `Bearer ${HELPSCOUT_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

async function importFromHelpScout() {
  try {
    console.log('🔄 Starting HelpScout import...');
    
    // Import customers first
    console.log('👥 Importing customers...');
    const customers = await importCustomers();
    console.log(`✅ Imported ${customers.length} customers`);
    
    // Import conversations (tickets)
    console.log('💬 Importing conversations...');
    const conversations = await importConversations();
    console.log(`✅ Imported ${conversations.length} conversations`);
    
    // Import knowledge base articles
    console.log('📚 Importing knowledge base articles...');
    const articles = await importKnowledgeBase();
    console.log(`✅ Imported ${articles.length} knowledge base articles`);
    
    // Generate import report
    generateImportReport(customers, conversations, articles);
    
    console.log('🎉 HelpScout import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function importCustomers() {
  const customers = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const response = await helpscoutApi.get(`/customers?page=${page}&mailbox=${HELPSCOUT_MAILBOX_ID}`);
      const data = response.data;
      
      for (const customer of data._embedded.customers) {
        try {
          const user = await prisma.user.upsert({
            where: { email: customer.emails[0]?.value },
            update: {},
            create: {
              id: `hs_${customer.id}`,
              email: customer.emails[0]?.value,
              name: `${customer.firstName} ${customer.lastName}`.trim(),
              clerkId: `helpscout_${customer.id}`,
              role: 'end_user',
              metadata: {
                helpscoutId: customer.id,
                importedFromHelpScout: true,
                importDate: new Date().toISOString()
              },
              createdAt: new Date(customer.createdAt),
              updatedAt: new Date(customer.updatedAt)
            }
          });
          customers.push(user);
        } catch (error) {
          console.warn(`Warning: Could not import customer ${customer.id}:`, error.message);
        }
      }
      
      hasMore = data.page.number < data.page.totalPages;
      page++;
    } catch (error) {
      console.error('Error fetching customers:', error.message);
      break;
    }
  }
  
  return customers;
}

async function importConversations() {
  const conversations = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const response = await helpscoutApi.get(`/conversations?page=${page}&mailbox=${HELPSCOUT_MAILBOX_ID}&embed=customer,threads`);
      const data = response.data;
      
      for (const conversation of data._embedded.conversations) {
        try {
          // Find or create user
          let userId = null;
          if (conversation._embedded.customer) {
            const customer = conversation._embedded.customer;
            const user = await prisma.user.findUnique({
              where: { email: customer.emails[0]?.value }
            });
            userId = user?.id || `hs_${customer.id}`;
          }
          
          // Create ticket
          const ticket = await prisma.ticket.upsert({
            where: { id: `hs_${conversation.id}` },
            update: {},
            create: {
              id: `hs_${conversation.id}`,
              ticketNumber: `HS-${conversation.number}`,
              title: conversation.subject,
              description: conversation.preview || 'Imported from HelpScout',
              status: mapHelpScoutStatus(conversation.status),
              priority: mapHelpScoutPriority(conversation.priority),
              category: conversation.tags?.[0] || 'imported',
              creatorId: userId,
              metadata: {
                helpscoutId: conversation.id,
                helpscoutNumber: conversation.number,
                importedFromHelpScout: true,
                importDate: new Date().toISOString(),
                originalTags: conversation.tags
              },
              createdAt: new Date(conversation.createdAt),
              updatedAt: new Date(conversation.updatedAt)
            }
          });
          
          // Import threads as comments
          if (conversation._embedded.threads) {
            for (const thread of conversation._embedded.threads) {
              await prisma.comment.upsert({
                where: { id: `hs_${thread.id}` },
                update: {},
                create: {
                  id: `hs_${thread.id}`,
                  content: thread.body,
                  ticketId: ticket.id,
                  authorId: userId,
                  isInternal: thread.type === 'note',
                  metadata: {
                    helpscoutId: thread.id,
                    threadType: thread.type,
                    importedFromHelpScout: true
                  },
                  createdAt: new Date(thread.createdAt),
                  updatedAt: new Date(thread.updatedAt)
                }
              });
            }
          }
          
          conversations.push(ticket);
        } catch (error) {
          console.warn(`Warning: Could not import conversation ${conversation.id}:`, error.message);
        }
      }
      
      hasMore = data.page.number < data.page.totalPages;
      page++;
    } catch (error) {
      console.error('Error fetching conversations:', error.message);
      break;
    }
  }
  
  return conversations;
}

async function importKnowledgeBase() {
  const articles = [];
  
  try {
    // Get knowledge base sites
    const sitesResponse = await helpscoutApi.get('/docs/sites');
    const sites = sitesResponse.data._embedded.sites;
    
    for (const site of sites) {
      // Get collections for each site
      const collectionsResponse = await helpscoutApi.get(`/docs/sites/${site.id}/collections`);
      const collections = collectionsResponse.data._embedded.collections;
      
      for (const collection of collections) {
        // Get articles for each collection
        const articlesResponse = await helpscoutApi.get(`/docs/collections/${collection.id}/articles`);
        const collectionArticles = articlesResponse.data._embedded.articles;
        
        for (const article of collectionArticles) {
          try {
            const kbArticle = await prisma.knowledgeBase.upsert({
              where: { id: `hs_${article.id}` },
              update: {},
              create: {
                id: `hs_${article.id}`,
                title: article.name,
                content: article.text,
                category: collection.name,
                tags: article.tags || [],
                authorId: 'system',
                published: article.status === 'published',
                metadata: {
                  helpscoutId: article.id,
                  collectionId: collection.id,
                  siteId: site.id,
                  importedFromHelpScout: true,
                  importDate: new Date().toISOString()
                },
                createdAt: new Date(article.createdAt),
                updatedAt: new Date(article.updatedAt)
              }
            });
            articles.push(kbArticle);
          } catch (error) {
            console.warn(`Warning: Could not import article ${article.id}:`, error.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching knowledge base:', error.message);
  }
  
  return articles;
}

function mapHelpScoutStatus(status) {
  const statusMap = {
    'active': 'OPEN',
    'closed': 'CLOSED',
    'pending': 'PENDING',
    'spam': 'CLOSED'
  };
  return statusMap[status] || 'OPEN';
}

function mapHelpScoutPriority(priority) {
  const priorityMap = {
    'low': 'LOW',
    'normal': 'MEDIUM',
    'high': 'HIGH',
    'urgent': 'URGENT'
  };
  return priorityMap[priority] || 'MEDIUM';
}

function generateImportReport(customers, conversations, articles) {
  const report = {
    importDate: new Date().toISOString(),
    summary: {
      customers: customers.length,
      conversations: conversations.length,
      articles: articles.length
    },
    details: {
      customers: customers.map(c => ({ id: c.id, email: c.email, name: c.name })),
      conversations: conversations.map(c => ({ id: c.id, title: c.title, status: c.status })),
      articles: articles.map(a => ({ id: a.id, title: a.title, category: a.category }))
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'import-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('📊 Import report generated: import-report.json');
}

// Start import
importFromHelpScout();
EOF

# Make the import script executable
chmod +x "${IMPORT_DIR}/helpscout-import.js"

# Install required dependencies
log "Installing dependencies..."
cd "${PROJECT_ROOT}/apps/api-nest"
npm install axios

# Run the import
log "Running HelpScout import..."
export HELPSCOUT_API_KEY="${HELPSCOUT_API_KEY}"
export HELPSCOUT_MAILBOX_ID="${HELPSCOUT_MAILBOX_ID}"
node "${IMPORT_DIR}/helpscout-import.js"

log "✅ HelpScout import completed successfully!"
log "📁 Import files saved to: ${IMPORT_DIR}"
log "📊 Check the import report at: ${IMPORT_DIR}/import-report.json"

echo -e "${GREEN}🎉 HelpScout import completed! Your data has been successfully imported from HelpScout.${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "   1. Review the imported data using: npx prisma studio"
echo -e "   2. Check the import report for details"
echo -e "   3. Verify ticket assignments and user roles"
echo -e "   4. Update any custom fields or categories as needed"
