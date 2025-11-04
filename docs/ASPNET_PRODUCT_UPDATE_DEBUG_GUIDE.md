# 🔧 ASP.NET Product Update Debug Guide

## 🎯 Common Issues & Solutions for Product Updates

### 1. **Endpoint Configuration**

#### ✅ Correct Backend Endpoint
```
PUT /admin/products/{id}
Content-Type: application/json
Authorization: Bearer {admin_token}
```

#### ❌ Common URL Mistakes
- Using `/api/admin/products/{id}` instead of `/admin/products/{id}`
- Missing the `/admin` prefix
- Using `POST` instead of `PUT`

---

### 2. **ASP.NET HttpClient Configuration**

#### ✅ Correct Implementation
```csharp
public class ProductService
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl = "https://nanacaring-backend.onrender.com";
    private readonly string _adminToken; // Get from your auth service

    public ProductService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_adminToken}");
    }

    public async Task<ApiResponse<Product>> UpdateProductAsync(int productId, ProductUpdateDto product)
    {
        try
        {
            // Prepare the update data - CRITICAL: Match backend field names exactly
            var updateData = new
            {
                name = product.Name,
                brand = product.Brand,
                price = product.Price, // Must be decimal, not string
                category = product.Category, // Must match exact enum values
                description = product.Description,
                sku = product.SKU,
                image = product.ImageUrl, // Must be valid URL or null
                stockQuantity = product.StockQuantity, // Must be integer
                minAge = product.MinAge, // Must be integer 0-150
                maxAge = product.MaxAge, // Must be integer 0-150
                ageCategory = product.AgeCategory, // Must match enum values
                requiresAgeVerification = product.RequiresAgeVerification, // Must be boolean
                isActive = product.IsActive, // Must be boolean
                inStock = product.InStock // Must be boolean
            };

            var json = JsonSerializer.Serialize(updateData, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PutAsync($"{_baseUrl}/admin/products/{productId}", content);

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ApiResponse<Product>>(responseContent);
                return result;
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Backend Error ({response.StatusCode}): {errorContent}");
                
                // Parse backend error for detailed information
                try
                {
                    var errorResponse = JsonSerializer.Deserialize<ApiErrorResponse>(errorContent);
                    throw new Exception($"Backend validation failed: {errorResponse.Message}");
                }
                catch
                {
                    throw new Exception($"HTTP {response.StatusCode}: {errorContent}");
                }
            }
        }
        catch (HttpRequestException ex)
        {
            throw new Exception($"Network error: {ex.Message}");
        }
        catch (JsonException ex)
        {
            throw new Exception($"JSON serialization error: {ex.Message}");
        }
    }
}
```

---

### 3. **Critical Field Validation**

#### ✅ Required Field Formats

```csharp
public class ProductUpdateDto
{
    // Text fields - ensure not empty if provided
    public string Name { get; set; }
    public string Brand { get; set; }
    public string Description { get; set; }
    public string SKU { get; set; }

    // Decimal field - CRITICAL: Use decimal type, not string
    public decimal Price { get; set; } // NOT string!

    // Enum fields - MUST match backend exactly
    [Required]
    public string Category { get; set; } // Education|Healthcare|Groceries|Transport|Entertainment|Other
    
    public string AgeCategory { get; set; } // Toddler|Child|Teen|Adult|Senior|All Ages

    // URL field - must be valid URL or null
    public string ImageUrl { get; set; } // Must pass URL validation

    // Integer fields
    public int StockQuantity { get; set; } // Must be >= 0
    public int? MinAge { get; set; } // Must be 0-150 if provided
    public int? MaxAge { get; set; } // Must be 0-150 if provided

    // Boolean fields - ensure proper boolean values
    public bool RequiresAgeVerification { get; set; }
    public bool IsActive { get; set; }
    public bool InStock { get; set; }
}
```

#### ❌ Common Field Mistakes

```csharp
// WRONG - These will cause validation errors
var badData = new
{
    price = "99.99", // Should be decimal, not string
    category = "health", // Should be "Healthcare" (exact case)
    ageCategory = "adult", // Should be "Adult" (exact case)
    stockQuantity = "50", // Should be int, not string
    minAge = "18", // Should be int, not string
    requiresAgeVerification = "true", // Should be bool, not string
    image = "invalid-url" // Should be valid URL or null
};
```

---

### 4. **Authentication Issues**

#### ✅ Proper Token Handling

```csharp
public class AuthService
{
    public async Task<string> GetAdminTokenAsync()
    {
        var loginData = new
        {
            email = "admin@example.com", // or highcourt@nanacaring.com
            password = "your-admin-password" // or highcourt2025
        };

        var response = await _httpClient.PostAsync("/api/auth/admin-login", 
            new StringContent(JsonSerializer.Serialize(loginData), Encoding.UTF8, "application/json"));

        if (response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<LoginResponse>(content);
            return result.AccessToken; // or result.Jwt
        }

        throw new Exception("Failed to authenticate");
    }
}

// Use the token for all admin requests
_httpClient.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", await _authService.GetAdminTokenAsync());
```

---

### 5. **Backend Response Models**

#### ✅ Expected Response Structure

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
}

public class ApiErrorResponse
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public ValidationError[] Errors { get; set; }
}

public class ValidationError
{
    public string Field { get; set; }
    public string Message { get; set; }
}

// Success Response Example:
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 123,
    "name": "Updated Product",
    "brand": "Brand Name",
    "price": 99.99,
    "category": "Healthcare",
    // ... other fields
  }
}

// Error Response Example:
{
  "success": false,
  "message": "Validation failed", 
  "errors": [
    {
      "field": "category",
      "message": "Valid category is required"
    }
  ]
}
```

---

### 6. **Debugging Steps**

#### Step 1: Enable Detailed Logging
```csharp
public async Task<ApiResponse<Product>> UpdateProductAsync(int productId, ProductUpdateDto product)
{
    // Log the request data
    var updateData = CreateUpdateData(product);
    var json = JsonSerializer.Serialize(updateData, new JsonSerializerOptions 
    { 
        WriteIndented = true 
    });
    
    Console.WriteLine($"Sending to backend: {json}");
    
    var response = await _httpClient.PutAsync($"{_baseUrl}/admin/products/{productId}", content);
    
    // Log the response
    var responseContent = await response.Content.ReadAsStringAsync();
    Console.WriteLine($"Backend response ({response.StatusCode}): {responseContent}");
    
    return ProcessResponse(response, responseContent);
}
```

#### Step 2: Test with Minimal Data First
```csharp
// Start with minimal required fields only
var minimalUpdate = new
{
    name = "Test Product Update",
    price = 99.99m,
    category = "Healthcare"
};
```

#### Step 3: Validate Each Field Individually
```csharp
private object CreateUpdateData(ProductUpdateDto product)
{
    var data = new Dictionary<string, object>();
    
    // Only add non-null/non-empty fields
    if (!string.IsNullOrEmpty(product.Name))
        data["name"] = product.Name;
        
    if (!string.IsNullOrEmpty(product.Brand))
        data["brand"] = product.Brand;
        
    if (product.Price > 0)
        data["price"] = product.Price;
        
    if (!string.IsNullOrEmpty(product.Category))
        data["category"] = product.Category;
        
    // Validate URL before sending
    if (!string.IsNullOrEmpty(product.ImageUrl))
    {
        if (Uri.IsWellFormedUriString(product.ImageUrl, UriKind.Absolute))
            data["image"] = product.ImageUrl;
        else
            throw new ArgumentException("Invalid image URL format");
    }
    
    return data;
}
```

---

### 7. **Common Error Scenarios & Solutions**

#### Error: "Validation failed"
**Cause**: Field validation errors
**Solution**: Check field formats, enum values, data types

#### Error: "Product not found" 
**Cause**: Invalid product ID or product doesn't exist
**Solution**: Verify product ID exists in database

#### Error: "Access denied"
**Cause**: Missing or invalid admin token
**Solution**: Re-authenticate and get fresh token

#### Error: "Invalid image URL"
**Cause**: Image field contains invalid URL
**Solution**: Validate URL format or send null

#### Error: Network timeout
**Cause**: Connection issues or slow backend
**Solution**: Increase timeout, check network connectivity

---

### 8. **Test Endpoint Directly**

Use this curl command to test the backend directly:

```bash
curl -X PUT https://nanacaring-backend.onrender.com/admin/products/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Test Product",
    "brand": "Test Brand",
    "price": 99.99,
    "category": "Healthcare",
    "description": "Test description"
  }'
```

If this works but your ASP.NET doesn't, the issue is in your frontend code.

---

### 9. **Complete Working Example**

```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly ProductService _productService;

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductUpdateDto product)
    {
        try
        {
            // Validate the product data first
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _productService.UpdateProductAsync(id, product);
            
            if (result.Success)
            {
                return Ok(result);
            }
            else
            {
                return BadRequest(result);
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
```

---

## 🚨 Most Common Issues Checklist

- [ ] **Wrong endpoint URL** - Should be `/admin/products/{id}`, not `/api/admin/products/{id}`
- [ ] **Missing Authorization header** - Must include `Bearer {token}`
- [ ] **Wrong HTTP method** - Must be `PUT`, not `POST`
- [ ] **Invalid enum values** - Category/AgeCategory must match exactly
- [ ] **Wrong data types** - Price must be decimal, not string
- [ ] **Invalid URL format** - Image field must be valid URL or null
- [ ] **Expired token** - Re-authenticate if getting 401 errors
- [ ] **Case sensitivity** - Backend is case-sensitive for enum values

Follow this guide step by step, and you should be able to identify and fix the update issues in your ASP.NET frontend!