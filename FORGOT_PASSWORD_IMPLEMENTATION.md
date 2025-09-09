# Forgot Password Implementation

This document explains how to use the forgot password functionality that has been integrated into the backend.

## Features Added

### 1. Database Fields

Added to the User model (`models/User.js`):

- `resetPasswordToken`: Stores the password reset token
- `resetPasswordExpires`: Stores the token expiration time (15 mins)

### 2. Email Service

Created `utils/emailService.js` with:

- Password reset request emails
- Password reset confirmation emails
- Support for Gmail and other email services

### 3. API Endpoints

#### Forgot Password

```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "We have sent you an email with instructions to reset your password."
}
```

#### Reset Password

```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```env
# Email Configuration for Password Reset
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
CLIENT_URL=http://localhost:3000
```

### 2. Gmail Setup (if using Gmail)

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → App passwords
   - Select "Mail" and your device
   - Copy the generated password
   - Use this as `EMAIL_PASS` in your `.env` file

### 3. Alternative Email Services

You can use other email services by changing `EMAIL_SERVICE`:

- `gmail` (default)
- `outlook`
- `yahoo`
- `ethereal` (for testing)

## Security Features

### 1. Token Security

- Tokens are cryptographically secure (32 random bytes)
- Tokens expire after 15 mins
- Tokens are single-use (cleared after password reset)

### 2. Privacy Protection

- Same response for valid and invalid emails (prevents email enumeration)
- No sensitive information in error messages
- Rate limiting should be added for production

### 3. Email Validation

- Valid email format required
- Password strength validation (minimum 6 characters)

## Testing

### 1. Run the Test Script

```bash
node test-forgot-password-new.js
```

### 2. Manual Testing with Postman

1. Start your server: `npm start`
2. Test forgot password endpoint
3. Check your email for the reset token
4. Use the token to reset password

### 3. Test with cURL

```bash
# Request password reset
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Reset password (use token from email)
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token-here","newPassword":"newpassword123"}'
```

## Frontend Integration

### 1. Forgot Password Form

```javascript
const forgotPassword = async (email) => {
  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    alert(data.message);
  } catch (error) {
    console.error("Error:", error);
  }
};
```

### 2. Reset Password Form

```javascript
const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Password reset successfully!");
      // Redirect to login page
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
```

## Production Considerations

### 1. Rate Limiting

Add rate limiting to prevent abuse:

```javascript
const rateLimit = require("express-rate-limit");

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: "Too many password reset requests, try again later",
});

app.use("/api/auth/forgot-password", forgotPasswordLimiter);
```

### 2. HTTPS

Always use HTTPS in production for secure token transmission.

### 3. Email Templates

Customize email templates in `utils/emailService.js` to match your brand.

### 4. Logging

Add proper logging for security monitoring:

- Password reset requests
- Successful password resets
- Failed attempts

## Troubleshooting

### 1. Email Not Sending

- Check email credentials in `.env`
- Verify email service settings
- Check firewall/network restrictions
- Test with Ethereal email for development

### 2. Token Issues

- Ensure tokens are being saved to database
- Check token expiration logic
- Verify token format in emails

### 3. Database Issues

- Run database migrations if needed
- Check if new fields are added to User table
- Verify database connection

## Files Modified/Created

1. **Modified:**

   - `models/User.js` - Added reset token fields
   - `controllers/authController.js` - Added forgot/reset functions
   - `routes/authRoutes.js` - Added new routes
   - `.env` - Added email configuration

2. **Created:**
   - `utils/emailService.js` - Email functionality
   - `test-forgot-password-new.js` - Testing script
   - `FORGOT_PASSWORD_IMPLEMENTATION.md` - This documentation

The forgot password functionality is now fully integrated and ready to use!
