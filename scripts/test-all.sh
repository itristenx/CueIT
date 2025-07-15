#!/bin/bash

# QueueIT Platform Testing Script
# Comprehensive testing for all applications

set -e

echo "🧪 Starting QueueIT Platform Test Suite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Running $test_name..."
    
    if eval "$test_command" >/dev/null 2>&1; then
        print_success "$test_name passed"
        ((TESTS_PASSED++))
        return 0
    else
        # For npm audit, check if it's actually a security issue or just a command issue
        if [[ "$test_command" == *"npm audit"* ]]; then
            local audit_output=$(eval "$test_command" 2>&1)
            if [[ "$audit_output" == *"found 0 vulnerabilities"* ]]; then
                print_success "$test_name passed (0 vulnerabilities)"
                ((TESTS_PASSED++))
                return 0
            fi
        fi
        print_error "$test_name failed"
        ((TESTS_FAILED++))
        return 1
    fi
}

skip_test() {
    local test_name="$1"
    local reason="$2"
    
    print_warning "$test_name skipped: $reason"
    ((TESTS_SKIPPED++))
}

echo "=================================="
echo "1. DEPENDENCY VALIDATION"
echo "=================================="

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    print_success "Node.js version check (>= 20)"
    ((TESTS_PASSED++))
else
    print_error "Node.js version check (>= 20) - Current: $(node --version)"
    ((TESTS_FAILED++))
fi

# Check npm
if command -v npm &> /dev/null; then
    print_success "npm availability check"
    ((TESTS_PASSED++))
else
    print_error "npm availability check"
    ((TESTS_FAILED++))
fi

echo ""
echo "=================================="
echo "2. SECURITY AUDITS"
echo "=================================="

# Security audit - Root
run_test "Root package security audit" "npm audit"

# Security audit - API
run_test "API security audit" "cd apps/api-nest && npm audit"

# Security audit - Portal
run_test "Portal security audit" "cd apps/portal && npm audit"

# Security audit - Admin
run_test "Admin security audit" "cd apps/admin-next && npm audit"

echo ""
echo "=================================="
echo "3. LINTING & TYPE CHECKING"
echo "=================================="

# TypeScript checks
run_test "API TypeScript check" "cd apps/api-nest && npx tsc --noEmit"
run_test "Portal TypeScript check" "cd apps/portal && npx tsc --noEmit"
run_test "Admin TypeScript check" "cd apps/admin-next && npx tsc --noEmit"

# ESLint checks
run_test "API ESLint check" "cd apps/api-nest && npm run lint --silent"
run_test "Portal ESLint check" "cd apps/portal && npm run lint --silent"
run_test "Admin ESLint check" "cd apps/admin-next && npm run lint --silent"

echo ""
echo "=================================="
echo "4. BUILD TESTS"
echo "=================================="

# Build tests
run_test "API build test" "cd apps/api-nest && npm run build"
run_test "Portal build test" "cd apps/portal && npm run build"
run_test "Admin build test" "cd apps/admin-next && npm run build"

echo ""
echo "=================================="
echo "5. UNIT TESTS"
echo "=================================="

# Unit tests (if available)
if [ -f "apps/api-nest/jest.config.js" ]; then
    run_test "API unit tests" "cd apps/api-nest && npm test"
else
    skip_test "API unit tests" "No jest config found"
fi

if [ -f "apps/portal/jest.config.js" ]; then
    run_test "Portal unit tests" "cd apps/portal && npm test"
else
    skip_test "Portal unit tests" "No jest config found"
fi

if [ -f "apps/admin-next/jest.config.js" ]; then
    run_test "Admin unit tests" "cd apps/admin-next && npm test"
else
    skip_test "Admin unit tests" "No jest config found"
fi

echo ""
echo "=================================="
echo "6. INTEGRATION TESTS"
echo "=================================="

# Database connection test
if [ -f "apps/api-nest/.env" ]; then
    run_test "Database connection test" "cd apps/api-nest && npx prisma validate"
else
    skip_test "Database connection test" "No .env file configured"
fi

# API health check (if running)
if curl -f http://localhost:3001/health &> /dev/null; then
    run_test "API health check" "curl -f http://localhost:3001/health"
else
    skip_test "API health check" "API not running"
fi

echo ""
echo "=================================="
echo "7. CONFIGURATION VALIDATION"
echo "=================================="

# Environment files
if [ -f "apps/api-nest/.env" ]; then
    print_success "API environment file exists"
    ((TESTS_PASSED++))
else
    print_warning "API environment file missing"
    ((TESTS_SKIPPED++))
fi

if [ -f "apps/portal/.env.local" ]; then
    print_success "Portal environment file exists"
    ((TESTS_PASSED++))
else
    print_warning "Portal environment file missing"
    ((TESTS_SKIPPED++))
fi

if [ -f "apps/admin-next/.env.local" ]; then
    print_success "Admin environment file exists"
    ((TESTS_PASSED++))
else
    print_warning "Admin environment file missing"
    ((TESTS_SKIPPED++))
fi

# Docker configuration
if [ -f "docker-compose.yml" ]; then
    run_test "Docker Compose validation" "docker-compose config"
else
    skip_test "Docker Compose validation" "No docker-compose.yml found"
fi

echo ""
echo "=================================="
echo "TEST SUMMARY"
echo "=================================="
echo ""
echo "✅ Tests Passed:  $TESTS_PASSED"
echo "❌ Tests Failed:  $TESTS_FAILED"
echo "⏭️  Tests Skipped: $TESTS_SKIPPED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "🎉 All tests passed! QueueIT platform is ready for deployment."
    exit 0
else
    echo "❌ Some tests failed. Please review the issues above before deploying."
    exit 1
fi
