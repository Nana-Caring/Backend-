# 🎯 DEPENDENT FRONTEND AGE-BASED CATEGORY INTEGRATION GUIDE

## 📋 Overview
This guide shows how to integrate age-based category filtering into your dependent frontend application.

## 🔗 Backend API Endpoints

### 1. Get Age-Appropriate Products for Dependent
```javascript
GET /admin/dependents/{dependentId}/products
```

**Headers:**
```javascript
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response Structure:**
```javascript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "brand": "Brand Name",
      "category": "Healthcare",
      "ageCategory": "All Ages",
      "price": 29.99,
      "image": "product-image-url",
      "minAge": 18,
      "maxAge": 150,
      "requiresAgeVerification": true
    }
  ],
  "dependent": {
    "id": 14,
    "name": "Amara Johnson",
    "age": 8,
    "ageCategory": "Child"
  },
  "pagination": {
    "total": 13,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### 2. Validate Product Access for Dependent
```javascript
GET /admin/dependents/{dependentId}/products/{productId}/validate
```

## 🎨 Frontend Implementation

### 1. React/Vue Component Structure

```javascript
// DependentProductCatalog.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DependentProductCatalog = ({ dependentId }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [dependent, setDependent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch age-appropriate products
  useEffect(() => {
    fetchDependentProducts();
  }, [dependentId, selectedCategory]);

  const fetchDependentProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await axios.get(
        `/admin/dependents/${dependentId}/products`,
        { params }
      );

      if (response.data.success) {
        setProducts(response.data.data);
        setDependent(response.data.dependent);
        
        // Group products by category
        const categorizedProducts = groupProductsByCategory(response.data.data);
        setCategories(categorizedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      handleAgeRestrictionError(error);
    } finally {
      setLoading(false);
    }
  };

  const groupProductsByCategory = (products) => {
    return products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});
  };

  const handleAgeRestrictionError = (error) => {
    if (error.response?.status === 400 && error.response?.data?.errorCode === 'INVALID_IDNUMBER') {
      // Handle invalid ID number
      showNotification('Invalid ID number - cannot determine age', 'error');
    }
  };

  return (
    <div className="dependent-product-catalog">
      {/* Age Information Header */}
      {dependent && (
        <div className="age-info-header">
          <h2>Products for {dependent.name}</h2>
          <div className="age-badge">
            <span className="age">Age: {dependent.age} years</span>
            <span className="category">({dependent.ageCategory})</span>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <CategoryFilter 
        categories={Object.keys(categories)}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Products Grid */}
      <div className="products-grid">
        {Object.entries(categories).map(([category, categoryProducts]) => (
          <CategorySection 
            key={category}
            category={category}
            products={categoryProducts}
            dependentAge={dependent?.age}
            onProductSelect={handleProductSelect}
          />
        ))}
      </div>
    </div>
  );
};
```

### 2. Category Filter Component

```javascript
// CategoryFilter.jsx
const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const categoryIcons = {
    'Healthcare': '🏥',
    'Other': '🛍️',
    'Pregnancy': '🤱',
    'Education': '📚',
    'Groceries': '🛒',
    'Entertainment': '🎮',
    'Clothing': '👕',
    'Baby Care': '👶'
  };

  return (
    <div className="category-filter">
      <button 
        className={selectedCategory === 'all' ? 'active' : ''}
        onClick={() => onCategoryChange('all')}
      >
        All Categories
      </button>
      {categories.map(category => (
        <button 
          key={category}
          className={selectedCategory === category ? 'active' : ''}
          onClick={() => onCategoryChange(category)}
        >
          {categoryIcons[category] || '📦'} {category}
        </button>
      ))}
    </div>
  );
};
```

### 3. Category Section Component

```javascript
// CategorySection.jsx
const CategorySection = ({ category, products, dependentAge, onProductSelect }) => {
  const getAgeAppropriatenessInfo = (product) => {
    if (product.minAge && dependentAge < product.minAge) {
      return {
        appropriate: false,
        message: `Requires age ${product.minAge}+`,
        className: 'age-restricted'
      };
    }
    if (product.maxAge && dependentAge > product.maxAge) {
      return {
        appropriate: false,
        message: `Max age ${product.maxAge}`,
        className: 'age-restricted'
      };
    }
    return {
      appropriate: true,
      message: 'Age appropriate',
      className: 'age-appropriate'
    };
  };

  return (
    <div className="category-section">
      <h3 className="category-title">{category}</h3>
      <div className="products-list">
        {products.map(product => {
          const ageInfo = getAgeAppropriatenessInfo(product);
          
          return (
            <div 
              key={product.id}
              className={`product-card ${ageInfo.className}`}
              onClick={() => onProductSelect(product)}
            >
              <img src={product.image} alt={product.name} />
              <div className="product-info">
                <h4>{product.name}</h4>
                <p className="brand">{product.brand}</p>
                <p className="price">R{product.price}</p>
                
                {/* Age verification badge */}
                {product.requiresAgeVerification && (
                  <div className="verification-badge">
                    🔒 ID Required
                  </div>
                )}
                
                {/* Age appropriateness indicator */}
                <div className={`age-indicator ${ageInfo.className}`}>
                  {ageInfo.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

### 4. Product Validation Hook

```javascript
// useProductValidation.js
import { useState, useCallback } from 'react';
import axios from 'axios';

export const useProductValidation = () => {
  const [validationResults, setValidationResults] = useState({});

  const validateProductAccess = useCallback(async (dependentId, productId) => {
    try {
      const response = await axios.get(
        `/admin/dependents/${dependentId}/products/${productId}/validate`
      );
      
      const result = response.data;
      setValidationResults(prev => ({
        ...prev,
        [`${dependentId}-${productId}`]: result
      }));
      
      return result;
    } catch (error) {
      console.error('Product validation error:', error);
      return { 
        accessible: false, 
        reason: 'Validation failed' 
      };
    }
  }, []);

  const getValidationResult = useCallback((dependentId, productId) => {
    return validationResults[`${dependentId}-${productId}`];
  }, [validationResults]);

  return { validateProductAccess, getValidationResult };
};
```

### 5. CSS Styling

```css
/* DependentProductCatalog.css */
.dependent-product-catalog {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.age-info-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.age-badge {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.age-badge .age {
  font-size: 1.2em;
  font-weight: bold;
}

.age-badge .category {
  font-size: 0.9em;
  opacity: 0.8;
}

.category-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.category-filter button {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-filter button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.category-section {
  margin-bottom: 40px;
}

.category-title {
  font-size: 1.5em;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.product-card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.product-card.age-restricted {
  opacity: 0.6;
  border-color: #ff6b6b;
  background: #fff5f5;
}

.product-card.age-appropriate {
  border-color: #51cf66;
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.verification-badge {
  background: #ff6b6b;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  display: inline-block;
  margin-top: 5px;
}

.age-indicator {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  margin-top: 8px;
  text-align: center;
}

.age-indicator.age-appropriate {
  background: #d3f9d8;
  color: #2b8a3e;
}

.age-indicator.age-restricted {
  background: #ffe0e0;
  color: #c92a2a;
}

/* Responsive Design */
@media (max-width: 768px) {
  .age-info-header {
    flex-direction: column;
    text-align: center;
  }
  
  .products-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
```

### 6. Redux State Management (Optional)

```javascript
// dependentProductsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchDependentProducts = createAsyncThunk(
  'dependentProducts/fetch',
  async ({ dependentId, category }, { rejectWithValue }) => {
    try {
      const params = category ? { category } : {};
      const response = await axios.get(
        `/admin/dependents/${dependentId}/products`,
        { params }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const dependentProductsSlice = createSlice({
  name: 'dependentProducts',
  initialState: {
    products: [],
    categories: {},
    dependent: null,
    loading: false,
    error: null
  },
  reducers: {
    clearProducts: (state) => {
      state.products = [];
      state.categories = {};
      state.dependent = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDependentProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDependentProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.dependent = action.payload.dependent;
        
        // Group by categories
        state.categories = action.payload.data.reduce((acc, product) => {
          if (!acc[product.category]) {
            acc[product.category] = [];
          }
          acc[product.category].push(product);
          return acc;
        }, {});
      })
      .addCase(fetchDependentProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch products';
      });
  }
});

export default dependentProductsSlice.reducer;
```

## 🔧 Integration Steps

### 1. Install Dependencies
```bash
npm install axios react-query # or @tanstack/react-query for v4+
```

### 2. Set up API Base URL
```javascript
// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

### 3. Error Handling
```javascript
// errorHandling.js
export const handleProductError = (error) => {
  if (error.response?.data?.errorCode === 'INVALID_IDNUMBER') {
    return {
      title: 'Invalid ID Number',
      message: 'Cannot determine age from ID number. Please update profile.',
      type: 'warning'
    };
  }
  
  if (error.response?.status === 404) {
    return {
      title: 'Dependent Not Found',
      message: 'The selected dependent was not found or access denied.',
      type: 'error'
    };
  }
  
  return {
    title: 'Error',
    message: 'Failed to load products. Please try again.',
    type: 'error'
  };
};
```

## 🚀 Usage Examples

### Basic Implementation
```javascript
// App.jsx
import DependentProductCatalog from './components/DependentProductCatalog';

function App() {
  const dependentId = 14; // Amara Johnson (8 years old)
  
  return (
    <div className="App">
      <DependentProductCatalog dependentId={dependentId} />
    </div>
  );
}
```

### With Router Integration
```javascript
// DependentProductsPage.jsx
import { useParams } from 'react-router-dom';
import DependentProductCatalog from '../components/DependentProductCatalog';

const DependentProductsPage = () => {
  const { dependentId } = useParams();
  
  return (
    <div className="page-container">
      <DependentProductCatalog dependentId={dependentId} />
    </div>
  );
};
```

## 🎯 Key Features

### ✅ What This Integration Provides:
- **Age-appropriate product filtering**
- **Category-based organization**
- **Visual age restriction indicators**
- **ID verification badges**
- **Responsive design**
- **Error handling for invalid ages**
- **Real-time product validation**

### 🔄 Dynamic Behavior:
- Products automatically filtered by dependent's age
- Categories only shown if they contain available products
- Age verification warnings for restricted items
- Graceful handling of age calculation errors

## 📱 Mobile Considerations

```javascript
// MobileDependentProducts.jsx
const MobileDependentProducts = ({ dependentId }) => {
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <div className="mobile-product-catalog">
      <button 
        className="filter-toggle"
        onClick={() => setShowFilters(!showFilters)}
      >
        🔍 Filters
      </button>
      
      {showFilters && (
        <div className="mobile-filters">
          <CategoryFilter {...filterProps} />
        </div>
      )}
      
      <div className="mobile-products">
        {/* Product grid optimized for mobile */}
      </div>
    </div>
  );
};
```

This integration guide provides a complete solution for implementing age-based category filtering in your dependent frontend!