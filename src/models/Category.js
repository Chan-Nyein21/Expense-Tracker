/**
 * Category Model
 * Purpose: Core domain model for expense categories with validation and business logic
 * Constitutional Requirements: Input validation, error handling, data integrity
 */

/**
 * Category class representing an expense category
 */
export class Category {
  /**
   * Create a new category
   * @param {Object} data - Category data
   * @param {string} data.name - Category name (required)
   * @param {string} data.color - Hex color code (required, format: #RRGGBB)
   * @param {string} data.icon - Material icon name (required)
   * @param {boolean} [data.isDefault=false] - Whether this is a default category
   * @param {string} [data.id] - Unique identifier (auto-generated if not provided)
   * @param {string} [data.createdAt] - Creation timestamp (auto-generated if not provided)
   * @param {string} [data.updatedAt] - Update timestamp (auto-generated if not provided)
   */
  constructor(data) {
    this.validate(data);
    
    this.id = data.id || this.generateId();
    this.name = data.name.trim();
    this.color = data.color.toUpperCase();
    this.icon = data.icon.trim();
    this.isDefault = Boolean(data.isDefault);
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Validate category data
   * @param {Object} data - Data to validate
   * @throws {Error} If validation fails
   */
  validate(data) {
    const errors = [];

    // Name validation
    if (!data.name) {
      errors.push('Name is required');
    } else if (typeof data.name !== 'string') {
      errors.push('Name must be a string');
    } else if (data.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    } else if (data.name.length > 50) {
      errors.push('Name cannot exceed 50 characters');
    }

    // Color validation
    if (!data.color) {
      errors.push('Color is required');
    } else if (typeof data.color !== 'string') {
      errors.push('Color must be a string');
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      errors.push('Color must be a valid hex code (#RRGGBB)');
    }

    // Icon validation
    if (!data.icon) {
      errors.push('Icon is required');
    } else if (typeof data.icon !== 'string') {
      errors.push('Icon must be a string');
    } else if (data.icon.trim().length === 0) {
      errors.push('Icon cannot be empty');
    } else if (data.icon.length > 30) {
      errors.push('Icon name cannot exceed 30 characters');
    }

    // isDefault validation (optional, but must be boolean if provided)
    if (data.isDefault !== undefined && typeof data.isDefault !== 'boolean') {
      errors.push('isDefault must be a boolean');
    }

    if (errors.length > 0) {
      throw new Error(`Category validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Generate a unique ID for the category
   * @returns {string} Unique identifier
   */
  generateId() {
    return `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update category data
   * @param {Object} updates - Data to update
   * @returns {Category} Updated category instance
   */
  update(updates) {
    const updatedData = {
      ...this.toJSON(),
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.validate(updatedData);
    
    this.name = updatedData.name.trim();
    this.color = updatedData.color.toUpperCase();
    this.icon = updatedData.icon.trim();
    this.isDefault = Boolean(updatedData.isDefault);
    this.updatedAt = updatedData.updatedAt;
    
    return this;
  }

  /**
   * Create a copy of the category
   * @returns {Category} New category instance
   */
  clone() {
    return new Category(this.toJSON());
  }

  /**
   * Convert category to JSON object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      icon: this.icon,
      isDefault: this.isDefault,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create category from JSON object
   * @param {Object} json - Plain object
   * @returns {Category} New category instance
   */
  static fromJSON(json) {
    return new Category(json);
  }

  /**
   * Check if this category equals another category
   * @param {Category} other - Other category to compare
   * @returns {boolean} True if categories are equal
   */
  equals(other) {
    return (
      other instanceof Category &&
      this.id === other.id &&
      this.name === other.name &&
      this.color === other.color &&
      this.icon === other.icon &&
      this.isDefault === other.isDefault
    );
  }

  /**
   * Get category summary information
   * @returns {Object} Summary object
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      icon: this.icon,
      isDefault: this.isDefault,
      displayName: this.getDisplayName()
    };
  }

  /**
   * Get display name for the category
   * @returns {string} Formatted display name
   */
  getDisplayName() {
    return this.name;
  }

  /**
   * Check if color is light or dark (for text contrast)
   * @returns {boolean} True if color is light
   */
  isLightColor() {
    const hex = this.color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }

  /**
   * Get appropriate text color for this category background
   * @returns {string} Hex color code for text
   */
  getTextColor() {
    return this.isLightColor() ? '#000000' : '#FFFFFF';
  }

  /**
   * Get CSS style object for this category
   * @returns {Object} CSS style properties
   */
  getStyleObject() {
    return {
      backgroundColor: this.color,
      color: this.getTextColor(),
      borderColor: this.color
    };
  }

  /**
   * Validate multiple categories
   * @param {Array} categories - Array of category data
   * @returns {Object} Validation result
   */
  static validateBatch(categories) {
    const results = {
      valid: [],
      invalid: [],
      duplicateNames: []
    };

    const names = new Set();
    
    categories.forEach((categoryData, index) => {
      try {
        new Category(categoryData);
        
        // Check for duplicate names
        const name = categoryData.name.trim().toLowerCase();
        if (names.has(name)) {
          results.duplicateNames.push({ 
            index, 
            data: categoryData, 
            error: 'Duplicate category name' 
          });
        } else {
          names.add(name);
          results.valid.push({ index, data: categoryData });
        }
      } catch (error) {
        results.invalid.push({ 
          index, 
          data: categoryData, 
          error: error.message 
        });
      }
    });

    return results;
  }

  /**
   * Create multiple categories from array
   * @param {Array} categoriesData - Array of category data
   * @returns {Array<Category>} Array of category instances
   */
  static createBatch(categoriesData) {
    return categoriesData.map(data => new Category(data));
  }

  /**
   * Get default categories for new installations
   * @returns {Array<Category>} Array of default categories
   */
  static getDefaultCategories() {
    return [
      {
        id: 'cat-food',
        name: 'Food & Dining',
        color: '#FF6B6B',
        icon: 'restaurant',
        isDefault: true
      },
      {
        id: 'cat-transportation',
        name: 'Transportation',
        color: '#4ECDC4',
        icon: 'directions_car',
        isDefault: true
      },
      {
        id: 'cat-utilities',
        name: 'Bills & Utilities',
        color: '#45B7D1',
        icon: 'receipt_long',
        isDefault: true
      },
      {
        id: 'cat-entertainment',
        name: 'Entertainment',
        color: '#96CEB4',
        icon: 'movie',
        isDefault: true
      },
      {
        id: 'cat-shopping',
        name: 'Shopping',
        color: '#FFEAA7',
        icon: 'shopping_bag',
        isDefault: true
      },
      {
        id: 'cat-health',
        name: 'Healthcare',
        color: '#DDA0DD',
        icon: 'local_hospital',
        isDefault: true
      },
      {
        id: 'cat-education',
        name: 'Education',
        color: '#74B9FF',
        icon: 'school',
        isDefault: true
      },
      {
        id: 'cat-other',
        name: 'Other',
        color: '#636E72',
        icon: 'category',
        isDefault: true
      }
    ].map(data => new Category(data));
  }

  /**
   * Check if a name is unique among given categories
   * @param {string} name - Name to check
   * @param {Array<Category>} categories - Existing categories
   * @param {string} [excludeId] - Category ID to exclude from check
   * @returns {boolean} True if name is unique
   */
  static isNameUnique(name, categories, excludeId = null) {
    const normalizedName = name.trim().toLowerCase();
    return !categories.some(category => 
      category.id !== excludeId && 
      category.name.toLowerCase() === normalizedName
    );
  }

  /**
   * Sort categories by name
   * @param {Array<Category>} categories - Categories to sort
   * @param {string} [order='asc'] - Sort order (asc/desc)
   * @returns {Array<Category>} Sorted categories
   */
  static sortByName(categories, order = 'asc') {
    return [...categories].sort((a, b) => {
      const result = a.name.localeCompare(b.name);
      return order === 'desc' ? -result : result;
    });
  }

  /**
   * Sort categories with defaults first
   * @param {Array<Category>} categories - Categories to sort
   * @returns {Array<Category>} Sorted categories
   */
  static sortWithDefaultsFirst(categories) {
    return [...categories].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Get categories by color similarity
   * @param {string} targetColor - Target color to match
   * @param {Array<Category>} categories - Categories to search
   * @param {number} [threshold=50] - Color difference threshold
   * @returns {Array<Category>} Similar categories
   */
  static getBySimilarColor(targetColor, categories, threshold = 50) {
    const targetRgb = Category.hexToRgb(targetColor);
    
    return categories.filter(category => {
      const categoryRgb = Category.hexToRgb(category.color);
      const difference = Category.colorDifference(targetRgb, categoryRgb);
      return difference <= threshold;
    });
  }

  /**
   * Convert hex color to RGB
   * @param {string} hex - Hex color code
   * @returns {Object} RGB values
   */
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Calculate color difference between two RGB colors
   * @param {Object} rgb1 - First RGB color
   * @param {Object} rgb2 - Second RGB color
   * @returns {number} Color difference
   */
  static colorDifference(rgb1, rgb2) {
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  }
}

export default Category;