# Frontend Stripe Deposit Integration Guide

## Complete Step-by-Step Implementation

### 1. Install Stripe Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Environment Variables

Create `.env` file in your frontend project:

```env
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
REACT_APP_API_BASE_URL=https://nanacaring-backend.onrender.com/api
```

### 3. Stripe Provider Setup

**App.js or index.js:**

```jsx
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import FunderDeposit from './components/FunderDeposit';

// Load Stripe with your public key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <div className="App">
        <FunderDeposit />
      </div>
    </Elements>
  );
}

export default App;
```

### 4. Complete Deposit Component

**components/FunderDeposit.jsx:**

```jsx
import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const FunderDeposit = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [accountBalance, setAccountBalance] = useState(null);
  
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  
  // Get JWT token from localStorage or wherever you store it
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  // Fetch current account balance
  const fetchBalance = async () => {
    try {
      const response = await axios.get(`${API_BASE}/funder/deposit/account`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
        setAccountBalance(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setMessage('Failed to load account balance');
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements || !amount) {
      setMessage('Please fill in all fields');
      return;
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    if (amountInCents < 1000) { // Minimum R10.00
      setMessage('Minimum deposit amount is R10.00');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Step 1: Create payment intent
      console.log('Creating payment intent for amount:', amountInCents);
      
      const intentResponse = await axios.post(
        `${API_BASE}/funder/deposit/create-intent`,
        { 
          amount: amountInCents,
          currency: 'zar'
        },
        { headers: getAuthHeaders() }
      );

      if (!intentResponse.data.success) {
        throw new Error(intentResponse.data.message || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = intentResponse.data.data;
      console.log('Payment intent created:', paymentIntentId);

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Funder Name', // You can get this from user profile
          },
        }
      });

      if (error) {
        console.error('Stripe payment failed:', error);
        setMessage(`Payment failed: ${error.message}`);
        setIsLoading(false);
        return;
      }

      console.log('Stripe payment succeeded:', paymentIntent.id);

      // Step 3: Confirm deposit on backend
      const confirmResponse = await axios.post(
        `${API_BASE}/funder/deposit/confirm`,
        { paymentIntentId: paymentIntent.id },
        { headers: getAuthHeaders() }
      );

      if (confirmResponse.data.success) {
        const { amount: depositAmount, newBalance } = confirmResponse.data.data;
        
        setMessage(`✅ Deposit successful! R${depositAmount.toFixed(2)} added to your account.`);
        
        // Update balance display
        await fetchBalance();
        
        // Clear form
        setAmount('');
        
        // Clear card element
        cardElement.clear();
        
      } else {
        throw new Error(confirmResponse.data.message || 'Failed to confirm deposit');
      }

    } catch (error) {
      console.error('Deposit error:', error);
      setMessage(`❌ Deposit failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="funder-deposit-container" style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>💰 Deposit Funds</h2>
      
      {/* Current Balance Display */}
      {accountBalance && (
        <div style={{ 
          backgroundColor: '#f0f8ff', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #e0e6ed'
        }}>
          <h3>Current Balance</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c5aa0' }}>
            {accountBalance.balance}
          </p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Account: {accountBalance.accountName} ({accountBalance.accountNumber})
          </p>
        </div>
      )}

      {/* Deposit Form */}
      <form onSubmit={handleDeposit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Deposit Amount (ZAR)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (minimum R10.00)"
            min="10"
            step="0.01"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Card Details
          </label>
          <div style={{
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#fff'
          }}>
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isLoading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '⏳ Processing...' : `💳 Deposit R${amount || '0.00'}`}
        </button>
      </form>

      {/* Status Message */}
      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '4px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* Test Card Information */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <h4>🧪 Test Card Numbers (Development)</h4>
        <p><strong>Successful Payment:</strong> 4242 4242 4242 4242</p>
        <p><strong>Declined Payment:</strong> 4000 0000 0000 0002</p>
        <p><strong>CVV:</strong> Any 3 digits</p>
        <p><strong>Expiry:</strong> Any future date</p>
        <p><strong>ZIP:</strong> Any 5 digits</p>
      </div>
    </div>
  );
};

export default FunderDeposit;
```

### 5. Alternative Simpler Implementation (Using Payment Element)

If you prefer the newer Payment Element (recommended by Stripe):

**components/SimpleDeposit.jsx:**

```jsx
import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const SimpleDeposit = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [amount, setAmount] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const createPaymentIntent = async () => {
    if (!amount || parseFloat(amount) < 10) {
      setMessage('Please enter an amount of at least R10.00');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await axios.post(
        `${API_BASE}/funder/deposit/create-intent`,
        { amount: Math.round(parseFloat(amount) * 100) },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setClientSecret(response.data.data.clientSecret);
        setPaymentIntentId(response.data.data.paymentIntentId);
        setMessage('Payment form ready. Please complete your payment.');
      }
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/deposit-success`,
      },
      redirect: 'if_required'
    });

    if (error) {
      setMessage(`Payment failed: ${error.message}`);
    } else if (paymentIntent.status === 'succeeded') {
      // Confirm on backend
      try {
        const confirmResponse = await axios.post(
          `${API_BASE}/funder/deposit/confirm`,
          { paymentIntentId: paymentIntent.id },
          { headers: getAuthHeaders() }
        );

        if (confirmResponse.data.success) {
          setMessage(`✅ Deposit successful! R${confirmResponse.data.data.amount} added to your account.`);
          setClientSecret('');
          setAmount('');
        }
      } catch (error) {
        setMessage(`Payment succeeded but confirmation failed: ${error.message}`);
      }
    }

    setIsLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>💰 Deposit Funds (Simple)</h2>
      
      {!clientSecret ? (
        // Step 1: Amount input and create intent
        <div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (minimum R10.00)"
            min="10"
            step="0.01"
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button
            onClick={createPaymentIntent}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {isLoading ? 'Creating...' : `Create Payment for R${amount || '0.00'}`}
          </button>
        </div>
      ) : (
        // Step 2: Payment form
        <form onSubmit={handlePayment}>
          <PaymentElement />
          <button
            type="submit"
            disabled={!stripe || isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              marginTop: '20px'
            }}
          >
            {isLoading ? 'Processing...' : `Pay R${amount}`}
          </button>
        </form>
      )}

      {message && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          borderRadius: '4px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default SimpleDeposit;
```

### 6. Debugging Tips

**Add Console Logging:**

```jsx
const handleDeposit = async (e) => {
  e.preventDefault();
  
  console.log('🔧 DEBUG: Starting deposit process');
  console.log('🔧 DEBUG: Amount:', amount);
  console.log('🔧 DEBUG: Stripe loaded:', !!stripe);
  console.log('🔧 DEBUG: Elements loaded:', !!elements);
  console.log('🔧 DEBUG: Auth token:', localStorage.getItem('token') ? 'Present' : 'Missing');
  
  // ... rest of your code
};
```

### 7. Common Issues & Solutions

**Issue 1: "Stripe not loaded"**
```jsx
// Add this check at the top of your component
if (!stripe) {
  return <div>Loading Stripe...</div>;
}
```

**Issue 2: "Invalid JWT token"**
```jsx
// Check if token exists and is valid
const token = localStorage.getItem('token');
if (!token) {
  return <div>Please log in first</div>;
}
```

**Issue 3: "CORS errors"**
Make sure your backend allows your frontend domain in CORS settings.

### 8. Testing Checklist

1. ✅ Stripe public key is correct
2. ✅ JWT token is present in localStorage
3. ✅ Backend API is running and accessible
4. ✅ Amount is at least R10.00
5. ✅ Using test card numbers in development
6. ✅ Console shows successful API calls

Would you like me to help you implement this step by step, or do you have a specific error you're encountering?
