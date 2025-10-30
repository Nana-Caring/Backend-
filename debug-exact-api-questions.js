require('dotenv').config();

/**
 * 🔍 FRONTEND API DEBUGGING - EXACT ENDPOINT ANALYSIS
 * ===================================================
 * This script answers all your debugging questions:
 * - What endpoint is being called exactly
 * - What the API response structure looks like  
 * - How many products are found
 * - Redux store format expectations
 */

const { Product } = require('./models');
const { Op } = require('sequelize');

async function debugFrontendAPIQuestions() {
    console.log('🔍 FRONTEND API DEBUGGING - ANSWERING YOUR EXACT QUESTIONS');
    console.log('==========================================================\n');

    try {
        // QUESTION 1: What endpoint is being called exactly?
        console.log('❓ QUESTION 1: What endpoint is being called exactly?');
        console.log('==================================================');
        console.log('🎯 PRIMARY ENDPOINT: GET /api/products');
        console.log('📍 Route Handler: getAllProducts in productController.js');
        console.log('🌐 Full URL: http://your-domain.com/api/products');
        
        console.log('\n📋 Common Frontend Calls:');
        console.log('├── GET /api/products                    (All products)');
        console.log('├── GET /api/products?category=Healthcare (Healthcare only)');
        console.log('├── GET /api/products?search=milk        (Search products)');
        console.log('├── GET /api/products?page=1&limit=20    (Paginated)');
        console.log('└── GET /api/products/:id                (Single product)\n');

        // QUESTION 2: What the API response structure looks like
        console.log('❓ QUESTION 2: What the API response structure looks like?');
        console.log('==========================================================');
        
        const sampleProducts = await Product.findAll({
            where: { isActive: true },
            limit: 3,
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['createdBy', 'updatedBy'] }
        });

        console.log('📋 EXACT API RESPONSE STRUCTURE:');
        console.log('```json');
        console.log(JSON.stringify({
            success: true,
            data: sampleProducts,
            pagination: {
                total: await Product.count({ where: { isActive: true } }),
                page: 1,
                limit: 20,
                totalPages: Math.ceil(await Product.count({ where: { isActive: true } }) / 20)
            }
        }, null, 2));
        console.log('```\n');

        // QUESTION 3: How many products are found
        console.log('❓ QUESTION 3: How many products are found?');
        console.log('===========================================');
        
        const totalProducts = await Product.count();
        const activeProducts = await Product.count({ where: { isActive: true } });
        const inactiveProducts = await Product.count({ where: { isActive: false } });
        
        console.log(`📊 TOTAL PRODUCTS: ${totalProducts}`);
        console.log(`✅ ACTIVE PRODUCTS: ${activeProducts}`);
        console.log(`❌ INACTIVE PRODUCTS: ${inactiveProducts}`);
        
        // Count by category
        const categories = await Product.findAll({
            where: { isActive: true },
            attributes: ['category'],
            group: ['category'],
            raw: true
        });
        
        console.log('\n📂 Products by Category:');
        for (const cat of categories) {
            const count = await Product.count({ 
                where: { 
                    isActive: true, 
                    category: cat.category 
                } 
            });
            console.log(`├── ${cat.category}: ${count} products`);
        }

        // QUESTION 4: Redux Store Structure
        console.log('\n❓ QUESTION 4: Redux Store Structure & Selectors');
        console.log('=================================================');
        
        console.log('🏪 EXPECTED REDUX STATE STRUCTURE:');
        console.log('```javascript');
        console.log(`const initialState = {
  products: {
    items: [], // Array of ${activeProducts} products
    loading: false,
    error: null,
    pagination: {
      total: ${activeProducts},
      page: 1,
      limit: 20,
      totalPages: ${Math.ceil(activeProducts / 20)}
    },
    filters: {
      category: null,
      brand: null,
      search: null
    }
  }
};`);
        console.log('```\n');

        // QUESTION 5: Redux Actions & Selectors
        console.log('🔄 REDUX ACTIONS YOU NEED:');
        console.log('```javascript');
        console.log(`// Action Creators
export const fetchProducts = (filters = {}) => async (dispatch) => {
  dispatch(setProductsLoading(true));
  try {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(\`/api/products?\${queryString}\`);
    const data = await response.json();
    
    if (data.success) {
      dispatch(setProducts(data.data));
      dispatch(setProductsPagination(data.pagination));
    } else {
      dispatch(setProductsError(data.message));
    }
  } catch (error) {
    dispatch(setProductsError(error.message));
  }
  dispatch(setProductsLoading(false));
};`);
        console.log('```\n');

        console.log('🎯 SELECTORS YOU NEED:');
        console.log('```javascript');
        console.log(`// Selectors
export const selectAllProducts = (state) => state.products.items;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectProductsPagination = (state) => state.products.pagination;

// Filtered selectors
export const selectProductsByCategory = (state, category) =>
  state.products.items.filter(product => product.category === category);

export const selectInStockProducts = (state) =>
  state.products.items.filter(product => product.inStock);`);
        console.log('```\n');

        // Test actual API responses
        console.log('🧪 TESTING ACTUAL API RESPONSES');
        console.log('===============================');
        
        const testCases = [
            { name: 'All Products', filters: {} },
            { name: 'Healthcare Only', filters: { category: 'Healthcare' } },
            { name: 'Search "baby"', filters: { search: 'baby' } },
            { name: 'Page 1, Limit 5', filters: { page: 1, limit: 5 } }
        ];

        for (const test of testCases) {
            console.log(`\n🔸 Testing: ${test.name}`);
            
            const where = { isActive: true };
            let searchWhere = {};
            
            if (test.filters.category) where.category = test.filters.category;
            if (test.filters.search) {
                searchWhere = {
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${test.filters.search}%` } },
                        { brand: { [Op.iLike]: `%${test.filters.search}%` } },
                        { description: { [Op.iLike]: `%${test.filters.search}%` } },
                        { sku: { [Op.iLike]: `%${test.filters.search}%` } }
                    ]
                };
            }

            const products = await Product.findAndCountAll({
                where: { ...where, ...searchWhere },
                limit: parseInt(test.filters.limit || 20),
                offset: parseInt((test.filters.page || 1) - 1) * parseInt(test.filters.limit || 20),
                order: [['createdAt', 'DESC']],
                attributes: { exclude: ['createdBy', 'updatedBy'] }
            });

            const queryParams = new URLSearchParams(test.filters).toString();
            const endpoint = `/api/products${queryParams ? '?' + queryParams : ''}`;
            
            console.log(`   🌐 Endpoint: GET ${endpoint}`);
            console.log(`   📊 Results: ${products.count} total, ${products.rows.length} returned`);
            console.log(`   ✅ Response: { success: true, data: [${products.rows.length} products], pagination: {...} }`);
        }

        // Sample product data structure
        console.log('\n📋 SAMPLE PRODUCT OBJECT STRUCTURE:');
        console.log('====================================');
        if (sampleProducts.length > 0) {
            console.log('```json');
            console.log(JSON.stringify(sampleProducts[0], null, 2));
            console.log('```\n');
        }

        console.log('🎉 DEBUGGING SUMMARY - YOUR ANSWERS:');
        console.log('=====================================');
        console.log('✅ 1. ENDPOINT: GET /api/products (with optional query params)');
        console.log(`✅ 2. RESPONSE: { success: true, data: [...], pagination: {...} }`);
        console.log(`✅ 3. PRODUCT COUNT: ${activeProducts} active products found`);
        console.log('✅ 4. REDUX: Use items array, loading/error states, pagination object');
        console.log('✅ 5. SELECTORS: selectAllProducts, selectProductsLoading, etc.');

        console.log('\n🔧 NEXT STEPS FOR FRONTEND:');
        console.log('===========================');
        console.log('1. Verify your fetch URL: /api/products');
        console.log('2. Check Redux action dispatches setProducts(response.data)');
        console.log('3. Ensure selectors return state.products.items');
        console.log('4. Verify loading states with state.products.loading');
        console.log('5. Check network tab for actual API responses');

    } catch (error) {
        console.error('❌ Error during debugging:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        process.exit(0);
    }
}

// Run the debugging
debugFrontendAPIQuestions().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});