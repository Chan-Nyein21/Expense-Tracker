# Data Model: Expense Tracking Application

**Created**: 2025-09-21  
**Feature**: Expense Tracking Application  
**Branch**: 001-build-an-application

## Entity Definitions

### Expense
Primary entity representing a single expense record.

```javascript
{
  id: string,           // UUID v4 identifier
  amount: number,       // Positive decimal value (cents for precision)
  description: string,  // User-provided description (max 200 chars)
  date: string,         // ISO 8601 date string (YYYY-MM-DD)
  categoryId: string,   // Reference to Category entity
  createdAt: string,    // ISO 8601 timestamp
  updatedAt: string     // ISO 8601 timestamp
}
```

**Validation Rules**:
- `id`: Required, unique, UUID format
- `amount`: Required, positive number, max 999999.99
- `description`: Required, non-empty string, max 200 characters
- `date`: Required, valid date, not future dates
- `categoryId`: Required, must reference existing category
- `createdAt`: Required, auto-generated ISO timestamp
- `updatedAt`: Required, auto-updated on changes

### Category
Classification system for organizing expenses.

```javascript
{
  id: string,           // UUID v4 identifier
  name: string,         // Category name (max 50 chars)
  color: string,        // Hex color code for UI display
  icon: string,         // Icon identifier/class name
  isDefault: boolean,   // True for system-provided categories
  createdAt: string,    // ISO 8601 timestamp
  updatedAt: string     // ISO 8601 timestamp
}
```

**Validation Rules**:
- `id`: Required, unique, UUID format
- `name`: Required, unique per user, max 50 characters
- `color`: Required, valid hex color (#RRGGBB format)
- `icon`: Required, valid icon identifier
- `isDefault`: Required, boolean
- `createdAt`: Required, auto-generated ISO timestamp
- `updatedAt`: Required, auto-updated on changes

### UserPreferences
Application settings and user customization.

```javascript
{
  currency: string,          // Currency symbol (default: '$')
  currencyCode: string,      // ISO currency code (default: 'USD')
  dateFormat: string,        // Date display format preference
  theme: string,            // UI theme ('light', 'dark', 'auto')
  defaultCategoryId: string, // Default category for new expenses
  language: string,         // Locale preference (default: 'en')
  createdAt: string,        // ISO 8601 timestamp
  updatedAt: string         // ISO 8601 timestamp
}
```

### ExpenseSummary
Computed aggregations for analytics (cached calculations).

```javascript
{
  period: string,           // Time period ('month', 'year', 'all')
  periodValue: string,      // Specific period (e.g., '2025-09', '2025')
  totalAmount: number,      // Sum of all expenses in period
  expenseCount: number,     // Number of expenses in period
  categoryBreakdown: [{     // Spending by category
    categoryId: string,
    categoryName: string,
    amount: number,
    percentage: number
  }],
  averageDaily: number,     // Average daily spending
  computedAt: string        // ISO 8601 timestamp when calculated
}
```

## Data Relationships

### One-to-Many Relationships
- **Category → Expense**: One category can have many expenses
- **UserPreferences → Category**: Default category reference

### Referential Integrity
- Expenses must reference valid categories
- Default category in preferences must exist
- Cascade behavior: Category deletion moves expenses to "Uncategorized"

## Storage Schema

### localStorage Keys
```javascript
'expenses'        // Array of Expense objects
'categories'      // Array of Category objects  
'preferences'     // UserPreferences object
'summaries'       // Array of cached ExpenseSummary objects
'app_version'     // Schema version for migrations
```

### Data Serialization
- JSON.stringify/parse for object storage
- Date strings in ISO 8601 format for consistency
- Numbers stored as primitives (no BigInt needed)
- UTF-8 encoding for international character support

## Default Data

### Initial Categories
```javascript
[
  { id: 'cat-001', name: 'Food & Dining', color: '#FF6B6B', icon: 'restaurant', isDefault: true },
  { id: 'cat-002', name: 'Transportation', color: '#4ECDC4', icon: 'directions_car', isDefault: true },
  { id: 'cat-003', name: 'Entertainment', color: '#45B7D1', icon: 'movie', isDefault: true },
  { id: 'cat-004', name: 'Utilities', color: '#96CEB4', icon: 'home', isDefault: true },
  { id: 'cat-005', name: 'Shopping', color: '#FFEAA7', icon: 'shopping_bag', isDefault: true },
  { id: 'cat-006', name: 'Health & Medical', color: '#DDA0DD', icon: 'local_hospital', isDefault: true },
  { id: 'cat-007', name: 'Other', color: '#95A5A6', icon: 'category', isDefault: true }
]
```

### Default Preferences
```javascript
{
  currency: '$',
  currencyCode: 'USD',
  dateFormat: 'MM/DD/YYYY',
  theme: 'auto',
  defaultCategoryId: 'cat-007', // Other
  language: 'en'
}
```

## Data Validation Layer

### Input Sanitization
- HTML entity encoding for text inputs
- Number validation with range checks
- Date parsing with format validation
- UUID format verification

### Business Rules
- Expense amount must be positive
- Expense date cannot be in future
- Category names must be unique
- Description cannot be empty or only whitespace
- Maximum 10,000 expense records per user

### Error Handling
- Validation errors return structured error objects
- Data corruption detection with integrity checks
- Automatic data migration for schema updates
- Graceful degradation for invalid data

## Data Migration Strategy

### Version Management
- Schema version stored in localStorage
- Migration functions for each version increment
- Backward compatibility for at least 2 versions
- Data backup before migration execution

### Migration Process
1. Detect schema version mismatch
2. Backup current data to temporary storage
3. Execute migration functions in sequence
4. Validate migrated data integrity
5. Update schema version marker
6. Clean up temporary backup data

This data model provides a solid foundation for the expense tracking application while maintaining simplicity and performance for client-side storage.