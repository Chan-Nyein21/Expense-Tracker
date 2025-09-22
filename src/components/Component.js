/**
 * Base Component Class for Expense Tracker
 * Purpose: Foundation class for all UI components with common functionality
 * Constitutional Requirements: Accessibility, error handling, state management
 */

/**
 * Base component class that all UI components extend
 */
export class Component {
  /**
   * Create a component
   * @param {Object} options - Component options
   * @param {HTMLElement} options.container - Container element
   * @param {Object} options.data - Initial data
   * @param {Object} options.events - Event handlers
   * @param {string} options.className - CSS class name
   * @param {Object} options.attributes - HTML attributes
   */
  constructor(options = {}) {
    this.container = options.container || null;
    this.options = options;
    this.state = {
      visible: true,
      disabled: false,
      data: options.data || {},
      ...options.initialState
    };
    
    // Event listeners registry
    this.eventListeners = new Map();
    this.boundEventHandlers = new Map();
    
    // Initialize component
    this.init();
  }

  /**
   * Initialize component (override in subclasses)
   */
  init() {
    // Default implementation
  }

  /**
   * Render the component to DOM
   * @returns {Promise<void>}
   */
  async render() {
    if (!this.container) {
      throw new Error('Component container is required');
    }

    try {
      // Create component structure
      await this.createStructure();
      
      // Bind event listeners
      this.bindEvents();
      
      // Apply initial state
      this.applyState();
      
      // Mark as rendered
      this.container.setAttribute('data-component-rendered', 'true');
      
      // Emit rendered event
      this.dispatchEvent('component:rendered', { component: this });
      
    } catch (error) {
      console.error('Component render error:', error);
      this.handleError(error);
    }
  }

  /**
   * Create the component's DOM structure (override in subclasses)
   */
  async createStructure() {
    // Default implementation - to be overridden
  }

  /**
   * Update component with new data
   * @param {Object} data - New data
   */
  update(data) {
    this.setState({ data: { ...this.state.data, ...data } });
  }

  /**
   * Destroy the component and clean up
   */
  destroy() {
    try {
      // Remove all event listeners
      this.removeAllEventListeners();
      
      // Clear DOM
      if (this.container) {
        this.container.innerHTML = '';
        this.container.removeAttribute('data-component-rendered');
      }
      
      // Clear references
      this.container = null;
      this.eventListeners.clear();
      this.boundEventHandlers.clear();
      
      // Emit destroyed event
      this.dispatchEvent('component:destroyed', { component: this });
      
    } catch (error) {
      console.error('Component destroy error:', error);
    }
  }

  /**
   * Set component state
   * @param {Object} newState - New state object
   */
  setState(newState) {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    // Apply state changes
    this.applyState();
    
    // Emit state change event
    this.dispatchEvent('component:statechange', {
      component: this,
      previousState,
      newState: this.state
    });
  }

  /**
   * Get current component state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Apply current state to DOM
   */
  applyState() {
    if (!this.container) return;

    // Apply visibility
    if (this.state.visible) {
      this.container.style.display = '';
      this.container.removeAttribute('aria-hidden');
    } else {
      this.container.style.display = 'none';
      this.container.setAttribute('aria-hidden', 'true');
    }

    // Apply disabled state
    if (this.state.disabled) {
      this.container.setAttribute('aria-disabled', 'true');
      const inputs = this.container.querySelectorAll('input, button, select, textarea');
      inputs.forEach(input => input.disabled = true);
    } else {
      this.container.removeAttribute('aria-disabled');
      const inputs = this.container.querySelectorAll('input, button, select, textarea');
      inputs.forEach(input => input.disabled = false);
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  addEventListener(event, handler, options = {}) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event).push({ handler, options });
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler to remove
   */
  removeEventListener(event, handler) {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event);
    const index = listeners.findIndex(listener => listener.handler === handler);
    
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllEventListeners() {
    // Remove DOM event listeners
    this.boundEventHandlers.forEach((handlers, element) => {
      if (element && element.removeEventListener && Array.isArray(handlers)) {
        handlers.forEach(handler => {
          element.removeEventListener(handler.event, handler.handler, handler.options);
        });
      }
    });

    // Clear event listener registry
    this.eventListeners.clear();
    this.boundEventHandlers.clear();
  }

  /**
   * Dispatch custom event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  dispatchEvent(eventName, data = {}) {
    if (!this.container) return;

    const event = new CustomEvent(eventName, {
      detail: data,
      bubbles: true,
      cancelable: true
    });

    this.container.dispatchEvent(event);

    // Also call registered event listeners
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName);
      listeners.forEach(({ handler, options }) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Bind DOM event listeners (override in subclasses)
   */
  bindEvents() {
    // Default implementation - to be overridden
  }

  /**
   * Bind DOM event with cleanup tracking
   * @param {HTMLElement} element - Element to bind to
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  bindDOMEvent(element, event, handler, options = {}) {
    if (!element || !element.addEventListener) return;

    const boundHandler = handler.bind(this);
    element.addEventListener(event, boundHandler, options);
    
    // Track for cleanup - support multiple events per element
    const elementKey = element;
    if (!this.boundEventHandlers.has(elementKey)) {
      this.boundEventHandlers.set(elementKey, []);
    }
    this.boundEventHandlers.get(elementKey).push({
      event,
      handler: boundHandler,
      options
    });
  }

  /**
   * Get component element
   * @returns {HTMLElement} Component container
   */
  getElement() {
    return this.container;
  }

  /**
   * Show component
   */
  show() {
    this.setState({ visible: true });
  }

  /**
   * Hide component
   */
  hide() {
    this.setState({ visible: false });
  }

  /**
   * Toggle component visibility
   */
  toggle() {
    this.setState({ visible: !this.state.visible });
  }

  /**
   * Enable component
   */
  enable() {
    this.setState({ disabled: false });
  }

  /**
   * Disable component
   */
  disable() {
    this.setState({ disabled: true });
  }

  /**
   * Handle component errors
   * @param {Error} error - Error to handle
   */
  handleError(error) {
    console.error('Component error:', error);
    
    // Emit error event
    this.dispatchEvent('component:error', {
      component: this,
      error
    });

    // Show error message in UI if container exists
    if (this.container) {
      this.showErrorMessage('An error occurred. Please try again.');
    }
  }

  /**
   * Show error message in component
   * @param {string} message - Error message
   */
  showErrorMessage(message) {
    if (!this.container) return;

    // Remove existing error messages
    const existingErrors = this.container.querySelectorAll('.component-error');
    existingErrors.forEach(error => error.remove());

    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'component-error';
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');
    errorElement.textContent = message;

    // Insert at top of container
    this.container.insertBefore(errorElement, this.container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.remove();
      }
    }, 5000);
  }

  /**
   * Clear error messages
   */
  clearErrors() {
    if (!this.container) return;

    const errorElements = this.container.querySelectorAll('.component-error, .field-error');
    errorElements.forEach(error => error.remove());
  }

  /**
   * Create HTML element with attributes
   * @param {string} tag - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {string} textContent - Text content
   * @returns {HTMLElement} Created element
   */
  createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });

    // Set text content
    if (textContent) {
      element.textContent = textContent;
    }

    return element;
  }

  /**
   * Find element within component
   * @param {string} selector - CSS selector
   * @returns {HTMLElement|null} Found element
   */
  findElement(selector) {
    return this.container ? this.container.querySelector(selector) : null;
  }

  /**
   * Find all elements within component
   * @param {string} selector - CSS selector
   * @returns {NodeList} Found elements
   */
  findElements(selector) {
    return this.container ? this.container.querySelectorAll(selector) : [];
  }
}