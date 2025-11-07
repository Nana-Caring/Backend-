# 🔄 Dependent Registration System Improvements

## 🎯 **Issues to Address**

### 1. **Route Validation Inconsistency**
**Problem:** Routes validate `lastName` but controller expects `surname`

**Current Route Validation:**
```javascript
check("lastName", "Last name is required").not().isEmpty(),
check("surname", "Surname is required").not().isEmpty(),
```

**Fix:** Standardize on `surname` only (remove `lastName` requirement)

### 2. **Duplicate Validation Logic**
**Problem:** Multiple email/ID existence checks in different places

**Current Flow:**
```javascript
// First check
const emailExists = await User.findOne({ where: { email: finalEmail } });
// Later check  
const existingUser = await User.findOne({
  where: { [Op.or]: [{ email }, { Idnumber }] }
});
```

**Fix:** Consolidate into single validation function

### 3. **Caregiver-Dependent Linking Issues**
**Problem:** Some accounts not properly linked to caregivers

### 4. **Complex Infant Flow Logic**
**Problem:** Infant registration adds complexity and potential bugs

## ✅ **Proposed Solutions**

### **Solution 1: Streamlined Route Validation**

```javascript
// IMPROVED: /routes/authRoutes.js
router.post(
  "/register-dependent",
  [
    authMiddleware,
    // Personal Details
    check("firstName", "First name is required").not().isEmpty().trim(),
    check("surname", "Surname is required").not().isEmpty().trim(),
    check("middleName").optional().trim(),
    
    // Account Credentials (required for regular dependents)
    check("email", "Valid email required").optional().isEmail().normalizeEmail(),
    check("password", "Password must be at least 6 characters").optional().isLength({ min: 6 }),
    check("Idnumber", "Valid 13-digit numeric ID number required").optional().isLength({ min: 13, max: 13 }).isNumeric(),
    check("relation", "Relation is required").not().isEmpty().trim(),
    
    // Infant/Child specific
    check("dateOfBirth", "Valid date of birth required for minors").optional().isISO8601(),
    check("isInfant").optional().isBoolean(),
  ],
  registerDependent
);
```

### **Solution 2: Consolidated Validation Function**

```javascript
// NEW: /utils/dependentValidation.js
const validateDependentData = async (data, infantFlow = false) => {
  const errors = [];
  
  // Required fields validation
  if (!data.firstName?.trim()) errors.push('First name is required');
  if (!data.surname?.trim()) errors.push('Surname is required');
  if (!data.relation?.trim()) errors.push('Relation is required');
  
  if (!infantFlow) {
    // Regular dependent validation
    if (!data.email?.trim()) errors.push('Email is required');
    if (!data.password?.trim()) errors.push('Password is required');
    if (!data.Idnumber?.trim()) errors.push('ID number is required');
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push('Valid email format required');
    }
    
    // ID number format validation
    const idRegex = /^[0-9]{13}$/;
    if (data.Idnumber && !idRegex.test(data.Idnumber)) {
      errors.push('ID number must be exactly 13 digits');
    }
    
    // Check uniqueness
    if (data.email || data.Idnumber) {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            data.email ? { email: data.email } : {},
            data.Idnumber ? { Idnumber: data.Idnumber } : {}
          ].filter(obj => Object.keys(obj).length > 0)
        }
      });
      
      if (existingUser) {
        if (existingUser.email === data.email) errors.push('Email already exists');
        if (existingUser.Idnumber === data.Idnumber) errors.push('ID number already exists');
      }
    }
  } else {
    // Infant validation
    if (!data.dateOfBirth) errors.push('Date of birth is required for infant registration');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### **Solution 3: Improved Registration Controller**

```javascript
// IMPROVED: /controllers/authController.js - registerDependent function
exports.registerDependent = async (req, res) => {
  try {
    const { firstName, middleName, surname, email, password, Idnumber, relation, isInfant, dateOfBirth } = req.body;
    const caregiverId = req.user.id;

    // Verify caregiver authorization
    const caregiver = await User.findByPk(caregiverId);
    if (!caregiver || caregiver.role !== 'caregiver') {
      return res.status(403).json({ 
        success: false,
        message: 'Only caregivers can register dependents' 
      });
    }

    // Determine registration type
    const infantFlow = Boolean(isInfant) || Boolean(dateOfBirth);
    
    // Validate input data
    const validation = await validateDependentData(req.body, infantFlow);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Prepare dependent data
    let finalEmail = email;
    let finalId = Idnumber;
    let finalPassword = password;

    if (infantFlow) {
      // Generate system credentials for infants
      if (!finalEmail) {
        const suffix = Math.random().toString(36).slice(2, 8);
        finalEmail = `${firstName.toLowerCase()}.${surname.toLowerCase()}.${suffix}@infant.nana`;
      }
      
      if (!finalId) {
        const birthDate = new Date(dateOfBirth);
        const yearStr = birthDate.getFullYear().toString();
        const monthStr = (birthDate.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = birthDate.getDate().toString().padStart(2, '0');
        const randomStr = Math.random().toString().slice(-6);
        finalId = `${yearStr.slice(-2)}${monthStr}${dayStr}${randomStr}`;
      }
      
      finalPassword = finalPassword || 'temporary-infant-password';
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    // Create dependent user
    const dependentData = {
      firstName: firstName.trim(),
      middleName: middleName?.trim() || null,
      surname: surname.trim(),
      email: finalEmail,
      password: hashedPassword,
      Idnumber: finalId,
      relation: relation.trim(),
      role: 'dependent',
      
      // Infant-specific fields
      isInfant: infantFlow,
      dateOfBirth: infantFlow ? new Date(dateOfBirth) : null,
      parentCaregiverId: caregiverId,
      
      // Initialize personal details as null
      phoneNumber: null,
      postalAddressLine1: null,
      postalAddressLine2: null,
      postalCity: null,
      postalProvince: null,
      postalCode: null,
      homeAddressLine1: null,
      homeAddressLine2: null,
      homeCity: null,
      homeProvince: null,
      homeCode: null,
      
      status: 'active'
    };

    const dependent = await User.create(dependentData);

    // Create account structure
    const accountsCreated = await createDependentAccounts(dependent.id, caregiverId);

    // Send welcome notification (skip for infants)
    if (!infantFlow && dependent.email && !dependent.email.endsWith('@infant.nana')) {
      try {
        await sendWelcomeEmail(dependent, password);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }

    // Prepare response
    const responseData = {
      id: dependent.id,
      firstName: dependent.firstName,
      middleName: dependent.middleName,
      surname: dependent.surname,
      email: dependent.email,
      relation: dependent.relation,
      role: dependent.role,
      isInfant: dependent.isInfant,
      dateOfBirth: dependent.dateOfBirth,
      parentCaregiverId: dependent.parentCaregiverId,
      status: dependent.status,
      createdAt: dependent.createdAt,
      accounts: accountsCreated.summary
    };

    res.status(201).json({
      success: true,
      message: 'Dependent registered successfully',
      data: {
        dependent: responseData,
        accountsCreated: accountsCreated.count
      }
    });

  } catch (error) {
    console.error('Dependent registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed', 
      error: error.message 
    });
  }
};
```

### **Solution 4: Reliable Account Creation**

```javascript
// NEW: /utils/accountCreation.js
const createDependentAccounts = async (dependentId, caregiverId) => {
  const accountTypes = [
    { type: 'Main', description: 'Primary emergency fund' },
    { type: 'Education', description: 'School fees and educational materials' },
    { type: 'Healthcare', description: 'Medical expenses and medications' },
    { type: 'Groceries', description: 'Food and nutrition needs' },
    { type: 'Clothing', description: 'Clothing and housing needs' },
    { type: 'Baby Care', description: 'Baby care products and services' },
    { type: 'Entertainment', description: 'Recreation and development activities' },
    { type: 'Pregnancy', description: 'Pregnancy and prenatal care' }
  ];

  const createdAccounts = [];
  let mainAccount = null;

  try {
    // Create main account first
    const mainAccountNumber = await generateUniqueAccountNumber();
    mainAccount = await Account.create({
      userId: dependentId,
      caregiverId: caregiverId,
      accountType: 'Main',
      balance: 0.00,
      parentAccountId: null,
      accountNumber: mainAccountNumber,
      currency: 'ZAR',
      status: 'active'
    });
    
    createdAccounts.push({
      type: 'Main',
      id: mainAccount.id,
      accountNumber: mainAccount.accountNumber,
      isParent: true
    });

    // Create sub-accounts
    for (const accountType of accountTypes.slice(1)) { // Skip 'Main' since already created
      const subAccountNumber = await generateUniqueAccountNumber();
      const subAccount = await Account.create({
        userId: dependentId,
        caregiverId: caregiverId,
        accountType: accountType.type,
        balance: 0.00,
        parentAccountId: mainAccount.id,
        accountNumber: subAccountNumber,
        currency: 'ZAR',
        status: 'active'
      });
      
      createdAccounts.push({
        type: accountType.type,
        id: subAccount.id,
        accountNumber: subAccount.accountNumber,
        isParent: false
      });
    }

    return {
      success: true,
      count: createdAccounts.length,
      mainAccountId: mainAccount.id,
      summary: createdAccounts
    };

  } catch (error) {
    console.error('Account creation error:', error);
    
    // Rollback: Delete any created accounts if there was an error
    if (createdAccounts.length > 0) {
      await Account.destroy({
        where: {
          userId: dependentId,
          id: { [Op.in]: createdAccounts.map(acc => acc.id) }
        }
      });
    }
    
    throw new Error(`Failed to create accounts for dependent: ${error.message}`);
  }
};
```

### **Solution 5: Enhanced Error Handling and Responses**

```javascript
// NEW: /utils/responseHelpers.js
const createSuccessResponse = (message, data = null) => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

const createErrorResponse = (message, errors = null, statusCode = 400) => ({
  success: false,
  message,
  errors,
  statusCode,
  timestamp: new Date().toISOString()
});

const createValidationErrorResponse = (errors) => ({
  success: false,
  message: 'Validation failed',
  errors: Array.isArray(errors) ? errors : [errors],
  statusCode: 400,
  timestamp: new Date().toISOString()
});
```

## 🧪 **Testing Improvements**

### **Enhanced Mock Data Examples:**

```json
{
  "regularDependent": {
    "firstName": "Emma",
    "middleName": "Grace",
    "surname": "Johnson",
    "email": "emma.johnson@example.com",
    "password": "SecurePass123!",
    "Idnumber": "0512345678902",
    "relation": "daughter"
  },
  "infantDependent": {
    "firstName": "Baby",
    "middleName": "Joy",
    "surname": "Smith",
    "dateOfBirth": "2024-01-15",
    "relation": "child",
    "isInfant": true
  },
  "elderlyDependent": {
    "firstName": "Margaret",
    "middleName": "Rose",
    "surname": "Williams",
    "email": "margaret.williams@example.com",
    "password": "ElderlyPass456!",
    "Idnumber": "5408123456789",
    "relation": "mother"
  }
}
```

## 📊 **Implementation Priority**

1. **High Priority:**
   - Fix route validation inconsistency
   - Consolidate validation logic
   - Ensure reliable caregiver-dependent linking

2. **Medium Priority:**
   - Improve error handling and responses
   - Enhanced account creation reliability
   - Better infant flow handling

3. **Low Priority:**
   - Enhanced welcome emails
   - Additional validation rules
   - Audit logging for registrations

## 🔧 **Database Fixes Needed**

```sql
-- Fix existing accounts without caregiver links
UPDATE "Accounts" 
SET "caregiverId" = (
  SELECT "parentCaregiverId" 
  FROM "Users" 
  WHERE "Users"."id" = "Accounts"."userId" 
    AND "Users"."role" = 'dependent'
    AND "Users"."parentCaregiverId" IS NOT NULL
)
WHERE "caregiverId" IS NULL 
  AND "userId" IN (
    SELECT "id" FROM "Users" WHERE "role" = 'dependent'
  );
```

Would you like me to implement any of these improvements or address specific issues you've identified with the dependent registration system?