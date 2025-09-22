# UI Component Contract

**Interface**: UI Components  
**Purpose**: Define contracts for reusable UI components  
**Framework**: Vanilla JavaScript with CSS modules

## Base Component Contract

### Core Interface

```javascript
class Component {
  constructor(element: HTMLElement, options?: ComponentOptions)
  
  // Lifecycle Methods
  render(): void
  destroy(): void
  update(data?: any): void
  
  // Event Handling
  addEventListener(event: string, handler: Function): void
  removeEventListener(event: string, handler: Function): void
  dispatchEvent(event: string, data?: any): void
  
  // State Management
  setState(newState: Partial<ComponentState>): void
  getState(): ComponentState
  
  // DOM Management
  getElement(): HTMLElement
  hide(): void
  show(): void
  toggle(): void
}

interface ComponentOptions {
  data?: any
  events?: Record<string, Function>
  className?: string
  attributes?: Record<string, string>
}

interface ComponentState {
  visible: boolean
  disabled: boolean
  data: any
}
```

## Specific Component Contracts

### ExpenseForm Component

```javascript
class ExpenseForm extends Component {
  // Form Management
  getFormData(): ExpenseFormData
  setFormData(data: Partial<ExpenseFormData>): void
  validateForm(): ValidationResult
  resetForm(): void
  
  // Form Events
  onSubmit: (data: ExpenseFormData) => void
  onCancel: () => void
  onChange: (field: string, value: any) => void
  onValidation: (result: ValidationResult) => void
}

interface ExpenseFormData {
  amount: string
  description: string
  date: string
  categoryId: string
}

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}
```

### ExpenseList Component

```javascript
class ExpenseList extends Component {
  // Data Management
  setExpenses(expenses: Expense[]): void
  addExpense(expense: Expense): void
  updateExpense(id: string, expense: Expense): void
  removeExpense(id: string): void
  
  // Filtering & Sorting
  setFilters(filters: ExpenseFilters): void
  setSorting(field: string, direction: 'asc' | 'desc'): void
  
  // Selection Management
  selectExpense(id: string): void
  getSelectedExpenses(): string[]
  clearSelection(): void
  
  // List Events
  onExpenseClick: (expense: Expense) => void
  onExpenseEdit: (expense: Expense) => void
  onExpenseDelete: (expense: Expense) => void
  onSelectionChange: (selectedIds: string[]) => void
}
```

### ExpenseFilter Component

```javascript
class ExpenseFilter extends Component {
  // Filter Management
  getFilters(): ExpenseFilters
  setFilters(filters: Partial<ExpenseFilters>): void
  resetFilters(): void
  
  // Quick Filters
  setDateRange(start: string, end: string): void
  setCategory(categoryId: string): void
  setAmountRange(min: number, max: number): void
  
  // Filter Events
  onFilterChange: (filters: ExpenseFilters) => void
  onReset: () => void
}
```

### CategoryManager Component

```javascript
class CategoryManager extends Component {
  // Category Management
  setCategories(categories: Category[]): void
  addCategory(category: Category): void
  updateCategory(id: string, category: Category): void
  removeCategory(id: string): void
  
  // Category Events
  onCategoryCreate: (category: CategoryFormData) => void
  onCategoryUpdate: (id: string, category: CategoryFormData) => void
  onCategoryDelete: (id: string) => void
  onCategorySelect: (category: Category) => void
}

interface CategoryFormData {
  name: string
  color: string
  icon: string
}
```

### Chart Component

```javascript
class Chart extends Component {
  // Chart Management
  setData(data: ChartData): void
  updateData(data: Partial<ChartData>): void
  setType(type: ChartType): void
  resize(): void
  
  // Interaction
  onDataPointClick: (dataPoint: DataPoint) => void
  onLegendClick: (legendItem: LegendItem) => void
}

interface ChartData {
  labels: string[]
  datasets: Dataset[]
}

interface Dataset {
  label: string
  data: number[]
  backgroundColor?: string[]
  borderColor?: string[]
}

type ChartType = 'pie' | 'line' | 'bar' | 'doughnut'
```

## Behavioral Contracts

### Component Lifecycle
1. **Construction**: Initialize DOM element and options
2. **Render**: Create/update DOM structure and bind events
3. **Update**: Refresh component with new data
4. **Destroy**: Clean up event listeners and DOM references

### Event System
- All components must implement event delegation
- Custom events bubble up to parent components
- Event naming convention: `component:action` (e.g., `expense:edit`)
- Event data passed as detail property

### State Management
- Component state is immutable (new state objects)
- State changes trigger automatic re-rendering
- State updates are batched for performance
- Parent components can observe child state changes

### Error Handling
```javascript
interface ComponentError {
  component: string
  operation: string
  message: string
  recoverable: boolean
}

// Error Events
onError: (error: ComponentError) => void
```

## Styling Contracts

### CSS Class Conventions
```css
.component-name { }           /* Component root */
.component-name__element { }   /* BEM element */
.component-name--modifier { } /* BEM modifier */
.component-name.is-state { }  /* State classes */
```

### Theme Support
```javascript
interface ThemeTokens {
  colors: Record<string, string>
  spacing: Record<string, string>
  typography: Record<string, string>
  breakpoints: Record<string, string>
}
```

### Responsive Behavior
- Mobile-first design approach
- Breakpoints: 768px (tablet), 1024px (desktop)
- Touch-friendly controls on mobile
- Keyboard navigation support

## Accessibility Contracts

### ARIA Requirements
- All interactive elements have appropriate ARIA labels
- Form validation errors announced to screen readers
- Dynamic content updates use ARIA live regions
- Focus management for modal and overlay components

### Keyboard Navigation
- Tab order follows logical visual flow
- Enter/Space activate buttons and links
- Escape closes modals and dropdowns
- Arrow keys navigate lists and menus

### Screen Reader Support
- Semantic HTML structure
- Descriptive text for icons and images
- Form field associations with labels
- Status updates announced appropriately

## Performance Contracts

### Rendering Performance
- Initial render <50ms for simple components
- Update operations <20ms for data changes
- Virtual scrolling for lists >100 items
- Efficient DOM manipulation (minimal reflows)

### Memory Management
- Event listeners cleaned up on destroy
- Circular references avoided
- Large datasets handled with pagination
- Component instances properly garbage collected

### Bundle Size
- Individual components <5KB minified
- Shared utilities extracted to common modules
- Tree-shaking compatible exports
- CSS modules scoped to components

## Testing Contracts

### Unit Testing
```javascript
// Component test utilities
class ComponentTestHarness {
  mount(component: Component, options?: TestOptions): TestWrapper
  unmount(): void
  trigger(event: string, data?: any): void
  getState(): ComponentState
}
```

### Integration Testing
- Components tested in isolation and combination
- Event flow testing between parent/child components
- Accessibility testing with automated tools
- Visual regression testing for styling changes

This component contract ensures consistent, maintainable, and accessible UI components across the expense tracking application.