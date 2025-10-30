# 🛒 CART API COMPLETE REFERENCE

## 🎯 **CART TESTING RESULTS - SUCCESS!**

The cart functionality has been thoroughly tested and is working perfectly:

✅ **Add to Cart**: Working with age validation  
✅ **Get Cart**: Returns items and totals correctly  
✅ **Update Quantity**: Successfully updates cart items  
✅ **Remove Items**: Properly removes from cart  
✅ **Age Validation**: Blocks age-inappropriate products  
✅ **Price Tracking**: Stores price at time of adding  

---

## 🌐 **CART API ENDPOINTS**

### 1. **ADD TO CART**
```
POST /api/cart/add
```
**Headers:** `Authorization: Bearer JWT_TOKEN`

**Request Body:**
```json
{
  "productId": 216,
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product added to cart successfully",
  "data": {
    "id": 1,
    "userId": 13,
    "productId": 216,
    "quantity": 2,
    "priceAtTime": "89.99",
    "status": "active",
    "addedAt": "2025-10-30T03:46:04.000Z",
    "product": {
      "name": "Soccer Ball Official Size 5",
      "image": "https://images.unsplash.com/photo-1614632537190...",
      "brand": "Adidas"
    }
  }
}
```

### 2. **GET CART**
```
GET /api/cart
```
**Headers:** `Authorization: Bearer JWT_TOKEN`

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "userId": 13,
        "productId": 216,
        "quantity": 5,
        "priceAtTime": "89.99",
        "status": "active",
        "addedAt": "2025-10-30T03:46:04.000Z",
        "product": {
          "id": 216,
          "name": "Soccer Ball Official Size 5",
          "brand": "Adidas",
          "image": "https://images.unsplash.com/photo-1614632537190...",
          "price": "89.99",
          "inStock": true,
          "isActive": true
        }
      }
    ],
    "summary": {
      "totalItems": 5,
      "totalAmount": 449.95,
      "itemCount": 1
    }
  }
}
```

### 3. **UPDATE CART ITEM**
```
PUT /api/cart/:id
```
**Headers:** `Authorization: Bearer JWT_TOKEN`

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "id": 1,
    "quantity": 5,
    "updatedAt": "2025-10-30T03:46:04.000Z"
  }
}
```

### 4. **REMOVE CART ITEM**
```
DELETE /api/cart/:id
```
**Headers:** `Authorization: Bearer JWT_TOKEN`

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

### 5. **CLEAR ENTIRE CART**
```
DELETE /api/cart
```
**Headers:** `Authorization: Bearer JWT_TOKEN`

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## 🏪 **REDUX IMPLEMENTATION**

### **Cart Actions**
```javascript
// Add to cart
export const addToCart = (productId, quantity = 1) => async (dispatch) => {
  dispatch({ type: 'CART_LOADING', payload: true });
  
  try {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ productId, quantity })
    });
    
    const data = await response.json();
    
    if (data.success) {
      dispatch({ type: 'CART_ADD_SUCCESS', payload: data.data });
      dispatch(getCart()); // Refresh cart
      
      // Show success message
      dispatch(showNotification('Product added to cart!', 'success'));
    } else {
      dispatch({ type: 'CART_ERROR', payload: data.message });
      dispatch(showNotification(data.message, 'error'));
    }
  } catch (error) {
    dispatch({ type: 'CART_ERROR', payload: error.message });
  }
  
  dispatch({ type: 'CART_LOADING', payload: false });
};

// Get cart contents
export const getCart = () => async (dispatch) => {
  try {
    const response = await fetch('/api/cart', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      dispatch({ type: 'CART_LOAD_SUCCESS', payload: data.data });
    }
  } catch (error) {
    dispatch({ type: 'CART_ERROR', payload: error.message });
  }
};

// Update cart item
export const updateCartItem = (cartItemId, quantity) => async (dispatch) => {
  try {
    const response = await fetch(`/api/cart/${cartItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ quantity })
    });
    
    const data = await response.json();
    
    if (data.success) {
      dispatch(getCart()); // Refresh cart
      dispatch(showNotification('Cart updated!', 'success'));
    } else {
      dispatch(showNotification(data.message, 'error'));
    }
  } catch (error) {
    dispatch(showNotification(error.message, 'error'));
  }
};

// Remove from cart
export const removeFromCart = (cartItemId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/cart/${cartItemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      dispatch(getCart()); // Refresh cart
      dispatch(showNotification('Item removed from cart!', 'success'));
    }
  } catch (error) {
    dispatch(showNotification(error.message, 'error'));
  }
};
```

### **Cart Reducer**
```javascript
const initialState = {
  items: [],
  summary: {
    totalItems: 0,
    totalAmount: 0,
    itemCount: 0
  },
  loading: false,
  error: null
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CART_LOADING':
      return { ...state, loading: action.payload };
      
    case 'CART_LOAD_SUCCESS':
      return {
        ...state,
        items: action.payload.items,
        summary: action.payload.summary,
        error: null
      };
      
    case 'CART_ADD_SUCCESS':
      return { ...state, error: null };
      
    case 'CART_ERROR':
      return { ...state, error: action.payload };
      
    default:
      return state;
  }
};
```

### **Cart Selectors**
```javascript
export const selectCartItems = (state) => state.cart.items;
export const selectCartSummary = (state) => state.cart.summary;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartItemCount = (state) => state.cart.summary.itemCount;
export const selectCartTotal = (state) => state.cart.summary.totalAmount;
```

---

## ⚛️ **REACT COMPONENTS**

### **Add to Cart Button**
```jsx
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartActions';
import { selectCartLoading } from '../store/cartSelectors';

const AddToCartButton = ({ product }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectCartLoading);
  
  const handleAddToCart = () => {
    dispatch(addToCart(product.id, 1));
  };
  
  return (
    <button 
      onClick={handleAddToCart}
      disabled={loading || !product.inStock}
      className="btn btn-primary"
    >
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
};
```

### **Cart Component**
```jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCart, updateCartItem, removeFromCart } from '../store/cartActions';
import { selectCartItems, selectCartSummary } from '../store/cartSelectors';

const Cart = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const summary = useSelector(selectCartSummary);
  
  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);
  
  return (
    <div className="cart">
      <h2>Shopping Cart ({summary.itemCount})</h2>
      
      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.product.image} alt={item.product.name} />
              <div className="item-details">
                <h3>{item.product.name}</h3>
                <p>Brand: {item.product.brand}</p>
                <p>Price: R{item.priceAtTime}</p>
                
                <div className="quantity-controls">
                  <button onClick={() => dispatch(updateCartItem(item.id, item.quantity - 1))}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => dispatch(updateCartItem(item.id, item.quantity + 1))}>
                    +
                  </button>
                </div>
                
                <button onClick={() => dispatch(removeFromCart(item.id))}>
                  Remove
                </button>
              </div>
              
              <div className="item-total">
                R{(parseFloat(item.priceAtTime) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
          
          <div className="cart-summary">
            <h3>Total: R{summary.totalAmount.toFixed(2)}</h3>
            <button className="btn btn-primary">Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
};
```

---

## 🚨 **IMPORTANT FEATURES**

### **Age Validation**
The cart system automatically validates product age restrictions:
- Products with `minAge`/`maxAge` are checked against user's age (from SA ID)
- Age-inappropriate products are blocked with clear error messages
- Example: LEGO (4-12 years) blocked for adult users

### **Price Protection**
- Cart stores `priceAtTime` when item is added
- Protects users from price changes after adding to cart
- Ensures checkout accuracy

### **Stock Validation**
- Only in-stock products can be added
- Inactive products are filtered out
- Real-time stock checking

### **Authentication Required**
- All cart operations require JWT authentication
- Only dependents (not funders) can manage cart
- User isolation ensures cart privacy

---

## 🎉 **TESTING RESULTS SUMMARY**

✅ **Successful Tests:**
1. Add product to cart (with age validation)
2. Update existing cart item (quantity increase)  
3. Add different product to same cart
4. Get cart with totals and summary
5. Update cart item quantity
6. Remove cart item
7. Age restriction blocking (LEGO blocked for adult user)
8. Price tracking and calculation

Your cart system is **production-ready** and working perfectly! 🛒✨