/**
 * Validation Utilities for Expense Tracker
 * Purpose: Centralized validation functions for input sanitization, data validation, and error handling
 * Constitutional Requirements: Input validation, error handling, data integrity
 */

import { ValidationError } from './errors.js';

/**
 * HTML entity encoding for text inputs to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeHtml(text) {
  if (typeof text !== 'string') {
    return '';
  }
  
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'\/]/g, (char) => entityMap[char]);
}

/**
 * Validate and sanitize a number with range checks
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum value (inclusive)
 * @param {number} options.max - Maximum value (inclusive)
 * @param {boolean} options.allowZero - Whether zero is allowed
 * @param {boolean} options.integer - Whether only integers are allowed
 * @returns {Object} Validation result
 */
export function validateNumber(value, options = {}) {
  const {
    min = -Infinity,
    max = Infinity,
    allowZero = true,
    integer = false
  } = options;

  const result = {
    isValid: false,
    value: null,
    error: null
  };

  // Check if value exists
  if (value === null || value === undefined || value === '') {
    result.error = 'Value is required';
    return result;
  }

  // Convert to number
  const numValue = Number(value);

  // Check if it's a valid number
  if (isNaN(numValue) || !isFinite(numValue)) {
    result.error = 'Value must be a valid number';
    return result;
  }

  // Check integer requirement
  if (integer && !Number.isInteger(numValue)) {
    result.error = 'Value must be an integer';
    return result;
  }

  // Check zero allowance
  if (!allowZero && numValue === 0) {
    result.error = 'Value cannot be zero';
    return result;
  }

  // Check range
  if (numValue < min) {
    result.error = `Value must be at least ${min}`;
    return result;
  }

  if (numValue > max) {
    result.error = `Value must be at most ${max}`;
    return result;
  }

  result.isValid = true;
  result.value = numValue;
  return result;
}

/**
 * Validate date format and constraints
 * @param {any} value - Date value to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.allowFuture - Whether future dates are allowed
 * @param {Date} options.minDate - Minimum allowed date
 * @param {Date} options.maxDate - Maximum allowed date
 * @param {string} options.format - Expected format ('YYYY-MM-DD', 'ISO', 'timestamp')
 * @returns {Object} Validation result
 */
export function validateDate(value, options = {}) {
  const {
    allowFuture = false,
    minDate = null,
    maxDate = null,
    format = 'YYYY-MM-DD'
  } = options;

  const result = {
    isValid: false,
    value: null,
    error: null
  };

  // Check if value exists
  if (value === null || value === undefined || value === '') {
    result.error = 'Date is required';
    return result;
  }

  let dateObj;

  try {
    if (format === 'YYYY-MM-DD') {
      // Validate YYYY-MM-DD format
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        result.error = 'Date must be in YYYY-MM-DD format';
        return result;
      }
      dateObj = new Date(value + 'T00:00:00.000Z');
    } else if (format === 'ISO') {
      dateObj = new Date(value);
    } else if (format === 'timestamp') {
      dateObj = new Date(Number(value));
    } else {
      dateObj = new Date(value);
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      result.error = 'Invalid date';
      return result;
    }

    // Check future date constraint
    if (!allowFuture && dateObj > new Date()) {
      result.error = 'Date cannot be in the future';
      return result;
    }

    // Check minimum date
    if (minDate && dateObj < minDate) {
      result.error = `Date must be after ${minDate.toISOString().split('T')[0]}`;
      return result;
    }

    // Check maximum date
    if (maxDate && dateObj > maxDate) {
      result.error = `Date must be before ${maxDate.toISOString().split('T')[0]}`;
      return result;
    }

    result.isValid = true;
    result.value = format === 'YYYY-MM-DD' ? value : dateObj;
    return result;

  } catch (error) {
    result.error = 'Invalid date format';
    return result;
  }
}

/**
 * Validate UUID format
 * @param {any} value - UUID to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether the UUID is required
 * @returns {Object} Validation result
 */
export function validateUuid(value, options = {}) {
  const { required = true } = options;

  const result = {
    isValid: false,
    value: null,
    error: null
  };

  // Check if value exists
  if (value === null || value === undefined || value === '') {
    if (required) {
      result.error = 'UUID is required';
      return result;
    } else {
      result.isValid = true;
      result.value = value;
      return result;
    }
  }

  // Check UUID format (v4)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (typeof value !== 'string' || !uuidRegex.test(value)) {
    result.error = 'Invalid UUID format';
    return result;
  }

  result.isValid = true;
  result.value = value;
  return result;
}

/**
 * Validate text input with length and content constraints
 * @param {any} value - Text to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length
 * @param {number} options.maxLength - Maximum length
 * @param {boolean} options.required - Whether the text is required
 * @param {boolean} options.allowWhitespaceOnly - Whether whitespace-only text is allowed
 * @param {RegExp} options.pattern - Pattern to match
 * @param {boolean} options.sanitize - Whether to sanitize HTML
 * @returns {Object} Validation result
 */
export function validateText(value, options = {}) {
  const {
    minLength = 0,
    maxLength = Infinity,
    required = true,
    allowWhitespaceOnly = false,
    pattern = null,
    sanitize = true
  } = options;

  const result = {
    isValid: false,
    value: null,
    error: null
  };

  // Check if value exists
  if (value === null || value === undefined) {
    if (required) {
      result.error = 'Text is required';
      return result;
    } else {
      result.isValid = true;
      result.value = '';
      return result;
    }
  }

  // Convert to string
  let textValue = String(value);

  // Sanitize if requested
  if (sanitize) {
    textValue = sanitizeHtml(textValue);
  }

  // Check empty string
  if (textValue === '' && required) {
    result.error = 'Text is required';
    return result;
  }

  // Check whitespace only
  if (!allowWhitespaceOnly && textValue.trim() === '' && textValue !== '') {
    result.error = 'Text cannot be only whitespace';
    return result;
  }

  // Check length constraints
  if (textValue.length < minLength) {
    result.error = `Text must be at least ${minLength} characters long`;
    return result;
  }

  if (textValue.length > maxLength) {
    result.error = `Text must be at most ${maxLength} characters long`;
    return result;
  }

  // Check pattern
  if (pattern && !pattern.test(textValue)) {
    result.error = 'Text format is invalid';
    return result;
  }

  result.isValid = true;
  result.value = textValue;
  return result;
}

/**
 * Validate email format
 * @param {any} value - Email to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether email is required
 * @returns {Object} Validation result
 */
export function validateEmail(value, options = {}) {
  const { required = true } = options;
  
  // Handle empty case for non-required emails
  if ((value === null || value === undefined || value === '') && !required) {
    return {
      isValid: true,
      value: '',
      error: null
    };
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return validateText(value, {
    required,
    pattern: emailPattern,
    maxLength: 254,
    sanitize: false
  });
}

/**
 * Validate hex color code
 * @param {any} value - Color to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether color is required
 * @param {boolean} options.allowShorthand - Whether 3-digit hex codes are allowed
 * @returns {Object} Validation result
 */
export function validateColor(value, options = {}) {
  const { required = true, allowShorthand = true } = options;

  const result = {
    isValid: false,
    value: null,
    error: null
  };

  // Check if value exists
  if (value === null || value === undefined || value === '') {
    if (required) {
      result.error = 'Color is required';
      return result;
    } else {
      result.isValid = true;
      result.value = value;
      return result;
    }
  }

  // Convert to string and normalize
  let colorValue = String(value).toLowerCase();

  // Add # if missing
  if (!colorValue.startsWith('#')) {
    colorValue = '#' + colorValue;
  }

  // Validate format
  const longPattern = /^#[0-9a-f]{6}$/;
  const shortPattern = /^#[0-9a-f]{3}$/;

  if (!longPattern.test(colorValue) && !(allowShorthand && shortPattern.test(colorValue))) {
    result.error = 'Color must be a valid hex code (e.g., #FF0000 or #F00)';
    return result;
  }

  // Expand short notation if needed
  if (shortPattern.test(colorValue)) {
    colorValue = '#' + colorValue[1] + colorValue[1] + 
                      colorValue[2] + colorValue[2] + 
                      colorValue[3] + colorValue[3];
  }

  result.isValid = true;
  result.value = colorValue;
  return result;
}

/**
 * Validate expense amount according to business rules
 * @param {any} value - Amount to validate
 * @returns {Object} Validation result
 */
export function validateExpenseAmount(value) {
  const result = validateNumber(value, {
    min: 0.01,
    max: 1000000,
    allowZero: false,
    integer: false
  });

  // Customize error messages for business context
  if (!result.isValid) {
    if (result.error === 'Value must be at least 0.01') {
      result.error = 'Amount must be positive';
    } else if (result.error === 'Value cannot be zero') {
      result.error = 'Amount must be positive';
    }
  }

  return {
    isValid: result.isValid,
    value: result.value,
    errors: result.isValid ? [] : [result.error]
  };
}

/**
 * Validate expense description according to business rules
 * @param {any} value - Description to validate
 * @returns {Object} Validation result
 */
export function validateExpenseDescription(value, options = {}) {
  const { required = true } = options;
  
  const result = validateText(value, {
    required,
    maxLength: 255,
    minLength: 1
  });

  // Custom validation for empty trimmed value
  if (result.isValid && result.value && result.value.trim().length === 0) {
    return {
      isValid: false,
      value: result.value,
      errors: ['Description cannot be empty']
    };
  }

  // Custom error message for max length
  if (!result.isValid && result.error && result.error.includes('must be at most')) {
    return {
      isValid: false,
      value: result.value,
      errors: ['Description is too long']
    };
  }

  return {
    isValid: result.isValid,
    value: result.value,
    errors: result.isValid ? [] : [result.error]
  };
}

/**
 * Validate expense date according to business rules
 * @param {any} value - Date to validate
 * @returns {Object} Validation result
 */
export function validateExpenseDate(value) {
  const result = validateDate(value, {
    allowFuture: false,
    format: 'YYYY-MM-DD'
  });

  return {
    isValid: result.isValid,
    value: result.value,
    errors: result.isValid ? [] : [result.error]
  };
}

/**
 * Validate category name according to business rules
 * @param {any} value - Category name to validate
 * @returns {Object} Validation result
 */
export function validateCategoryName(value) {
  return validateText(value, {
    minLength: 1,
    maxLength: 50,
    required: true,
    allowWhitespaceOnly: false,
    sanitize: true
  });
}

/**
 * Validate category color according to business rules
 * @param {any} value - Category color to validate
 * @returns {Object} Validation result
 */
export function validateCategoryColor(value) {
  return validateColor(value, {
    required: true,
    allowShorthand: true
  });
}

/**
 * Validate budget amount according to business rules
 * @param {any} value - Budget amount to validate
 * @returns {Object} Validation result
 */
export function validateBudgetAmount(value) {
  return validateNumber(value, {
    min: 0.01,
    max: 10000000,
    allowZero: false,
    integer: false
  });
}

/**
 * Validate budget period according to business rules
 * @param {any} value - Budget period to validate
 * @returns {Object} Validation result
 */
export function validateBudgetPeriod(value) {
  const validPeriods = ['weekly', 'monthly', 'yearly'];
  
  const result = {
    isValid: false,
    value: null,
    error: null
  };

  if (!value || !validPeriods.includes(String(value).toLowerCase())) {
    result.error = 'Budget period must be weekly, monthly, or yearly';
    return result;
  }

  result.isValid = true;
  result.value = String(value).toLowerCase();
  return result;
}

/**
 * Validate an object against multiple validation rules
 * @param {Object} data - Data to validate
 * @param {Object} rules - Validation rules object
 * @returns {Object} Validation result with all field errors
 */
export function validateObject(data, rules) {
  const result = {
    isValid: true,
    errors: {},
    values: {}
  };

  for (const [field, validator] of Object.entries(rules)) {
    const fieldResult = validator(data[field]);
    
    if (!fieldResult.isValid) {
      result.isValid = false;
      result.errors[field] = fieldResult.error;
    } else {
      result.values[field] = fieldResult.value;
    }
  }

  return result;
}

/**
 * Create a validation function for arrays
 * @param {Function} itemValidator - Validator function for individual items
 * @param {Object} options - Array validation options
 * @param {number} options.minItems - Minimum number of items
 * @param {number} options.maxItems - Maximum number of items
 * @param {boolean} options.required - Whether array is required
 * @returns {Function} Array validation function
 */
export function createArrayValidator(itemValidator, options = {}) {
  const { minItems = 0, maxItems = Infinity, required = true } = options;

  return function validateArray(value) {
    const result = {
      isValid: false,
      value: null,
      errors: [],
      error: null
    };

    // Check if value exists
    if (!Array.isArray(value)) {
      if (required) {
        result.error = 'Array is required';
        return result;
      } else {
        result.isValid = true;
        result.value = [];
        return result;
      }
    }

    // Check array length
    if (value.length < minItems) {
      result.error = `Array must have at least ${minItems} items`;
      return result;
    }

    if (value.length > maxItems) {
      result.error = `Array must have at most ${maxItems} items`;
      return result;
    }

    // Validate each item
    const validItems = [];
    const errors = [];

    for (let i = 0; i < value.length; i++) {
      const itemResult = itemValidator(value[i]);
      if (itemResult.isValid) {
        validItems.push(itemResult.value);
      } else {
        errors.push({ index: i, error: itemResult.error });
      }
    }

    if (errors.length > 0) {
      result.error = `Validation failed for ${errors.length} items`;
      result.errors = errors;
      return result;
    }

    result.isValid = true;
    result.value = validItems;
    return result;
  };
}

/**
 * Throw ValidationError if validation fails
 * @param {Object} validationResult - Result from validation function
 * @param {string} context - Context for error message
 * @throws {ValidationError} If validation failed
 */
export function throwIfInvalid(validationResult, context = 'Validation') {
  if (!validationResult.isValid) {
    throw new ValidationError(`${context}: ${validationResult.error}`);
  }
}

/**
 * Check data integrity with checksums
 * @param {Object} data - Data to check
 * @param {string} expectedChecksum - Expected checksum
 * @returns {boolean} Whether data integrity is valid
 */
export function checkDataIntegrity(data, expectedChecksum) {
  try {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    const actualChecksum = simpleHash(dataString);
    return actualChecksum === expectedChecksum;
  } catch (error) {
    return false;
  }
}

/**
 * Simple hash function for data integrity
 * @param {string} str - String to hash
 * @returns {string} Hash value
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}