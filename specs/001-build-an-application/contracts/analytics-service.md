# Analytics Service Contract

**Interface**: AnalyticsService  
**Purpose**: Calculate and provide expense analytics and insights  
**Dependencies**: StorageService for data access

## Interface Definition

### Core Methods

```javascript
class AnalyticsService {
  // Summary Analytics
  async getTotalSpending(period: TimePeriod): Promise<number>
  async getSpendingByCategory(period: TimePeriod): Promise<CategoryBreakdown[]>
  async getSpendingTrends(period: TimePeriod): Promise<TrendData[]>
  async getAverageSpending(period: TimePeriod): Promise<AverageSpending>
  
  // Comparative Analytics
  async getMonthlyComparison(months: number): Promise<MonthlyComparison[]>
  async getCategoryTrends(categoryId: string, months: number): Promise<TrendData[]>
  async getSpendingGrowth(period: TimePeriod): Promise<GrowthData>
  
  // Insights & Recommendations
  async getSpendingInsights(period: TimePeriod): Promise<Insight[]>
  async getBudgetRecommendations(): Promise<BudgetRecommendation[]>
  async getUnusualSpending(period: TimePeriod): Promise<UnusualExpense[]>
}
```

### Type Definitions

```javascript
interface TimePeriod {
  type: 'week' | 'month' | 'quarter' | 'year' | 'custom'
  start?: string  // ISO date for custom periods
  end?: string    // ISO date for custom periods
  value?: string  // Period identifier (e.g., '2025-09' for month)
}

interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  categoryColor: string
  amount: number
  percentage: number
  expenseCount: number
  averageExpense: number
}

interface TrendData {
  period: string      // Period identifier
  amount: number      // Total spending
  expenseCount: number
  date: string        // ISO date
}

interface AverageSpending {
  daily: number
  weekly: number
  monthly: number
  perExpense: number
}

interface MonthlyComparison {
  month: string       // YYYY-MM format
  amount: number
  change: number      // Percentage change from previous
  changeAmount: number // Absolute change from previous
}

interface GrowthData {
  currentPeriod: number
  previousPeriod: number
  growthRate: number    // Percentage
  growthAmount: number  // Absolute change
}

interface Insight {
  type: 'warning' | 'info' | 'success'
  title: string
  description: string
  actionable: boolean
  suggestion?: string
}

interface BudgetRecommendation {
  categoryId: string
  categoryName: string
  currentSpending: number
  suggestedBudget: number
  reasoning: string
}

interface UnusualExpense {
  expense: Expense
  reason: string
  severity: 'low' | 'medium' | 'high'
}
```

## Behavioral Contracts

### getTotalSpending
- **Input**: Valid TimePeriod specification
- **Output**: Total spending amount for the period
- **Behavior**: Returns 0 for periods with no expenses
- **Performance**: <100ms for any period length

### getSpendingByCategory
- **Input**: Valid TimePeriod specification  
- **Output**: Array of CategoryBreakdown objects sorted by amount (desc)
- **Behavior**: Includes all categories with expenses in period
- **Calculation**: Percentages sum to 100%, amounts are exact

### getSpendingTrends
- **Input**: Valid TimePeriod specification
- **Output**: Array of TrendData objects in chronological order
- **Granularity**: Daily for weeks, weekly for months, monthly for years
- **Behavior**: Fills gaps with zero values for continuous trends

### getSpendingInsights
- **Input**: Valid TimePeriod specification
- **Output**: Array of actionable insights based on spending patterns
- **Logic**: Detects overspending, unusual patterns, savings opportunities
- **Limit**: Maximum 5 insights per request, prioritized by importance

## Calculation Contracts

### Accuracy Requirements
- All monetary calculations use precise decimal arithmetic
- Percentages rounded to 2 decimal places
- Growth rates calculated using standard formulas
- No floating-point precision errors in summations

### Aggregation Rules
- Expenses filtered by date range (inclusive)
- Categories include both active and deleted (for historical accuracy)
- Deleted expenses excluded from all calculations
- Currency conversions not supported (single currency assumption)

### Caching Strategy
```javascript
interface CachePolicy {
  duration: number        // Cache TTL in milliseconds
  invalidateOnDataChange: boolean
  computeInBackground: boolean
}

// Cache policies by operation
const cachePolicies = {
  totalSpending: { duration: 5 * 60 * 1000, invalidateOnDataChange: true },
  categoryBreakdown: { duration: 10 * 60 * 1000, invalidateOnDataChange: true },
  trends: { duration: 30 * 60 * 1000, invalidateOnDataChange: false },
  insights: { duration: 60 * 60 * 1000, invalidateOnDataChange: true }
}
```

## Performance Contracts

### Response Time Targets
- Simple aggregations (totals, averages): <50ms
- Category breakdowns: <100ms  
- Trend calculations: <200ms
- Complex insights: <500ms

### Memory Efficiency
- Streaming calculations for large datasets
- Incremental computation where possible
- Memory usage scales linearly with active period data
- Maximum 20MB for analytics computations

### Computation Optimization
- Pre-computed summaries for common periods
- Incremental updates for real-time analytics
- Background computation for expensive operations
- Lazy loading of detailed trend data

## Error Handling Contract

### Error Types
```javascript
class AnalyticsError extends Error {
  constructor(operation: string, cause: Error)
}

class InvalidPeriodError extends Error {
  constructor(period: TimePeriod, reason: string)
}

class InsufficientDataError extends Error {
  constructor(operation: string, minRequired: number)
}
```

### Graceful Degradation
- Return partial results when some data unavailable
- Provide alternative insights when primary calculation fails
- Clear error messages for user-facing operations
- Fallback to simpler calculations when complex ones fail

## Data Dependency Contract

### StorageService Integration
- Read-only access to expense and category data
- No direct storage modifications
- Efficient bulk data retrieval for calculations
- Change notification subscription for cache invalidation

### External Dependencies
- Chart.js integration for visualization data format
- Date manipulation utilities for period calculations
- Mathematical utilities for statistical operations

## Testing Contract

### Mock Data Requirements
- Representative datasets for accurate testing
- Edge cases: empty periods, single expenses, large datasets
- Performance test data generators
- Realistic spending patterns for insight validation

### Accuracy Validation
- Reference calculations for automated testing
- Precision verification for monetary operations
- Percentage calculation accuracy checks
- Trend calculation correctness validation

This contract ensures reliable and performant analytics capabilities while maintaining clear separation of concerns from data storage.