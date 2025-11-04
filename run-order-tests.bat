@echo off
REM Order System Test Runner for Windows
REM Runs comprehensive tests for the NANA Project order system

echo 🚀 === NANA PROJECT ORDER SYSTEM TEST SUITE === 🚀
echo.

REM Test results tracking
set TESTS_PASSED=0
set TESTS_FAILED=0
set TOTAL_TESTS=0

REM Check if Node.js is available
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js to run tests.
    exit /b 1
)

echo 📋 Starting order system test suite...
echo.

REM Function to run a test
:run_test
set test_name=%~1
set test_file=%~2

echo 🧪 Running: %test_name%
echo    File: %test_file%
echo.

node "%test_file%"
if %errorlevel% equ 0 (
    echo ✅ PASSED: %test_name%
    set /a TESTS_PASSED+=1
) else (
    echo ❌ FAILED: %test_name%
    set /a TESTS_FAILED+=1
)

set /a TOTAL_TESTS+=1
echo.
echo ----------------------------------------
echo.
goto :eof

REM Test 1: Order System Setup and Basic Functionality
call :run_test "Order System Setup & Basic Functions" "demonstrate-order-system.js"

REM Test 2: Comprehensive Order System Tests  
call :run_test "Comprehensive Order System Tests" "test-order-system-comprehensive.js"

REM Test 3: Direct API Controller Tests
call :run_test "Direct API Controller Tests" "test-order-api-direct.js"

REM Summary
echo 🏁 === TEST SUMMARY === 🏁
echo.
echo Total Tests Run: %TOTAL_TESTS%
echo Tests Passed: %TESTS_PASSED%
echo Tests Failed: %TESTS_FAILED%
echo.

if %TESTS_FAILED% equ 0 (
    echo 🎉 ALL TESTS PASSED! Order system is working correctly.
    echo.
    echo ✅ Checkout flow with pickup/delivery options
    echo ✅ Store code verification system  
    echo ✅ Address auto-mapping from user profile
    echo ✅ Balance validation and error handling
    echo ✅ Order creation and item management
    echo ✅ Response format validation
    echo.
    echo Your order system is ready for production! 🚀
    exit /b 0
) else (
    echo 💥 %TESTS_FAILED% test(s) failed. Please check the output above for details.
    echo.
    echo Common issues to check:
    echo • Database connection and models are properly configured
    echo • Test data exists (users with cart items and accounts)
    echo • Environment variables are set correctly  
    echo • All dependencies are installed (npm install)
    exit /b 1
)