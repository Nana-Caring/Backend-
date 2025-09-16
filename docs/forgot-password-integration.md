# 🔐 Forgot Password Integration Guide

## ✅ Integration Complete!

Your forgot password functionality is now fully integrated and ready for all user types (funders, caregivers, dependents, admins).

---

## 🚀 Available API Endpoints

### 1. **Production Forgot Password**
**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent.",
  "emailSent": true
}
```

### 2. **Reset Password**
**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```json
{
  "email": "user@example.com",
  "token": "reset-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your password has been reset successfully. You can now log in with your new password.",
  "userRole": "caregiver"
}
```

### 3. **Verify Reset Token**
**Endpoint:** `POST /api/auth/verify-reset-token`

**Request:**
```json
{
  "email": "user@example.com",
  "token": "reset-token-to-verify"
}
```

### 4. **Testing Endpoint (Development Only)**
**Endpoint:** `POST /api/auth/test-forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reset token generated successfully for testing.",
  "data": {
    "token": "generated-token",
    "email": "user@example.com",
    "userRole": "caregiver",
    "expiresAt": "2025-09-16T15:30:00.000Z",
    "resetUrl": "http://localhost:3000/reset-password?token=generated-token&email=user@example.com"
  },
  "note": "This endpoint is for testing only. Use /forgot-password for production."
}
```

---

## 🔧 Technical Implementation

### Database Fields
```javascript
// User model includes:
resetToken: {
  type: DataTypes.STRING,
  allowNull: true,
  comment: 'Token for password reset functionality'
},
resetTokenExpires: {
  type: DataTypes.BIGINT,
  allowNull: true,
  comment: 'Expiration timestamp for reset token'
}
```

### Security Features
- ✅ **Rate Limiting**: 3 attempts per 15 minutes per email
- ✅ **Token Expiration**: 10 minutes from generation
- ✅ **Single Use Tokens**: Tokens are invalidated after use
- ✅ **Secure Generation**: Crypto-secure random tokens
- ✅ **Email Validation**: Proper email format checking
- ✅ **Password Hashing**: Bcrypt with salt rounds

### Email Service Integration
- ✅ **Gmail SMTP**: Uses Nodemailer with Gmail
- ✅ **HTML Templates**: Professional styled emails
- ✅ **Error Handling**: Graceful email service failures
- ✅ **Environment Variables**: Configurable email settings

---

## 🧪 Testing Instructions

### Quick Test (Using Test Endpoint)

1. **Generate Reset Token:**
```bash
curl -X POST http://localhost:5000/api/auth/test-forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "john.smiths34@example.com"}'
```

2. **Reset Password:**
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.smiths34@example.com",
    "token": "YOUR_TOKEN_FROM_STEP_1",
    "newPassword": "newPassword123"
  }'
```

### Full Production Test

1. **Request Password Reset:**
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "john.smiths34@example.com"}'
```

2. **Check Email** (if email service is configured)
3. **Use Reset Link** from email or copy token
4. **Reset Password** using the reset endpoint

---

## 🎨 Frontend Integration

### React Example

```javascript
// Forgot Password Component
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Reset link sent to your email!');
      } else {
        setMessage(data.message || 'Something went wrong');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleForgotPassword}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

// Reset Password Component
const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    newPassword: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Get token and email from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    
    if (token && email) {
      setFormData(prev => ({ ...prev, token, email }));
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Password reset successful! You can now log in.');
        // Redirect to login page
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage(data.message || 'Reset failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        placeholder="Email"
        required
      />
      <input
        type="text"
        value={formData.token}
        onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
        placeholder="Reset Token"
        required
      />
      <input
        type="password"
        value={formData.newPassword}
        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
        placeholder="New Password"
        minLength="6"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};
```

---

## 📧 Email Configuration

### Environment Variables Required
```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

### Gmail App Password Setup
1. Enable 2-Factor Authentication in Gmail
2. Go to Google Account Settings > Security > App Passwords
3. Generate an app password for "Mail"
4. Use this app password in `GMAIL_PASS`

---

## 🚨 Error Handling

### Common Error Responses

**Invalid Email:**
```json
{
  "success": false,
  "message": "Please provide a valid email address",
  "errors": [...]
}
```

**Expired Token:**
```json
{
  "success": false,
  "message": "Reset link has expired. Please request a new password reset."
}
```

**Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid reset link. Please request a new password reset."
}
```

**Rate Limited:**
```json
{
  "success": false,
  "message": "Too many password reset attempts, try again later."
}
```

---

## 🔐 Security Best Practices

1. **Always use HTTPS** in production
2. **Monitor reset attempts** for suspicious activity
3. **Log security events** for audit trails
4. **Use strong passwords** (enforce minimum requirements)
5. **Consider 2FA** for additional security
6. **Regular token cleanup** (expired tokens)

---

## 🎉 Integration Complete!

Your forgot password functionality is now:
- ✅ **Fully Integrated** for all user types
- ✅ **Security Hardened** with rate limiting and token expiration
- ✅ **Email Ready** with professional templates
- ✅ **Production Ready** with proper error handling
- ✅ **Well Tested** with comprehensive test scripts

Users can now reset their passwords safely and securely! 🚀
