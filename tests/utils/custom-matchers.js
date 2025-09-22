/**
 * Custom Jest Matchers for Expense Tracker
 * Purpose: Domain-specific assertions for testing
 */

// Expense validation matchers
expect.extend({
  toBeValidExpense(received) {
    const pass = (
      received &&
      typeof received === 'object' &&
      typeof received.id === 'string' &&
      typeof received.amount === 'number' &&
      received.amount > 0 &&
      typeof received.description === 'string' &&
      received.description.length > 0 &&
      typeof received.date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(received.date) &&
      typeof received.categoryId === 'string' &&
      typeof received.createdAt === 'string' &&
      typeof received.updatedAt === 'string'
    );

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid expense`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid expense`,
        pass: false,
      };
    }
  },

  toHaveValidAmount(received) {
    const pass = (
      received &&
      typeof received.amount === 'number' &&
      received.amount > 0 &&
      Number.isFinite(received.amount)
    );

    return {
      message: () => pass 
        ? `expected ${received.amount} not to be a valid amount`
        : `expected ${received.amount} to be a valid positive number`,
      pass,
    };
  },

  toBeValidCategory(received) {
    const pass = (
      received &&
      typeof received === 'object' &&
      typeof received.id === 'string' &&
      typeof received.name === 'string' &&
      received.name.length > 0 &&
      typeof received.color === 'string' &&
      /^#[0-9A-Fa-f]{6}$/.test(received.color) &&
      typeof received.icon === 'string' &&
      typeof received.isDefault === 'boolean'
    );

    return {
      message: () => pass
        ? `expected ${JSON.stringify(received)} not to be a valid category`
        : `expected ${JSON.stringify(received)} to be a valid category`,
      pass,
    };
  },

  toHaveValidColor(received) {
    const pass = (
      received &&
      typeof received.color === 'string' &&
      /^#[0-9A-Fa-f]{6}$/.test(received.color)
    );

    return {
      message: () => pass
        ? `expected ${received.color} not to be a valid hex color`
        : `expected ${received.color} to be a valid hex color (#RRGGBB)`,
      pass,
    };
  },

  toBeValidDate(received) {
    const pass = (
      typeof received === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(received) &&
      !isNaN(Date.parse(received))
    );

    return {
      message: () => pass
        ? `expected ${received} not to be a valid date`
        : `expected ${received} to be a valid date (YYYY-MM-DD)`,
      pass,
    };
  },

  toBeToday(received) {
    const today = new Date().toISOString().split('T')[0];
    const pass = received === today;

    return {
      message: () => pass
        ? `expected ${received} not to be today's date`
        : `expected ${received} to be today's date (${today})`,
      pass,
    };
  },

  toBeFutureDate(received) {
    const today = new Date().toISOString().split('T')[0];
    const pass = received > today;

    return {
      message: () => pass
        ? `expected ${received} not to be a future date`
        : `expected ${received} to be a future date (after ${today})`,
      pass,
    };
  },

  toBeValidSpendingSummary(received) {
    const pass = (
      received &&
      typeof received === 'object' &&
      typeof received.total === 'number' &&
      received.total >= 0 &&
      typeof received.count === 'number' &&
      received.count >= 0 &&
      typeof received.average === 'number' &&
      received.average >= 0
    );

    return {
      message: () => pass
        ? `expected ${JSON.stringify(received)} not to be a valid spending summary`
        : `expected ${JSON.stringify(received)} to be a valid spending summary`,
      pass,
    };
  },

  toBeValidCategoryAnalysis(received) {
    const pass = (
      Array.isArray(received) &&
      received.every(item => (
        typeof item === 'object' &&
        typeof item.categoryId === 'string' &&
        typeof item.categoryName === 'string' &&
        typeof item.total === 'number' &&
        item.total >= 0 &&
        typeof item.percentage === 'number' &&
        item.percentage >= 0
      ))
    );

    return {
      message: () => pass
        ? `expected array not to be valid category analysis`
        : `expected array to be valid category analysis`,
      pass,
    };
  },

  toBeValidInsight(received) {
    const validTypes = ['high_spending_category', 'savings_opportunity', 'budget_warning', 'unusual_pattern'];
    const validPriorities = ['low', 'medium', 'high'];

    const pass = (
      received &&
      typeof received === 'object' &&
      validTypes.includes(received.type) &&
      typeof received.title === 'string' &&
      received.title.length > 0 &&
      typeof received.description === 'string' &&
      received.description.length > 0 &&
      validPriorities.includes(received.priority) &&
      typeof received.actionable === 'boolean'
    );

    return {
      message: () => pass
        ? `expected ${JSON.stringify(received)} not to be a valid insight`
        : `expected ${JSON.stringify(received)} to be a valid insight`,
      pass,
    };
  },

  toBeValidExportData(received) {
    const pass = (
      received &&
      typeof received === 'object' &&
      typeof received.version === 'string' &&
      received.exportDate instanceof Date &&
      typeof received.totalExpenses === 'number' &&
      typeof received.totalCategories === 'number' &&
      received.data &&
      Array.isArray(received.data.expenses) &&
      Array.isArray(received.data.categories) &&
      typeof received.data.settings === 'object'
    );

    return {
      message: () => pass
        ? `expected object not to be valid export data`
        : `expected object to be valid export data`,
      pass,
    };
  },

  toBeValidImportResult(received) {
    const pass = (
      received &&
      typeof received === 'object' &&
      typeof received.success === 'boolean' &&
      received.imported &&
      typeof received.imported.expenses === 'number' &&
      typeof received.imported.categories === 'number' &&
      received.skipped &&
      typeof received.skipped.expenses === 'number' &&
      typeof received.skipped.categories === 'number' &&
      Array.isArray(received.errors)
    );

    return {
      message: () => pass
        ? `expected object not to be valid import result`
        : `expected object to be valid import result`,
      pass,
    };
  },

  toBeVisibleComponent(received) {
    const pass = (
      received &&
      received.nodeType === Node.ELEMENT_NODE &&
      received.offsetParent !== null &&
      getComputedStyle(received).display !== 'none' &&
      getComputedStyle(received).visibility !== 'hidden'
    );

    return {
      message: () => pass
        ? `expected element not to be visible`
        : `expected element to be visible`,
      pass,
    };
  },

  toHaveAccessibleLabel(received) {
    const pass = (
      received &&
      received.nodeType === Node.ELEMENT_NODE &&
      (
        received.getAttribute('aria-label') ||
        received.getAttribute('aria-labelledby') ||
        (received.tagName === 'INPUT' && received.labels && received.labels.length > 0) ||
        (received.tagName === 'BUTTON' && received.textContent.trim())
      )
    );

    return {
      message: () => pass
        ? `expected element not to have accessible label`
        : `expected element to have accessible label`,
      pass,
    };
  },

  toBeKeyboardNavigable(received) {
    const pass = (
      received &&
      received.nodeType === Node.ELEMENT_NODE &&
      received.tabIndex !== -1 &&
      !received.disabled
    );

    return {
      message: () => pass
        ? `expected element not to be keyboard navigable`
        : `expected element to be keyboard navigable`,
      pass,
    };
  },

  async toCompleteWithin(received, timeLimit) {
    let pass = false;
    let actualTime = 0;

    try {
      const startTime = performance.now();
      await received;
      actualTime = performance.now() - startTime;
      pass = actualTime <= timeLimit;
    } catch (error) {
      pass = false;
    }

    return {
      message: () => pass
        ? `expected operation not to complete within ${timeLimit}ms (completed in ${actualTime}ms)`
        : `expected operation to complete within ${timeLimit}ms (took ${actualTime}ms)`,
      pass,
    };
  },

  toHaveMemoryUsageBelow(received, limit) {
    const size = JSON.stringify(received).length;
    const pass = size < limit;

    return {
      message: () => pass
        ? `expected object not to have memory usage below ${limit} bytes (actual: ${size})`
        : `expected object to have memory usage below ${limit} bytes (actual: ${size})`,
      pass,
    };
  },

  toBeStoredInLocalStorage(received) {
    const pass = localStorage.getItem(received) !== null;

    return {
      message: () => pass
        ? `expected "${received}" not to be stored in localStorage`
        : `expected "${received}" to be stored in localStorage`,
      pass,
    };
  },

  toHaveStorageValue(received, expectedValue) {
    const storedValue = localStorage.getItem(received);
    let parsedValue;
    
    try {
      parsedValue = JSON.parse(storedValue);
    } catch {
      parsedValue = storedValue;
    }
    
    const pass = JSON.stringify(parsedValue) === JSON.stringify(expectedValue);

    return {
      message: () => pass
        ? `expected localStorage["${received}"] not to equal ${JSON.stringify(expectedValue)}`
        : `expected localStorage["${received}"] to equal ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(parsedValue)}`,
      pass,
    };
  },

  toBeIn(received, validValues) {
    const pass = validValues.includes(received);

    return {
      message: () => pass
        ? `expected ${received} not to be in [${validValues.join(', ')}]`
        : `expected ${received} to be in [${validValues.join(', ')}]`,
      pass,
    };
  }
});

export default {};