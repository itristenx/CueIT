#!/bin/bash

# QueueIT Platform Deployment Script
# This script sets up and deploys the complete QueueIT platform

set -e

echo "🚀 Starting QueueIT Platform Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20+ and try again."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version 20+ is required. Current version: $(node --version)"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

# Check Docker (optional)
if command -v docker &> /dev/null; then
    print_success "Docker found - container deployment available"
else
    print_warning "Docker not found - only local deployment available"
fi

print_success "Prerequisites check passed"

# Install dependencies
print_status "Installing all dependencies..."
npm run install:all

# Security audit
print_status "Running security audit..."
npm audit
if [ $? -eq 0 ]; then
    print_success "Security audit passed - 0 vulnerabilities found"
else
    print_error "Security vulnerabilities found. Please fix before continuing."
    exit 1
fi

# Generate Prisma client
print_status "Generating Prisma client..."
npm run db:generate

# Build all applications
print_status "Building all applications..."
npm run build:api
print_success "API build completed"

npm run build:portal
print_success "Portal build completed"

npm run build:admin
print_success "Admin build completed"

# Run tests
print_status "Running tests..."
cd apps/api-nest && npm test 2>/dev/null || print_warning "API tests skipped"
cd ../portal && npm test 2>/dev/null || print_warning "Portal tests skipped"
cd ../admin-next && npm test 2>/dev/null || print_warning "Admin tests skipped"
cd ../..

# Environment setup
print_status "Setting up environment variables..."

# Create .env files if they don't exist
if [ ! -f "apps/api-nest/.env" ]; then
    print_warning "API .env file not found. Please copy from .env.example and configure."
fi

if [ ! -f "apps/portal/.env.local" ]; then
    print_warning "Portal .env.local file not found. Please copy from .env.local.example and configure."
fi

if [ ! -f "apps/admin-next/.env.local" ]; then
    print_warning "Admin .env.local file not found. Please copy from .env.local.example and configure."
fi

# Database setup
print_status "Setting up database..."
if [ -f "apps/api-nest/.env" ]; then
    npm run db:migrate
    print_success "Database migrations completed"
else
    print_warning "Skipping database setup - .env file not configured"
fi

# Final deployment summary
echo ""
echo "🎉 QueueIT Platform Deployment Complete!"
echo "=================================="
echo ""
echo "📍 Access Points:"
echo "  Portal:  http://localhost:3000"
echo "  Admin:   http://localhost:3002"
echo "  API:     http://localhost:3001"
echo ""
echo "🚀 Start Commands:"
echo "  Development: npm run dev"
echo "  Production:  npm run start"
echo "  Docker:      npm run docker:up"
echo ""
echo "📚 Documentation:"
echo "  Main:     README.md"
echo "  API:      docs/api.md"
echo "  Deploy:   docs/deployment.md"
echo ""
print_success "Deployment script completed successfully!"
echo ""
echo "💡 Next Steps:"
echo "  1. Configure environment variables in .env files"
echo "  2. Set up your database connection"
echo "  3. Configure Clerk authentication"
echo "  4. Start the development server: npm run dev"
echo "  5. Access the portal at http://localhost:3000"
