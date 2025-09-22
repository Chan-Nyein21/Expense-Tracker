/**
 * Unit Tests for Validation Utilities
 * Purpose: Test all validation functions for correctness and edge cases
 */

import {
  sanitizeHtml,
  validateNumber,
  validateDate,
  validateUuid,
  validateText,
  validateEmail,
  validateColor,
  validateExpenseAmount,
  validateExpenseDescription,
  validateExpenseDate,
  validateCategoryName,
  validateCategoryColor,
  validateBudgetAmount,
  validateBudgetPeriod,
  validateObject,
  createArrayValidator,
  throwIfInvalid,
  checkDataIntegrity
} from '../../src/utils/validation.js';

import { ValidationError } from '../../src/utils/errors.js';

describe('Validation Utilities', () => {
  describe('sanitizeHtml', () => {
    test('should sanitize HTML entities', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(sanitizeHtml('Safe text')).toBe('Safe text');
      expect(sanitizeHtml('Text & more')).toBe('Text &amp; more');
      expect(sanitizeHtml("Text 'with' quotes")).toBe('Text &#39;with&#39; quotes');
    });

    test('should handle non-string inputs', () => {
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
      expect(sanitizeHtml(123)).toBe('');
    });
  });

  describe('validateNumber', () => {
    test('should validate positive numbers', () => {
      const result = validateNumber(42);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(42);
      expect(result.error).toBe(null);
    });

    test('should validate negative numbers when allowed', () => {
      const result = validateNumber(-10, { min: -100 });
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(-10);
    });

    test('should reject invalid numbers', () => {
      const result = validateNumber('not a number');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Value must be a valid number');
    });

    test('should respect min/max constraints', () => {
      const tooSmall = validateNumber(5, { min: 10 });
      expect(tooSmall.isValid).toBe(false);
      expect(tooSmall.error).toBe('Value must be at least 10');

      const tooLarge = validateNumber(15, { max: 10 });
      expect(tooLarge.isValid).toBe(false);
      expect(tooLarge.error).toBe('Value must be at most 10');
    });

    test('should handle zero based on allowZero option', () => {
      const allowZero = validateNumber(0, { allowZero: true });
      expect(allowZero.isValid).toBe(true);

      const rejectZero = validateNumber(0, { allowZero: false });
      expect(rejectZero.isValid).toBe(false);
      expect(rejectZero.error).toBe('Value cannot be zero');
    });

    test('should validate integers when required', () => {
      const validInteger = validateNumber(42, { integer: true });
      expect(validInteger.isValid).toBe(true);

      const invalidInteger = validateNumber(42.5, { integer: true });
      expect(invalidInteger.isValid).toBe(false);
      expect(invalidInteger.error).toBe('Value must be an integer');
    });

    test('should handle empty values', () => {
      const result = validateNumber('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Value is required');
    });
  });

  describe('validateDate', () => {
    test('should validate YYYY-MM-DD format', () => {
      const result = validateDate('2023-12-25');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('2023-12-25');
    });

    test('should reject invalid date formats', () => {
      const result = validateDate('25/12/2023');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Date must be in YYYY-MM-DD format');
    });

    test('should reject future dates when allowFuture is false', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const result = validateDate(futureDateString, { allowFuture: false });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Date cannot be in the future');
    });

    test('should allow future dates when allowFuture is true', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const result = validateDate(futureDateString, { allowFuture: true });
      expect(result.isValid).toBe(true);
    });

    test('should respect min/max date constraints', () => {
      const minDate = new Date('2023-01-01');
      const maxDate = new Date('2023-12-31');

      const tooEarly = validateDate('2022-12-31', { minDate });
      expect(tooEarly.isValid).toBe(false);
      expect(tooEarly.error).toContain('Date must be after');

      const tooLate = validateDate('2024-01-01', { maxDate });
      expect(tooLate.isValid).toBe(false);
      expect(tooLate.error).toContain('Date must be before');
    });

    test('should handle empty values', () => {
      const result = validateDate('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Date is required');
    });
  });

  describe('validateUuid', () => {
    test('should validate correct UUID v4 format', () => {
      const validUuid = '123e4567-e89b-42d3-a456-426614174000';
      const result = validateUuid(validUuid);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(validUuid);
    });

    test('should reject invalid UUID formats', () => {
      const result = validateUuid('not-a-uuid');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid UUID format');
    });

    test('should handle required vs optional UUIDs', () => {
      const requiredEmpty = validateUuid('', { required: true });
      expect(requiredEmpty.isValid).toBe(false);
      expect(requiredEmpty.error).toBe('UUID is required');

      const optionalEmpty = validateUuid('', { required: false });
      expect(optionalEmpty.isValid).toBe(true);
    });
  });

  describe('validateText', () => {
    test('should validate normal text', () => {
      const result = validateText('Hello, World!');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('Hello, World!');
    });

    test('should respect length constraints', () => {
      const tooShort = validateText('Hi', { minLength: 5 });
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.error).toBe('Text must be at least 5 characters long');

      const tooLong = validateText('Very long text', { maxLength: 5 });
      expect(tooLong.isValid).toBe(false);
      expect(tooLong.error).toBe('Text must be at most 5 characters long');
    });

    test('should handle whitespace-only text', () => {
      const whitespaceAllowed = validateText('   ', { allowWhitespaceOnly: true });
      expect(whitespaceAllowed.isValid).toBe(true);

      const whitespaceRejected = validateText('   ', { allowWhitespaceOnly: false });
      expect(whitespaceRejected.isValid).toBe(false);
      expect(whitespaceRejected.error).toBe('Text cannot be only whitespace');
    });

    test('should validate against patterns', () => {
      const pattern = /^[A-Z][a-z]+$/;
      const validPattern = validateText('Hello', { pattern });
      expect(validPattern.isValid).toBe(true);

      const invalidPattern = validateText('hello', { pattern });
      expect(invalidPattern.isValid).toBe(false);
      expect(invalidPattern.error).toBe('Text format is invalid');
    });

    test('should sanitize HTML when enabled', () => {
      const result = validateText('<script>alert("xss")</script>', { sanitize: true });
      expect(result.isValid).toBe(true);
      expect(result.value).toContain('&lt;script&gt;');
    });
  });

  describe('validateEmail', () => {
    test('should validate correct email addresses', () => {
      const result = validateEmail('user@example.com');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('user@example.com');
    });

    test('should reject invalid email formats', () => {
      const result = validateEmail('not-an-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Text format is invalid');
    });

    test('should handle empty emails based on required option', () => {
      const requiredEmpty = validateEmail('', { required: true });
      expect(requiredEmpty.isValid).toBe(false);

      const optionalEmpty = validateEmail('', { required: false });
      expect(optionalEmpty.isValid).toBe(true);
    });
  });

  describe('validateColor', () => {
    test('should validate hex color codes', () => {
      const longForm = validateColor('#FF0000');
      expect(longForm.isValid).toBe(true);
      expect(longForm.value).toBe('#ff0000');

      const shortForm = validateColor('#F00');
      expect(shortForm.isValid).toBe(true);
      expect(shortForm.value).toBe('#ff0000');
    });

    test('should add # prefix if missing', () => {
      const result = validateColor('FF0000');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('#ff0000');
    });

    test('should reject invalid color formats', () => {
      const result = validateColor('not-a-color');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Color must be a valid hex code');
    });
  });

  describe('business rule validators', () => {
    describe('validateExpenseAmount', () => {
      test('should validate positive expense amounts', () => {
        const result = validateExpenseAmount(25.50);
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(25.50);
      });

      test('should reject zero and negative amounts', () => {
        const zero = validateExpenseAmount(0);
        expect(zero.isValid).toBe(false);

        const negative = validateExpenseAmount(-10);
        expect(negative.isValid).toBe(false);
      });

      test('should reject amounts that are too large', () => {
        const result = validateExpenseAmount(10000000);
        expect(result.isValid).toBe(false);
      });
    });

    describe('validateExpenseDescription', () => {
      test('should validate non-empty descriptions', () => {
        const result = validateExpenseDescription('Coffee');
        expect(result.isValid).toBe(true);
      });

      test('should reject empty descriptions', () => {
        const result = validateExpenseDescription('');
        expect(result.isValid).toBe(false);
      });

      test('should reject whitespace-only descriptions', () => {
        const result = validateExpenseDescription('   ');
        expect(result.isValid).toBe(false);
      });

      test('should reject descriptions that are too long', () => {
        const longDesc = 'a'.repeat(256);
        const result = validateExpenseDescription(longDesc);
        expect(result.isValid).toBe(false);
      });
    });

    describe('validateExpenseDate', () => {
      test('should validate past dates', () => {
        const result = validateExpenseDate('2023-01-01');
        expect(result.isValid).toBe(true);
      });

      test('should reject future dates', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const futureDateString = futureDate.toISOString().split('T')[0];

        const result = validateExpenseDate(futureDateString);
        expect(result.isValid).toBe(false);
      });
    });

    describe('validateCategoryName', () => {
      test('should validate valid category names', () => {
        const result = validateCategoryName('Food');
        expect(result.isValid).toBe(true);
      });

      test('should reject empty category names', () => {
        const result = validateCategoryName('');
        expect(result.isValid).toBe(false);
      });

      test('should reject names that are too long', () => {
        const longName = 'a'.repeat(51);
        const result = validateCategoryName(longName);
        expect(result.isValid).toBe(false);
      });
    });

    describe('validateBudgetPeriod', () => {
      test('should validate valid periods', () => {
        expect(validateBudgetPeriod('weekly').isValid).toBe(true);
        expect(validateBudgetPeriod('monthly').isValid).toBe(true);
        expect(validateBudgetPeriod('yearly').isValid).toBe(true);
        expect(validateBudgetPeriod('MONTHLY').isValid).toBe(true); // case insensitive
      });

      test('should reject invalid periods', () => {
        const result = validateBudgetPeriod('daily');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Budget period must be weekly, monthly, or yearly');
      });
    });
  });

  describe('validateObject', () => {
    test('should validate object with multiple rules', () => {
      const data = {
        name: 'John',
        age: 25,
        email: 'john@example.com'
      };

      const rules = {
        name: (value) => validateText(value, { minLength: 2 }),
        age: (value) => validateNumber(value, { min: 0, max: 120 }),
        email: (value) => validateEmail(value)
      };

      const result = validateObject(data, rules);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.values.name).toBe('John');
      expect(result.values.age).toBe(25);
    });

    test('should collect all validation errors', () => {
      const data = {
        name: '',
        age: -5,
        email: 'invalid-email'
      };

      const rules = {
        name: (value) => validateText(value, { minLength: 2 }),
        age: (value) => validateNumber(value, { min: 0, max: 120 }),
        email: (value) => validateEmail(value)
      };

      const result = validateObject(data, rules);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
      expect(result.errors.name).toContain('required');
      expect(result.errors.age).toContain('at least 0');
      expect(result.errors.email).toContain('format');
    });
  });

  describe('createArrayValidator', () => {
    test('should validate arrays of items', () => {
      const numberValidator = createArrayValidator(
        (value) => validateNumber(value, { min: 0 }),
        { minItems: 1, maxItems: 5 }
      );

      const validArray = numberValidator([1, 2, 3]);
      expect(validArray.isValid).toBe(true);
      expect(validArray.value).toEqual([1, 2, 3]);
    });

    test('should respect array length constraints', () => {
      const validator = createArrayValidator(
        (value) => validateText(value),
        { minItems: 2, maxItems: 3 }
      );

      const tooFew = validator(['one']);
      expect(tooFew.isValid).toBe(false);
      expect(tooFew.error).toBe('Array must have at least 2 items');

      const tooMany = validator(['one', 'two', 'three', 'four']);
      expect(tooMany.isValid).toBe(false);
      expect(tooMany.error).toBe('Array must have at most 3 items');
    });

    test('should collect item validation errors', () => {
      const numberValidator = createArrayValidator(
        (value) => validateNumber(value, { min: 0 })
      );

      const result = numberValidator([1, -2, 3, 'invalid']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('throwIfInvalid', () => {
    test('should throw ValidationError for invalid results', () => {
      const invalidResult = { isValid: false, error: 'Test error' };
      
      expect(() => {
        throwIfInvalid(invalidResult, 'Test context');
      }).toThrow(ValidationError);

      expect(() => {
        throwIfInvalid(invalidResult, 'Test context');
      }).toThrow('Test context: Test error');
    });

    test('should not throw for valid results', () => {
      const validResult = { isValid: true, value: 'test' };
      
      expect(() => {
        throwIfInvalid(validResult);
      }).not.toThrow();
    });
  });

  describe('checkDataIntegrity', () => {
    test('should verify data integrity with correct checksum', () => {
      const data = { id: 1, name: 'test' };
      const checksum = '-8xiyv5'; // This is the expected hash for the sorted JSON
      
      const result = checkDataIntegrity(data, checksum);
      expect(result).toBe(true);
    });

    test('should detect data corruption with incorrect checksum', () => {
      const data = { id: 1, name: 'test' };
      const wrongChecksum = 'wrong';
      
      const result = checkDataIntegrity(data, wrongChecksum);
      expect(result).toBe(false);
    });

    test('should handle invalid data gracefully', () => {
      const circularData = {};
      circularData.self = circularData;
      
      const result = checkDataIntegrity(circularData, 'any');
      expect(result).toBe(false);
    });
  });
});