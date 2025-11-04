#!/bin/bash

# Order System Test Runner
# Runs comprehensive tests for the NANA Project order system

echo "🚀 === NANA PROJECT ORDER SYSTEM TEST SUITE === 🚀"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

run_test() {
    local test_name="$1"
    local test_file="$2"
    
    echo -e "${BLUE}🧪 Running: $test_name${NC}"
    echo "   File: $test_file"
    echo ""
    
    if node "$test_file"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js to run tests.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Starting order system test suite...${NC}"
echo ""

# Test 1: Order System Setup and Basic Functionality
run_test "Order System Setup & Basic Functions" "demonstrate-order-system.js"

# Test 2: Comprehensive Order System Tests
run_test "Comprehensive Order System Tests" "test-order-system-comprehensive.js"

# Test 3: Direct API Controller Tests
run_test "Direct API Controller Tests" "test-order-api-direct.js"

# Summary
echo "🏁 === TEST SUMMARY === 🏁"
echo ""
echo "Total Tests Run: $TOTAL_TESTS"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Order system is working correctly.${NC}"
    echo ""
    echo "✅ Checkout flow with pickup/delivery options"
    echo "✅ Store code verification system"
    echo "✅ Address auto-mapping from user profile"
    echo "✅ Balance validation and error handling"
    echo "✅ Order creation and item management"
    echo "✅ Response format validation"
    echo ""
    echo "Your order system is ready for production! 🚀"
    exit 0
else
    echo -e "${RED}💥 $TESTS_FAILED test(s) failed. Please check the output above for details.${NC}"
    echo ""
    echo "Common issues to check:"
    echo "• Database connection and models are properly configured"
    echo "• Test data exists (users with cart items and accounts)"
    echo "• Environment variables are set correctly"
    echo "• All dependencies are installed (npm install)"
    exit 1
fi