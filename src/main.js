/**
 * Main Entry Point for Expense Tracker Application
 * Purpose: Initialize and bootstrap the application
 */

// Import styles first
import './styles/main.css';

/**
 * Simple Application class to test basic functionality
 */
class ExpenseTrackerApp {
  constructor() {
    console.log('ExpenseTrackerApp constructor called');
    this.container = document.getElementById('app');
    
    if (!this.container) {
      console.error('App container not found!');
      return;
    }
    
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('Initializing app...');
      
      // Clear loading state
      this.container.innerHTML = '';
      
      // Create basic app structure first
      this.createBasicStructure();
      
      console.log('Basic structure created');
      
      // For now, just show a simple form without ExpenseForm component
      this.createSimpleForm();
      
      console.log('App initialized successfully without ExpenseForm');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to load application: ' + error.message);
    }
  }

  /**
   * Create basic app structure
   */
  createBasicStructure() {
    this.container.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1 class="app-title">💰 Expense Tracker</h1>
          <p class="app-subtitle">Track your expenses easily</p>
        </header>
        
        <main class="app-main">
          <section class="expense-form-section">
            <h2>Add Expense</h2>
            <div id="expense-form-container">
              <!-- Form will be added here -->
            </div>
          </section>
          
          <section class="expense-list-section">
            <h2>Recent Expenses</h2>
            <div id="expense-list-container">
              <p class="no-expenses">No expenses yet. Add your first expense above!</p>
            </div>
          </section>
        </main>
      </div>
    `;
  }

  /**
   * Create a simple HTML form for testing
   */
  createSimpleForm() {
    const formContainer = document.getElementById('expense-form-container');
    
    formContainer.innerHTML = `
      <form class="simple-expense-form" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label for="amount">Amount *</label>
          <input type="number" id="amount" name="amount" step="0.01" min="0" required placeholder="0.00">
        </div>
        
        <div class="form-group">
          <label for="description">Description *</label>
          <input type="text" id="description" name="description" required placeholder="What did you spend on?">
        </div>
        
        <div class="form-group">
          <label for="date">Date *</label>
          <input type="date" id="date" name="date" required>
        </div>
        
        <div class="form-group">
          <label for="category">Category *</label>
          <select id="category" name="category" required>
            <option value="">Select a category</option>
            <option value="food">🍕 Food</option>
            <option value="transport">🚗 Transport</option>
            <option value="shopping">🛒 Shopping</option>
            <option value="entertainment">🎬 Entertainment</option>
          </select>
        </div>
        
        <div class="form-actions" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Expense</button>
        </div>
      </form>
    `;
    
    // Set default date to today
    const dateInput = formContainer.querySelector('#date');
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Add form event listener
    const form = formContainer.querySelector('form');
    form.addEventListener('submit', this.handleSimpleFormSubmit.bind(this));
  }

  /**
   * Handle simple form submission
   */
  handleSimpleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const expenseData = {
      amount: formData.get('amount'),
      description: formData.get('description'),
      date: formData.get('date'),
      category: formData.get('category')
    };
    
    console.log('Simple form submitted:', expenseData);
    
    // Basic validation
    if (!expenseData.amount || !expenseData.description || !expenseData.date || !expenseData.category) {
      alert('Please fill in all required fields');
      return;
    }
    
    this.showSuccess('Expense added successfully!');
    this.updateExpenseList(expenseData);
    
    // Clear form
    event.target.reset();
    event.target.querySelector('#date').value = new Date().toISOString().split('T')[0];
  }

  /**
   * Update the expense list
   */
  updateExpenseList(expenseData) {
    const listContainer = document.getElementById('expense-list-container');
    const noExpensesMsg = listContainer.querySelector('.no-expenses');
    
    if (noExpensesMsg) {
      noExpensesMsg.remove();
    }

    const expenseItem = document.createElement('div');
    expenseItem.className = 'expense-item';
    expenseItem.innerHTML = `
      <div class="expense-info">
        <span class="expense-description">${expenseData.description}</span>
        <span class="expense-date">${expenseData.date}</span>
        <span class="expense-category" style="font-size: 0.8rem; color: #666;">${expenseData.category}</span>
      </div>
      <span class="expense-amount">$${parseFloat(expenseData.amount).toFixed(2)}</span>
    `;

    listContainer.insertBefore(expenseItem, listContainer.firstChild);
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #38a169;
      color: white;
      padding: 1rem;
      border-radius: 6px;
      z-index: 1000;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * Show error message
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="error-container">
        <h2>⚠️ Error</h2>
        <p>${message}</p>
        <button onclick="location.reload()">Reload App</button>
      </div>
    `;
  }
}

// Initialize the application when DOM is ready
console.log('main.js loaded, document ready state:', document.readyState);

if (document.readyState === 'loading') {
  console.log('Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired, creating app...');
    new ExpenseTrackerApp();
  });
} else {
  console.log('DOM already ready, creating app immediately...');
  new ExpenseTrackerApp();
}

// Export for potential testing
export { ExpenseTrackerApp };