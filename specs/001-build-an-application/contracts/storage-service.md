# Storage Service Contract

**Interface**: StorageService  
**Purpose**: Abstract data persistence layer for expense tracking  
**Implementation**: localStorage-based storage

## Interface Definition

### Core Methods

```javascript
class StorageService {
  // Expense Management
  async createExpense(expense: Expense): Promise<Expense>
  async getExpense(id: string): Promise<Expense | null>
  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense>
  async deleteExpense(id: string): Promise<boolean>
  async listExpenses(filters?: ExpenseFilters): Promise<Expense[]>
  
  // Category Management
  async createCategory(category: Category): Promise<Category>
  async getCategory(id: string): Promise<Category | null>
  async updateCategory(id: string, updates: Partial<Category>): Promise<Category>
  async deleteCategory(id: string): Promise<boolean>
  async listCategories(): Promise<Category[]>
  
  // Preferences Management
  async getPreferences(): Promise<UserPreferences>
  async updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences>
  
  // Bulk Operations
  async exportData(): Promise<string> // CSV format
  async importData(data: string): Promise<ImportResult>
  async clearAllData(): Promise<boolean>
}
```

### Filter Interface

```javascript
interface ExpenseFilters {
  startDate?: string      // ISO date string
  endDate?: string        // ISO date string
  categoryId?: string     // Category ID filter
  minAmount?: number      // Minimum amount filter
  maxAmount?: number      // Maximum amount filter
  searchText?: string     // Description search
  sortBy?: 'date' | 'amount' | 'description'
  sortOrder?: 'asc' | 'desc'
  limit?: number          // Max results
  offset?: number         // Pagination offset
}
```

### Response Types

```javascript
interface ImportResult {
  success: boolean
  importedCount: number
  errors: string[]
  duplicates: number
}
```

## Behavioral Contracts

### createExpense
- **Input**: Valid Expense object (without id, createdAt, updatedAt)
- **Output**: Complete Expense object with generated fields
- **Errors**: ValidationError if data invalid
- **Side Effects**: Persists to storage, updates cache

### listExpenses  
- **Input**: Optional ExpenseFilters object
- **Output**: Array of Expense objects matching filters
- **Behavior**: Returns empty array if no matches
- **Performance**: <50ms for <1000 records, pagination for larger sets

### updateExpense
- **Input**: Valid expense ID and partial update object
- **Output**: Updated complete Expense object
- **Errors**: NotFoundError if ID doesn't exist, ValidationError if invalid
- **Behavior**: Only updates provided fields, auto-updates updatedAt

### deleteExpense
- **Input**: Valid expense ID
- **Output**: Boolean success indicator
- **Behavior**: Returns false if ID doesn't exist, true if deleted
- **Side Effects**: Removes from storage, invalidates related caches

### exportData
- **Input**: None
- **Output**: CSV string with all expense data
- **Format**: Headers + data rows, RFC 4180 compliant
- **Encoding**: UTF-8 with BOM for Excel compatibility

## Error Handling Contract

### Error Types
```javascript
class ValidationError extends Error {
  constructor(field: string, message: string)
}

class NotFoundError extends Error {
  constructor(entityType: string, id: string)
}

class StorageError extends Error {
  constructor(operation: string, cause: Error)
}
```

### Error Responses
- All methods throw typed errors for failure conditions
- Async methods never return undefined/null for errors
- Error messages are user-friendly and actionable
- Stack traces preserved for debugging

## Performance Contracts

### Response Time Targets
- Single record operations: <10ms
- List operations: <50ms (up to 1000 records)
- Bulk operations: <500ms (up to 10000 records)
- Export operations: <2s (any dataset size)

### Memory Usage
- Maximum 50MB RAM for 10,000 expense records
- Efficient JSON parsing without full dataset loading
- Lazy loading for large result sets

## Data Integrity Contracts

### Validation Rules
- All data validated before persistence
- Foreign key constraints enforced (categoryId references)
- Duplicate prevention based on business rules
- Automatic data type coercion where safe

### Transaction Behavior
- Operations are atomic (success or complete rollback)
- No partial state persisted on validation failure
- Concurrent access protection via operation queuing

## Testing Contract

### Mock Implementation
```javascript
class MockStorageService extends StorageService {
  // In-memory implementation for testing
  // Identical interface behavior
  // Deterministic data generation
  // Performance simulation modes
}
```

### Test Data Contracts
- Fixtures for common expense scenarios
- Edge case data sets (empty, large, invalid)
- Performance test data generators
- Migration test scenarios

This contract ensures consistent behavior across all storage implementations and provides clear expectations for dependent components.