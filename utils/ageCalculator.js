// utils/ageCalculator.js
// South African ID Number Age Calculator

/**
 * Calculate age from South African 13-digit ID number
 * Format: YYMMDDGGGGSAAC
 * - YY: Year (00-99)
 * - MM: Month (01-12)  
 * - DD: Day (01-31)
 * - GGGG: Gender and sequence number
 * - SA: South African citizenship (0-1)
 * - A: Race (historical, no longer used)
 * - C: Check digit
 */
function calculateAgeFromSAId(idNumber) {
  try {
    if (!idNumber || idNumber.length !== 13) {
      throw new Error('Invalid ID number format');
    }

    // Extract date parts
    const year = parseInt(idNumber.substring(0, 2));
    const month = parseInt(idNumber.substring(2, 4));
    const day = parseInt(idNumber.substring(4, 6));

    // Validate month and day
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      throw new Error('Invalid date in ID number');
    }

    // Determine century (assume 00-29 = 2000s, 30-99 = 1900s)
    const fullYear = year <= 29 ? 2000 + year : 1900 + year;

    // Create birth date
    const birthDate = new Date(fullYear, month - 1, day);
    const currentDate = new Date();

    // Validate date
    if (birthDate > currentDate) {
      throw new Error('Invalid birth date - future date');
    }

    // Calculate age
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
      age--;
    }

    const ageCategory = getAgeCategory(age);

    return {
      age,
      birthDate: birthDate.toISOString().split('T')[0], // YYYY-MM-DD format
      ageCategory,
      isValid: true
    };

  } catch (error) {
    console.error('Age calculation error:', error);
    return {
      age: null,
      birthDate: null,
      isValid: false,
      error: error.message
    };
  }
}

/**
 * Get age category based on age
 */
function getAgeCategory(age) {
  if (age < 0) return 'Invalid';
  if (age <= 2) return 'Toddler';
  if (age <= 12) return 'Child';
  if (age <= 17) return 'Teen';
  if (age <= 64) return 'Adult';
  return 'Senior';
}

/**
 * Check if user can access product based on age restrictions
 */
function canAccessProduct(userAge, productAgeRestriction) {
  if (!productAgeRestriction) return true; // No restriction
  
  const { minAge, maxAge } = productAgeRestriction;
  
  // Check minimum age
  if (minAge !== null && minAge !== undefined && userAge < minAge) {
    return false;
  }
  
  // Check maximum age
  if (maxAge !== null && maxAge !== undefined && userAge > maxAge) {
    return false;
  }
  
  return true;
}

module.exports = {
  calculateAgeFromSAId,
  getAgeCategory,
  canAccessProduct
};
