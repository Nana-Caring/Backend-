const express = require('express');
const { Pool } = require('pg');

const router = express.Router();

// Database connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'Nana Caring',
  user: 'postgres',
  password: 'Prince@082',
});

/**
 * GET /api/products/age-filtered
 * Filter products based on user's age and category
 * Query parameters:
 * - age: User's age (required)
 * - category: Product category filter (optional)
 * - limit: Number of results to return (optional, default: 50)
 * - offset: Pagination offset (optional, default: 0)
 */
router.get('/age-filtered', async (req, res) => {
  try {
    const { age, category, limit = 50, offset = 0 } = req.query;

    // Validate age parameter
    if (!age || isNaN(age) || age < 0 || age > 150) {
      return res.status(400).json({
        error: 'Invalid age parameter. Age must be a number between 0 and 150.',
        success: false
      });
    }

    const userAge = parseInt(age);

    // Build the query
    let query = `
      SELECT 
        id,
        name,
        brand,
        description,
        "detailedDescription",
        price,
        category,
        subcategory,
        sku,
        "stockQuantity",
        image,
        tags,
        "minAge",
        "maxAge",
        "ageCategory",
        "requiresAgeVerification",
        "inStock",
        manufacturer,
        weight,
        ingredients
      FROM "products"
      WHERE "minAge" <= $1 
        AND "maxAge" >= $1
        AND "isActive" = true
        AND "inStock" = true
    `;

    const queryParams = [userAge];
    let paramCounter = 2;

    // Add category filter if provided
    if (category) {
      query += ` AND category = $${paramCounter}`;
      queryParams.push(category);
      paramCounter++;
    }

    // Add ordering and pagination
    query += ` ORDER BY 
        CASE 
          WHEN "ageCategory" = 'All Ages' THEN 2
          ELSE 1
        END,
        category,
        price
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    
    queryParams.push(parseInt(limit), parseInt(offset));

    // Execute query
    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM "products"
      WHERE "minAge" <= $1 
        AND "maxAge" >= $1
        AND "isActive" = true
        AND "inStock" = true
    `;
    
    let countParams = [userAge];
    if (category) {
      countQuery += ` AND category = $2`;
      countParams.push(category);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalProducts = parseInt(countResult.rows[0].total);

    // Group products by category for better organization
    const productsByCategory = {};
    result.rows.forEach(product => {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = [];
      }
      
      // Parse tags if they're stored as JSON string
      if (typeof product.tags === 'string') {
        try {
          product.tags = JSON.parse(product.tags);
        } catch (e) {
          product.tags = [];
        }
      }

      productsByCategory[product.category].push(product);
    });

    // Calculate age appropriateness score
    const productsWithScore = result.rows.map(product => {
      // Calculate how well the product matches the user's age
      const ageRange = product.maxAge - product.minAge;
      const agePosition = (userAge - product.minAge) / ageRange;
      const appropriatenessScore = Math.max(0, 1 - Math.abs(agePosition - 0.5) * 2);

      return {
        ...product,
        ageAppropriatenessScore: Math.round(appropriatenessScore * 100) / 100
      };
    });

    // Response with detailed filtering info
    res.json({
      success: true,
      data: {
        products: productsWithScore,
        productsByCategory,
        pagination: {
          total: totalProducts,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalProducts
        },
        filterInfo: {
          userAge: userAge,
          category: category || 'All Categories',
          resultsCount: result.rows.length,
          ageAppropriateProductsAvailable: totalProducts
        },
        ageGuidance: getAgeGuidance(userAge)
      }
    });

  } catch (error) {
    console.error('Error filtering products by age:', error);
    res.status(500).json({
      error: 'Internal server error while filtering products',
      success: false
    });
  }
});

/**
 * GET /api/products/age-categories
 * Get available age categories and their product counts
 */
router.get('/age-categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        "ageCategory",
        COUNT(*) as product_count,
        MIN("minAge") as min_age,
        MAX("maxAge") as max_age,
        ROUND(AVG(price), 2) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM "products"
      WHERE "isActive" = true AND "inStock" = true
      GROUP BY "ageCategory"
      ORDER BY 
        CASE "ageCategory" 
          WHEN 'Toddler' THEN 1
          WHEN 'Child' THEN 2  
          WHEN 'Teen' THEN 3
          WHEN 'Adult' THEN 4
          WHEN 'Senior' THEN 5
          WHEN 'All Ages' THEN 6
        END
    `);

    res.json({
      success: true,
      data: result.rows.map(category => ({
        ageCategory: category.ageCategory,
        productCount: parseInt(category.product_count),
        ageRange: {
          min: category.min_age,
          max: category.max_age
        },
        priceRange: {
          min: parseFloat(category.min_price),
          max: parseFloat(category.max_price),
          average: parseFloat(category.avg_price)
        }
      }))
    });

  } catch (error) {
    console.error('Error getting age categories:', error);
    res.status(500).json({
      error: 'Internal server error while getting age categories',
      success: false
    });
  }
});

/**
 * GET /api/products/age-verification-required
 * Get products that require age verification for a specific age
 */
router.get('/age-verification-required', async (req, res) => {
  try {
    const { age } = req.query;

    if (!age || isNaN(age)) {
      return res.status(400).json({
        error: 'Age parameter is required and must be a number',
        success: false
      });
    }

    const userAge = parseInt(age);

    const result = await pool.query(`
      SELECT 
        name,
        brand,
        category,
        "minAge",
        "requiresAgeVerification",
        price
      FROM "products"
      WHERE "requiresAgeVerification" = true
        AND "minAge" <= $1
        AND "maxAge" >= $1
        AND "isActive" = true
      ORDER BY "minAge", category
    `, [userAge]);

    res.json({
      success: true,
      data: {
        userAge,
        restrictedProducts: result.rows,
        count: result.rows.length,
        message: result.rows.length > 0 
          ? `${result.rows.length} products require age verification for age ${userAge}`
          : `No products require age verification for age ${userAge}`
      }
    });

  } catch (error) {
    console.error('Error getting age verification products:', error);
    res.status(500).json({
      error: 'Internal server error',
      success: false
    });
  }
});

// Helper function to provide age-appropriate guidance
function getAgeGuidance(age) {
  if (age < 3) {
    return {
      category: 'Toddler',
      guidance: 'Products selected for safety and developmental appropriateness for toddlers',
      recommendations: ['Baby care items', 'Educational toys', 'Nutritional products']
    };
  } else if (age < 13) {
    return {
      category: 'Child',
      guidance: 'Products focused on learning, creativity, and healthy development',
      recommendations: ['Educational materials', 'Art supplies', 'Healthy snacks', 'Age-appropriate toys']
    };
  } else if (age < 20) {
    return {
      category: 'Teen',
      guidance: 'Products for personal care, entertainment, and emerging independence',
      recommendations: ['Personal care items', 'Entertainment products', 'Fashion items', 'Technology']
    };
  } else if (age < 60) {
    return {
      category: 'Adult',
      guidance: 'Full range of products including premium items and services',
      recommendations: ['Electronics', 'Vehicles', 'Professional services', 'Premium brands']
    };
  } else {
    return {
      category: 'Senior',
      guidance: 'Products focused on health, comfort, and accessibility',
      recommendations: ['Health supplements', 'Large-print items', 'Comfort products', 'Medication']
    };
  }
}

module.exports = router;