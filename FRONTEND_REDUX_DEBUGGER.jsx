/**
 * 🔍 FRONTEND REDUX DEBUGGING HELPER
 * ==================================
 * Add this to your React app to debug why products aren't showing
 */

// 1. ADD THIS TO YOUR PRODUCTS COMPONENT TO DEBUG
const ProductsDebugger = () => {
  const dispatch = useDispatch();
  
  // Test direct API call
  const testDirectAPI = async () => {
    console.log('🧪 TESTING DIRECT API CALL');
    console.log('==========================');
    
    try {
      const response = await fetch('/api/products');
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📋 API Response:', data);
      console.log('📊 Products count:', data.data?.length || 0);
      console.log('✅ Success flag:', data.success);
      
      if (data.success && data.data) {
        console.log('🔍 First product sample:');
        console.log(data.data[0]);
      }
      
    } catch (error) {
      console.error('❌ Direct API Error:', error);
    }
  };
  
  // Test Redux dispatch
  const testReduxDispatch = () => {
    console.log('🏪 TESTING REDUX DISPATCH');
    console.log('==========================');
    
    // Assuming you have a fetchProducts action
    dispatch(fetchProducts());
  };
  
  // Monitor Redux state changes
  const products = useSelector(state => {
    console.log('🔍 SELECTOR DEBUG - Full Redux State:');
    console.log(state);
    console.log('🔍 Products slice:');
    console.log(state.products);
    
    return state.products?.items || state.products?.data || state.products || [];
  });
  
  const loading = useSelector(state => {
    const loadingState = state.products?.loading || state.products?.isLoading || false;
    console.log('⏳ Loading state:', loadingState);
    return loadingState;
  });
  
  const error = useSelector(state => {
    const errorState = state.products?.error || null;
    console.log('❌ Error state:', errorState);
    return errorState;
  });
  
  useEffect(() => {
    console.log('🎬 ProductsDebugger mounted');
    console.log('📊 Initial products length:', products.length);
    console.log('⏳ Initial loading:', loading);
    console.log('❌ Initial error:', error);
  }, []);
  
  useEffect(() => {
    console.log('🔄 Products state changed:', {
      length: products.length,
      loading,
      error,
      products: products.slice(0, 2) // Show first 2 products
    });
  }, [products, loading, error]);
  
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px 0' }}>
      <h3>🔍 Redux Debugging Panel</h3>
      <div>
        <p><strong>Products Length:</strong> {products.length}</p>
        <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
        <p><strong>Error:</strong> {error || 'null'}</p>
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <button onClick={testDirectAPI} style={{ marginRight: '10px' }}>
          🧪 Test Direct API
        </button>
        <button onClick={testReduxDispatch}>
          🏪 Test Redux Dispatch
        </button>
      </div>
      
      {products.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <h4>✅ Sample Product Data:</h4>
          <pre style={{ background: 'white', padding: '10px', fontSize: '12px' }}>
            {JSON.stringify(products[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// 2. COMMON REDUX ISSUES AND FIXES

// Issue 1: Wrong state path in selector
// ❌ WRONG:
const wrongProducts = useSelector(state => state.products);

// ✅ CORRECT (choose based on your actual state structure):
const correctProducts1 = useSelector(state => state.products.items);
const correctProducts2 = useSelector(state => state.products.data);
const correctProducts3 = useSelector(state => state.products); // if products is directly an array

// Issue 2: Not dispatching the action on component mount
// ✅ ADD THIS to your Products component:
useEffect(() => {
  console.log('🚀 Dispatching fetchProducts on mount');
  dispatch(fetchProducts());
}, [dispatch]);

// Issue 3: Incorrect action creator
// ✅ MAKE SURE your fetchProducts action looks like this:
export const fetchProducts = (filters = {}) => async (dispatch, getState) => {
  console.log('🚀 fetchProducts action started');
  
  dispatch({ type: 'PRODUCTS_LOADING', payload: true });
  
  try {
    const queryString = new URLSearchParams(filters).toString();
    const url = `/api/products${queryString ? '?' + queryString : ''}`;
    
    console.log('🌐 Fetching from URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📡 API Response:', data);
    console.log('📊 Products received:', data.data?.length || 0);
    
    if (data.success && data.data) {
      console.log('✅ Dispatching PRODUCTS_SUCCESS with', data.data.length, 'products');
      dispatch({ 
        type: 'PRODUCTS_SUCCESS', 
        payload: data.data // Make sure this matches your reducer expectation
      });
      
      if (data.pagination) {
        dispatch({ 
          type: 'PRODUCTS_PAGINATION', 
          payload: data.pagination 
        });
      }
    } else {
      console.error('❌ API returned unsuccessful response:', data);
      dispatch({ 
        type: 'PRODUCTS_ERROR', 
        payload: data.message || 'Failed to fetch products' 
      });
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    dispatch({ 
      type: 'PRODUCTS_ERROR', 
      payload: error.message 
    });
  }
  
  dispatch({ type: 'PRODUCTS_LOADING', payload: false });
  
  // Debug final state
  const finalState = getState();
  console.log('🏪 Final products state:', finalState.products);
};

// Issue 4: Incorrect reducer
// ✅ MAKE SURE your reducer handles the actions correctly:
const productsReducer = (state = initialState, action) => {
  console.log('🔄 Reducer received action:', action.type);
  
  switch (action.type) {
    case 'PRODUCTS_LOADING':
      console.log('⏳ Setting loading to:', action.payload);
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error
      };
      
    case 'PRODUCTS_SUCCESS':
      console.log('✅ Products success - received:', action.payload?.length || 0, 'products');
      console.log('🔍 Sample product:', action.payload?.[0]);
      return {
        ...state,
        items: action.payload, // or data: action.payload - match your selector
        loading: false,
        error: null
      };
      
    case 'PRODUCTS_ERROR':
      console.error('❌ Products error:', action.payload);
      return {
        ...state,
        items: [], // or data: []
        loading: false,
        error: action.payload
      };
      
    default:
      return state;
  }
};

// Issue 5: Store not configured properly
// ✅ MAKE SURE your store includes the products reducer:
const store = configureStore({
  reducer: {
    products: productsReducer, // Make sure this key matches your selectors
    // ... other reducers
  }
});

// 3. DEBUGGING CHECKLIST
console.log(`
🔍 DEBUGGING CHECKLIST:
======================

1. ✅ Check Network Tab:
   - Is /api/products being called?
   - Does it return 200 status?
   - Does response have success: true and data array?

2. ✅ Check Redux DevTools:
   - Is PRODUCTS_SUCCESS action being dispatched?
   - Does the action payload contain the products array?
   - Is the reducer updating state correctly?

3. ✅ Check Selector:
   - Does selector match actual state structure?
   - Is it returning the right part of state?

4. ✅ Check Component:
   - Is useEffect calling fetchProducts on mount?
   - Are selectors using the right state paths?

5. ✅ Common State Structures:
   state.products.items ← Most common
   state.products.data
   state.products (if products is directly array)
`);

export default ProductsDebugger;

// 4. ADD THIS COMPONENT TO YOUR PRODUCTS.JSX FILE TEMPORARILY
// <ProductsDebugger />
// This will help identify exactly where the issue is occurring.