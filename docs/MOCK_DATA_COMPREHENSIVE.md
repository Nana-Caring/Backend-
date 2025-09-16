# Mock Data for User Registration Testing

## 🧪 Comprehensive Mock Data Sets

### 1. Dependent Registration Mock Data

#### Test Case 1: Young Dependent (Child)
```json
{
  "firstName": "Liam",
  "middleName": "James",
  "surname": "Williams",
  "email": "liam.williams@example.com",
  "password": "ChildPass123!",
  "Idnumber": "1005127890123",
  "relation": "son"
}
```

#### Test Case 2: Teen Dependent (No Middle Name)
```json
{
  "firstName": "Sophia",
  "surname": "Brown",
  "email": "sophia.brown@example.com",
  "password": "TeenPass456!",
  "Idnumber": "0703145678901",
  "relation": "daughter"
}
```

#### Test Case 3: Adult Dependent (Elderly Parent)
```json
{
  "firstName": "Margaret",
  "middleName": "Elizabeth",
  "surname": "Davis",
  "email": "margaret.davis@example.com",
  "password": "ElderlyPass789!",
  "Idnumber": "4512089012345",
  "relation": "mother"
}
```

#### Test Case 4: Young Adult Dependent (Student)
```json
{
  "firstName": "Noah",
  "middleName": "Alexander",
  "surname": "Miller",
  "email": "noah.miller@example.com",
  "password": "StudentPass321!",
  "Idnumber": "0201156789012",
  "relation": "nephew"
}
```

#### Test Case 5: Special Characters in Name
```json
{
  "firstName": "Zoë",
  "middleName": "Marie-Claire",
  "surname": "O'Connor",
  "email": "zoe.oconnor@example.com",
  "password": "SpecialPass654!",
  "Idnumber": "9808234567890",
  "relation": "niece"
}
```

---

### 2. Caregiver Registration Mock Data

#### Test Case 1: Professional Caregiver
```json
{
  "firstName": "Jennifer",
  "middleName": "Anne",
  "surname": "Thompson",
  "email": "jennifer.thompson@example.com",
  "password": "CaregiverPass123!",
  "Idnumber": "8505127890123",
  "role": "caregiver"
}
```

#### Test Case 2: Family Caregiver (Parent)
```json
{
  "firstName": "Michael",
  "middleName": "Robert",
  "surname": "Johnson",
  "email": "michael.johnson@example.com",
  "password": "ParentPass456!",
  "Idnumber": "7803145678901",
  "role": "caregiver"
}
```

#### Test Case 3: Young Caregiver (Sibling)
```json
{
  "firstName": "Isabella",
  "surname": "Garcia",
  "email": "isabella.garcia@example.com",
  "password": "SiblingPass789!",
  "Idnumber": "9201089012345",
  "role": "caregiver"
}
```

---

### 3. Funder Registration Mock Data

#### Test Case 1: Individual Funder
```json
{
  "firstName": "David",
  "middleName": "Christopher",
  "surname": "Wilson",
  "email": "david.wilson@example.com",
  "password": "FunderPass123!",
  "Idnumber": "7512127890123",
  "role": "funder"
}
```

#### Test Case 2: Corporate Representative
```json
{
  "firstName": "Sarah",
  "middleName": "Elizabeth",
  "surname": "Anderson",
  "email": "sarah.anderson@corporate.com",
  "password": "CorpFunder456!",
  "Idnumber": "8203145678901",
  "role": "funder"
}
```

#### Test Case 3: Philanthropist
```json
{
  "firstName": "Richard",
  "surname": "Martinez",
  "email": "richard.martinez@foundation.org",
  "password": "PhilanthropistPass789!",
  "Idnumber": "6801089012345",
  "role": "funder"
}
```

---

### 4. Profile Update Mock Data

#### Complete Profile Data
```json
{
  "phoneNumber": "+27 82 123 4567",
  "postalAddressLine1": "123 Main Street",
  "postalAddressLine2": "Apartment 4B",
  "postalCity": "Cape Town",
  "postalProvince": "Western Cape",
  "postalCode": "8001",
  "homeAddressLine1": "456 Oak Avenue",
  "homeAddressLine2": "Unit 12",
  "homeCity": "Johannesburg",
  "homeProvince": "Gauteng",
  "homeCode": "2000"
}
```

#### Minimal Profile Data
```json
{
  "phoneNumber": "+27 71 987 6543",
  "postalAddressLine1": "789 Pine Road",
  "postalCity": "Durban",
  "postalProvince": "KwaZulu-Natal",
  "postalCode": "4001"
}
```

---

### 5. Login Mock Data

#### Dependent Login
```json
{
  "email": "liam.williams@example.com",
  "password": "ChildPass123!"
}
```

#### Caregiver Login
```json
{
  "email": "jennifer.thompson@example.com",
  "password": "CaregiverPass123!"
}
```

#### Funder Login
```json
{
  "email": "david.wilson@example.com",
  "password": "FunderPass123!"
}
```

---

### 6. Account Testing Data

#### Create Account Mock Data
```json
{
  "accountType": "Savings",
  "initialDeposit": 1000.00
}
```

#### Transaction Mock Data
```json
{
  "accountId": "account-uuid-here",
  "amount": 250.00,
  "type": "deposit",
  "description": "Monthly allowance"
}
```

---

### 7. Advanced Test Scenarios

#### Test Case: Dependent with Long Names
```json
{
  "firstName": "Alexandrina",
  "middleName": "Wilhelmina-Charlotte",
  "surname": "Van Der Westhuizen",
  "email": "alexandrina.vanderwesthuizen@example.com",
  "password": "LongNamePass123!",
  "Idnumber": "9512127890123",
  "relation": "granddaughter"
}
```

#### Test Case: International Characters
```json
{
  "firstName": "François",
  "middleName": "José",
  "surname": "Müller",
  "email": "francois.muller@example.com",
  "password": "InternationalPass456!",
  "Idnumber": "8712127890123",
  "relation": "cousin"
}
```

#### Test Case: Edge Case ID Numbers
```json
{
  "firstName": "TestUser",
  "middleName": "Edge",
  "surname": "Case",
  "email": "testuser.edgecase@example.com",
  "password": "EdgeCasePass789!",
  "Idnumber": "0001015555555",
  "relation": "ward"
}
```

---

### 8. Error Testing Mock Data

#### Invalid Email Format
```json
{
  "firstName": "Invalid",
  "surname": "Email",
  "email": "invalid-email-format",
  "password": "ValidPass123!",
  "Idnumber": "9512127890123",
  "relation": "son"
}
```

#### Weak Password
```json
{
  "firstName": "Weak",
  "surname": "Password",
  "email": "weak.password@example.com",
  "password": "123",
  "Idnumber": "9512127890123",
  "relation": "daughter"
}
```

#### Invalid ID Number
```json
{
  "firstName": "Invalid",
  "surname": "IdNumber",
  "email": "invalid.idnumber@example.com",
  "password": "ValidPass123!",
  "Idnumber": "123",
  "relation": "son"
}
```

---

### 9. Bulk Testing Data (Array Format)

#### Multiple Dependents for Testing
```json
[
  {
    "firstName": "Alice",
    "surname": "Smith",
    "email": "alice.smith@example.com",
    "password": "AlicePass123!",
    "Idnumber": "0401127890123",
    "relation": "daughter"
  },
  {
    "firstName": "Bob",
    "surname": "Smith",
    "email": "bob.smith@example.com",
    "password": "BobPass456!",
    "Idnumber": "0602127890123",
    "relation": "son"
  },
  {
    "firstName": "Charlie",
    "surname": "Smith",
    "email": "charlie.smith@example.com",
    "password": "CharliePass789!",
    "Idnumber": "0803127890123",
    "relation": "son"
  }
]
```

---

### 10. Real-World Scenario Data

#### Scenario: Single Parent with Multiple Children
**Parent (Caregiver):**
```json
{
  "firstName": "Lisa",
  "middleName": "Marie",
  "surname": "Johnson",
  "email": "lisa.johnson@example.com",
  "password": "SingleParentPass123!",
  "Idnumber": "8205127890123",
  "role": "caregiver"
}
```

**Child 1 (Dependent):**
```json
{
  "firstName": "Emma",
  "middleName": "Grace",
  "surname": "Johnson",
  "email": "emma.johnson@example.com",
  "password": "EmmaPass123!",
  "Idnumber": "1205127890123",
  "relation": "daughter"
}
```

**Child 2 (Dependent):**
```json
{
  "firstName": "Ethan",
  "middleName": "James",
  "surname": "Johnson",
  "email": "ethan.johnson@example.com",
  "password": "EthanPass456!",
  "Idnumber": "1405127890123",
  "relation": "son"
}
```

---

### 11. Quick Test Commands (PowerShell)

#### Register a Dependent
```powershell
$body = @{
    firstName = "Liam"
    middleName = "James"
    surname = "Williams"
    email = "liam.williams@example.com"
    password = "ChildPass123!"
    Idnumber = "1005127890123"
    relation = "son"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register-dependent" -Method Post -Body $body -ContentType "application/json"
```

#### Register a Caregiver
```powershell
$body = @{
    firstName = "Jennifer"
    middleName = "Anne"
    surname = "Thompson"
    email = "jennifer.thompson@example.com"
    password = "CaregiverPass123!"
    Idnumber = "8505127890123"
    role = "caregiver"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

#### Login Test
```powershell
$body = @{
    email = "liam.williams@example.com"
    password = "ChildPass123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

---

### 12. Testing Checklist

- [ ] Test dependent registration with all mock data sets
- [ ] Test caregiver registration  
- [ ] Test funder registration
- [ ] Test login with various user types
- [ ] Test profile updates
- [ ] Test account creation and management
- [ ] Test error scenarios (invalid data)
- [ ] Test edge cases (special characters, long names)
- [ ] Test bulk registration scenarios
- [ ] Verify account access permissions for each role

### 📝 Notes:
- All ID numbers follow South African format (13 digits)
- Passwords meet security requirements (8+ chars, mixed case, numbers, symbols)
- Email addresses are unique and properly formatted
- Relations include various family relationships and care arrangements
- Phone numbers use South African format (+27)
- Addresses use South African provinces and postal codes

Choose any of these mock data sets based on your testing needs!
