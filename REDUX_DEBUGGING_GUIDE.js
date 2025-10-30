/**
 * 🔍 REDUX STORE DEBUGGING HELPER
 * ===============================
 * Copy this into your frontend to debug Redux store issues
 */

// 1. REDUX ACTION CREATORS (with debugging)
export const fetchProducts = (filters = {}) => async (dispatch, getState) => {
  console.log('🚀 FETCHING PRODUCTS - Start');
  console.log('📋 Filters:', filters);
  
  dispatch(setProductsLoading(true));
  dispatch(setProductsError(null));
  
  try {
    const queryString = new URLSearchParams(filters).toString();
    const url = `/api/products${queryString ? '?' + queryString : ''}`;
    
    console.log('🌐 API URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📡 API Response Status:', response.status);
    console.log('📋 API Response Data:', data);
    
    if (data.success && response.ok) {
      console.log(`✅ Products fetched: ${data.data.length} items`);
      console.log('📊 Pagination:', data.pagination);
      
      // Dispatch successful data
      dispatch(setProducts(data.data));
      dispatch(setProductsPagination(data.pagination));
      
      // Verify Redux state after dispatch
      const currentState = getState();
      console.log('🏪 Redux State After Dispatch:', currentState.products);
      
    } else {
      console.error('❌ API Error:', data.message || 'Unknown error');
      dispatch(setProductsError(data.message || 'Failed to fetch products'));
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error);
    dispatch(setProductsError(error.message));
  }
  
  dispatch(setProductsLoading(false));
  console.log('🏁 FETCHING PRODUCTS - Complete');
};

// 2. REDUX REDUCERS (with debugging)
const initialState = {
  items: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  },
  filters: {
    category: null,
    brand: null,
    search: null
  }
};

const productsReducer = (state = initialState, action) => {
  console.log('🔄 REDUX ACTION:', action.type);
  
  switch (action.type) {
    case 'PRODUCTS_LOADING':
      console.log('⏳ Setting loading to:', action.payload);
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error
      };
      
    case 'PRODUCTS_SUCCESS':
      console.log('✅ Products received:', action.payload.length, 'items');
      console.log('📋 First product:', action.payload[0]);
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null
      };
      
    case 'PRODUCTS_ERROR':
      console.error('❌ Products error:', action.payload);
      return {
        ...state,
        items: [],
        loading: false,
        error: action.payload
      };
      
    case 'PRODUCTS_PAGINATION':
      console.log('📊 Pagination updated:', action.payload);
      return {
        ...state,
        pagination: action.payload
      };
      
    default:
      return state;
  }
};

// 3. REDUX SELECTORS (with debugging)
export const selectAllProducts = (state) => {
  const products = state.products.items;
  console.log('🎯 selectAllProducts called - returning:', products.length, 'products');
  return products;
};

export const selectProductsLoading = (state) => {
  const loading = state.products.loading;
  console.log('⏳ selectProductsLoading called - returning:', loading);
  return loading;
};

export const selectProductsError = (state) => {
  const error = state.products.error;
  console.log('❌ selectProductsError called - returning:', error);
  return error;
};

export const selectProductsPagination = (state) => {
  const pagination = state.products.pagination;
  console.log('📊 selectProductsPagination called - returning:', pagination);
  return pagination;
};

export const selectProductsByCategory = (state, category) => {
  const allProducts = state.products.items;
  const filtered = allProducts.filter(product => product.category === category);
  console.log(`🏷️ selectProductsByCategory(${category}) - returning:`, filtered.length, 'products');
  return filtered;
};

// 4. REACT COMPONENT DEBUGGING EXAMPLE
export const ProductsDebugComponent = () => {
  const dispatch = useDispatch();
  
  // Selectors with debugging
  const products = useSelector(selectAllProducts);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const pagination = useSelector(selectProductsPagination);
  
  useEffect(() => {
    console.log('🎬 ProductsComponent mounted - fetching products');
    dispatch(fetchProducts());
  }, [dispatch]);
  
  useEffect(() => {
    console.log('🔄 Products state changed:');
    console.log('   📦 Products:', products.length, 'items');
    console.log('   ⏳ Loading:', loading);
    console.log('   ❌ Error:', error);
    console.log('   📊 Pagination:', pagination);
  }, [products, loading, error, pagination]);
  
  // Debug button to manually test API
  const debugAPI = async () => {
    console.log('🧪 MANUAL API TEST');
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      console.log('📡 Direct API Response:', data);
      console.log('📊 Should have', data.pagination?.total || 0, 'total products');
    } catch (err) {
      console.error('❌ Direct API Error:', err);
    }
  };
  
  if (loading) {
    console.log('⏳ Rendering loading state');
    return <div>Loading products...</div>;
  }
  
  if (error) {
    console.error('❌ Rendering error state:', error);
    return <div>Error: {error}</div>;
  }
  
  console.log('✅ Rendering products:', products.length, 'items');
  
  return (
    <div>
      <h2>Products ({products.length})</h2>
      <button onClick={debugAPI}>🧪 Debug API</button>
      <button onClick={() => dispatch(fetchProducts())}>🔄 Refetch</button>
      
      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <ul>
          {products.map(product => (
            <li key={product.id}>
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>Category: {product.category}</p>
              <p>Price: R{product.price}</p>
              <p>In Stock: {product.inStock ? 'Yes' : 'No'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// 5. DEBUGGING CHECKLIST FOR YOUR FRONTEND
console.log(`
🔍 REDUX DEBUGGING CHECKLIST:
============================

1. ✅ API Endpoint: GET /api/products
2. ✅ Expected Response: { success: true, data: [...], pagination: {...} }
3. ✅ Product Count: Should be 32 total products
4. ✅ Redux Structure: state.products.items should be array
5. ✅ Image URLs: All should be Unsplash URLs (working)

🚨 COMMON ISSUES TO CHECK:
=========================

❓ Is fetch URL correct?
   - Should be: /api/products
   - Not: /products or /api/product

❓ Is Redux action dispatching correctly?
   - Check: dispatch(setProducts(response.data))
   - NOT: dispatch(setProducts(response))

❓ Is selector returning correct data?
   - Should return: state.products.items
   - Not: state.products

❓ Is component re-rendering on state change?
   - Use useSelector hooks correctly
   - Check dependency arrays in useEffect

❓ Are images loading?
   - All URLs should start with: https://images.unsplash.com
   - If broken, check network tab for 404s

🔧 DEBUGGING STEPS:
==================

1. Open browser console
2. Check Network tab when loading products
3. Verify API response structure matches expected
4. Check Redux DevTools for action dispatches
5. Verify selectors return expected data
6. Test with the debug buttons above
`);

export default productsReducer;