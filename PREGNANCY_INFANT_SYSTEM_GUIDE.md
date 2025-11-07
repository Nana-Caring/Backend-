# 🍼 PREGNANCY & INFANT SUPPORT SYSTEM - COMPLETE GUIDE

## 🎯 OVERVIEW

The Nana Caring platform now supports comprehensive pregnancy tracking and infant registration, allowing caregivers to:
- Register as pregnant with due dates
- Register unborn babies as dependents before birth
- Register newborn infants (0 years old) with automatic age calculation
- Track parent-child relationships
- Access pregnancy-specific products from Clicks

---

## 🗄️ DATABASE SCHEMA UPDATES

### **Users Table - New Fields:**

```sql
-- Age and Birth Information
"dateOfBirth" DATE                    -- Birth date for age calculation
"calculatedAge" INTEGER               -- Auto-calculated age from birth date

-- Pregnancy Tracking (for caregivers)
"isPregnant" BOOLEAN DEFAULT FALSE    -- Pregnancy status
"expectedDueDate" DATE                -- Expected delivery date

-- Infant Support (for dependents)
"isInfant" BOOLEAN DEFAULT FALSE      -- Auto-set for 0-year-olds
"isUnborn" BOOLEAN DEFAULT FALSE      -- For babies not yet born

-- Family Relationships
"parentCaregiverId" INTEGER           -- Links dependents to their caregiver parent
```

### **Automatic Triggers:**
- Age is auto-calculated from `dateOfBirth`
- `isInfant` is auto-set to `TRUE` for 0-year-olds and unborn babies
- Updates happen automatically on INSERT/UPDATE

### **Product Categories Updated:**
- **Pregnancy**: Prenatal vitamins, pregnancy tests, maternity care
- **Healthcare**: Age-appropriate medications and health products
- **Other**: Baby care, personal care suitable for all ages

---

## 🚀 API ENDPOINTS

### **Base URL:** `/api/pregnancy`

---

### 1️⃣ **Register Pregnancy Status**
**POST** `/api/pregnancy/register`

Register a caregiver as pregnant with expected due date.

**Headers:**
```
Authorization: Bearer <caregiver_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "expectedDueDate": "2025-03-15"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Pregnancy registered successfully",
  "data": {
    "caregiver": {
      "id": 1,
      "firstName": "Sarah",
      "surname": "Mothwa",
      "isPregnant": true,
      "expectedDueDate": "2025-03-15T00:00:00.000Z"
    },
    "dueDate": "2025-03-15",
    "weeksPregnant": 18
  }
}
```

**Validation:**
- ✅ Expected due date must be in the future
- ✅ Only caregivers can register as pregnant
- ✅ Automatic calculation of weeks pregnant

---

### 2️⃣ **Register Unborn Baby**
**POST** `/api/pregnancy/register-unborn`

Register an unborn baby as a dependent before birth.

**Headers:**
```
Authorization: Bearer <caregiver_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Baby",
  "surname": "Mothwa",
  "expectedDueDate": "2025-03-15"  // Optional - uses caregiver's due date if not provided
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Unborn baby registered successfully",
  "data": {
    "baby": {
      "id": 45,
      "firstName": "Baby",
      "surname": "Mothwa",
      "isUnborn": true,
      "isInfant": true,
      "expectedDueDate": "2025-03-15T00:00:00.000Z",
      "parentCaregiverId": 1
    },
    "note": "This registration will be updated when the baby is born"
  }
}
```

**Features:**
- ✅ Only pregnant caregivers can register unborn babies
- ✅ Automatic temporary ID generation
- ✅ System email address assignment
- ✅ Parent-child relationship tracking

---

### 3️⃣ **Register Newborn Infant**
**POST** `/api/pregnancy/register-infant`

Register a newborn baby (0-1 years old) as a dependent.

**Headers:**
```
Authorization: Bearer <caregiver_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Aiden",
  "surname": "Mothwa",
  "dateOfBirth": "2024-11-04",
  "idNumber": "2024110400001"  // Optional - temporary ID generated if not provided
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Infant registered successfully",
  "data": {
    "infant": {
      "id": 46,
      "firstName": "Aiden",
      "surname": "Mothwa",
      "dateOfBirth": "2024-11-04T00:00:00.000Z",
      "age": 0,
      "isInfant": true,
      "parentCaregiverId": 1,
      "temporaryId": false
    },
    "note": "Registered with official ID number"
  }
}
```

**Features:**
- ✅ Age restriction: Only 0-1 year olds (infants)
- ✅ Automatic age calculation
- ✅ Temporary ID generation if official ID not available
- ✅ Automatic infant status assignment

---

### 4️⃣ **Update Birth Information**
**PUT** `/api/pregnancy/birth-update/:unbornId`

Update an unborn baby's registration when they are born.

**Headers:**
```
Authorization: Bearer <caregiver_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "dateOfBirth": "2024-11-04",
  "idNumber": "2024110400001"  // Optional - new ID generated if not provided
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Baby birth information updated successfully",
  "data": {
    "baby": {
      "id": 45,
      "firstName": "Baby",
      "surname": "Mothwa",
      "dateOfBirth": "2024-11-04T00:00:00.000Z",
      "age": 0,
      "isInfant": true,
      "isUnborn": false,
      "parentCaregiverId": 1
    }
  }
}
```

**Process:**
- ✅ Converts unborn baby to born infant
- ✅ Updates ID number and birth date
- ✅ Changes email from unborn.system to infant.system
- ✅ Maintains parent-child relationship

---

### 5️⃣ **Get Family Information**
**GET** `/api/pregnancy/my-family`

Get caregiver's pregnancy status and all associated children.

**Headers:**
```
Authorization: Bearer <caregiver_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "caregiver": {
      "id": 1,
      "firstName": "Sarah",
      "surname": "Mothwa",
      "isPregnant": true,
      "expectedDueDate": "2025-03-15T00:00:00.000Z",
      "weeksPregnant": 18
    },
    "children": [
      {
        "id": 46,
        "firstName": "Aiden",
        "surname": "Mothwa",
        "age": 0,
        "dateOfBirth": "2024-11-04T00:00:00.000Z",
        "isInfant": true,
        "isUnborn": false,
        "expectedDueDate": null,
        "status": "Infant"
      },
      {
        "id": 45,
        "firstName": "Baby",
        "surname": "Mothwa",
        "age": null,
        "dateOfBirth": null,
        "isInfant": true,
        "isUnborn": true,
        "expectedDueDate": "2025-03-15T00:00:00.000Z",
        "status": "Unborn"
      }
    ],
    "summary": {
      "totalChildren": 2,
      "infants": 1,
      "unbornBabies": 1,
      "isExpectingMother": true
    }
  }
}
```

---

## 🛒 PREGNANCY PRODUCTS FROM CLICKS

### **Available Categories:**

#### 🤰 **Pregnancy Category:**
- **Pregnancy Tests**: Digital tests with clear results (R89.99)
- **Prenatal Vitamins**: Pregnacare Original 30 tablets (R159.99)
- **Folic Acid**: Clicks 5mg tablets for early pregnancy (R45.99)
- **Stretch Mark Care**: Bio-Oil 125ml for skin care (R179.99)

#### 🏥 **Healthcare Category:**
- **Pain Relief**: Pregnancy-safe medications (age verification required)
- **Vitamins**: Immune support during pregnancy
- **Thermometers**: Digital thermometers for health monitoring
- **Hand Sanitizer**: Safe hygiene products

#### 👶 **Personal Care (Other Category):**
- **Baby Products**: Johnson's Baby Shampoo, Purity wipes
- **Skincare**: Nivea moisturizers, Dove beauty bars
- **Nappy Care**: Bepanthen ointment for newborns

---

## 🔐 SECURITY & VALIDATION

### **Authentication Requirements:**
- ✅ JWT token required for all endpoints
- ✅ Role-based access (caregiver only)
- ✅ Parent-child relationship verification

### **Data Validation:**
- ✅ Future date validation for due dates
- ✅ Age restrictions for infant registration (0-1 years)
- ✅ Unique ID number constraints
- ✅ Pregnancy status verification for unborn baby registration

### **Automatic Safety Features:**
- ✅ Age auto-calculation with triggers
- ✅ Infant status auto-assignment
- ✅ Temporary ID generation for newborns
- ✅ System email address management

---

## 📱 FRONTEND INTEGRATION EXAMPLES

### **React/ASP.NET Integration:**

#### **Register Pregnancy:**
```javascript
const registerPregnancy = async (expectedDueDate) => {
  const response = await fetch('/api/pregnancy/register', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ expectedDueDate })
  });
  
  const data = await response.json();
  return data;
};
```

#### **Register Newborn:**
```javascript
const registerInfant = async (infantData) => {
  const response = await fetch('/api/pregnancy/register-infant', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(infantData)
  });
  
  return await response.json();
};
```

#### **Display Family Information:**
```javascript
const FamilyDashboard = () => {
  const [family, setFamily] = useState(null);
  
  useEffect(() => {
    fetch('/api/pregnancy/my-family', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setFamily(data.data));
  }, []);
  
  if (!family) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>{family.caregiver.firstName}'s Family</h2>
      {family.caregiver.isPregnant && (
        <div className="pregnancy-status">
          <p>Expecting baby due: {family.caregiver.expectedDueDate}</p>
          <p>Weeks pregnant: {family.caregiver.weeksPregnant}</p>
        </div>
      )}
      
      <div className="children">
        {family.children.map(child => (
          <div key={child.id} className="child-card">
            <h3>{child.firstName} {child.surname}</h3>
            <p>Status: {child.status}</p>
            <p>Age: {child.age !== null ? `${child.age} years` : 'Unborn'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🧪 TESTING SCENARIOS

### **Test Data Created:**
1. **Pregnant Caregiver**: Sarah Mothwa (ID: 8801124567890)
2. **Unborn Baby**: Baby Mothwa (Expected: 2025-03-15)
3. **Newborn Infant**: Aiden Mothwa (Born: 2024-11-04, Age: 0)

### **Test Cases:**

#### **Pregnancy Registration:**
```bash
# Test pregnancy registration
curl -X POST http://localhost:5000/api/pregnancy/register \
  -H "Authorization: Bearer <caregiver_token>" \
  -H "Content-Type: application/json" \
  -d '{"expectedDueDate": "2025-06-01"}'
```

#### **Infant Registration:**
```bash
# Test infant registration
curl -X POST http://localhost:5000/api/pregnancy/register-infant \
  -H "Authorization: Bearer <caregiver_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Emma",
    "surname": "Johnson", 
    "dateOfBirth": "2024-10-15"
  }'
```

#### **Family Information:**
```bash
# Get family information
curl -X GET http://localhost:5000/api/pregnancy/my-family \
  -H "Authorization: Bearer <caregiver_token>"
```

---

## 🎯 KEY FEATURES SUMMARY

### **✅ COMPLETED FEATURES:**

#### **Database:**
- ✅ Age calculation with automatic triggers
- ✅ Pregnancy tracking fields
- ✅ Infant support (0 years old)
- ✅ Unborn baby support
- ✅ Parent-child relationships
- ✅ Updated product categories (Transport → Pregnancy)

#### **API Endpoints:**
- ✅ Pregnancy registration
- ✅ Unborn baby registration
- ✅ Infant registration (0-1 years)
- ✅ Birth information updates
- ✅ Family information retrieval

#### **Business Logic:**
- ✅ Age-based automatic infant detection
- ✅ Temporary ID generation for newborns
- ✅ Pregnancy product targeting
- ✅ Role-based access control
- ✅ Data validation and security

#### **Clicks Integration:**
- ✅ 15 curated pregnancy & infant products
- ✅ Professional Clicks.co.za branding
- ✅ Age-appropriate product targeting
- ✅ Healthcare, Pregnancy, and Personal Care categories

---

## 🚀 READY FOR PRODUCTION

Your Nana Caring platform now supports:
- **Complete pregnancy journey tracking**
- **Unborn baby pre-registration**
- **Automatic infant support (0 years)**
- **Professional Clicks product integration**
- **Secure caregiver-dependent relationships**

The system is ready for ASP.NET frontend integration and production deployment! 🎉