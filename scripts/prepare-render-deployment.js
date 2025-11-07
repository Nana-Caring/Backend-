#!/usr/bin/env node

/**
 * NANA CARING BACKEND - RENDER DEPLOYMENT PREPARATION
 * ==================================================
 * 
 * This script prepares the backend for deployment to Render.
 * Make sure to:
 * 1. Commit all your changes to Git
 * 2. Push to your GitHub repository
 * 3. Deploy on Render using this repository
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 PREPARING NANA CARING BACKEND FOR RENDER DEPLOYMENT');
console.log('======================================================');

// Check if all necessary files exist
const requiredFiles = [
    '.env',
    'package.json', 
    'server.js',
    'models/index.js',
    'controllers/orderController.js'
];

console.log('\n📋 CHECKING REQUIRED FILES:');
let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING!`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing. Please check your project structure.');
    process.exit(1);
}

// Check environment configuration
console.log('\n🔧 CHECKING ENVIRONMENT CONFIGURATION:');
const envContent = fs.readFileSync('.env', 'utf8');

const requiredEnvVars = [
    'NODE_ENV=production',
    'DATABASE_URL=',
    'JWT_SECRET=',
    'CORS_ORIGIN=',
    'GMAIL_USER='
];

requiredEnvVars.forEach(envVar => {
    const [key] = envVar.split('=');
    if (envContent.includes(key)) {
        console.log(`✅ ${key}`);
    } else {
        console.log(`❌ ${key} - MISSING!`);
    }
});

// Check if OrderItem association fixes are applied
console.log('\n🔍 CHECKING ORDERITEM ASSOCIATION FIXES:');
const orderControllerContent = fs.readFileSync('controllers/orderController.js', 'utf8');

if (orderControllerContent.includes("as: 'items'") && !orderControllerContent.includes("as: 'orderItems'")) {
    console.log('✅ OrderItem associations are correctly fixed');
} else {
    console.log('⚠️  OrderItem associations may still have issues - check for "as: \'orderItems\'" references');
}

console.log('\n📦 RENDER DEPLOYMENT INSTRUCTIONS:');
console.log('==================================');
console.log('1. Commit and push all changes to GitHub:');
console.log('   git add .');
console.log('   git commit -m "Deploy: Fixed OrderItem associations and unified environment"');
console.log('   git push origin main');
console.log('');
console.log('2. On Render Dashboard:');
console.log('   • Create new Web Service');
console.log('   • Connect to your GitHub repository');
console.log('   • Use these settings:');
console.log('     - Build Command: npm install');
console.log('     - Start Command: npm start');
console.log('     - Environment: Copy variables from .env file');
console.log('');
console.log('3. Environment Variables to set on Render:');
console.log('   (Copy these from your .env file)');

// Extract and display important environment variables
const envLines = envContent.split('\n');
const importantVars = [
    'NODE_ENV', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 
    'DATABASE_URL', 'CORS_ORIGIN', 'GMAIL_USER', 'GMAIL_PASS'
];

importantVars.forEach(varName => {
    const line = envLines.find(l => l.startsWith(varName + '='));
    if (line) {
        console.log(`   ${varName}=${line.split('=')[1]}`);
    }
});

console.log('\n🎯 FRONTEND CONNECTION:');
console.log('======================');
console.log('Your frontend on http://localhost:5174 should connect to:');
console.log('📡 Production API: https://nanacaring-backend.onrender.com/api');
console.log('');
console.log('Example frontend configuration:');
console.log('const API_BASE_URL = "https://nanacaring-backend.onrender.com/api";');

console.log('\n✅ DEPLOYMENT READY!');
console.log('Make sure to update Render environment variables and deploy.');
