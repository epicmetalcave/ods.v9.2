/**
 * CollapsibleContainer - Reusable collapsible UI component
 * @class
 * @description Provides instant expand/collapse with state persistence
 * @version 1.0.0
 */
class CollapsibleContainer {
  constructor(config = {}) {
    // Configuration
    this.id = config.id || `collapsible-${Date.now()}`;
    this.title = config.title || 'SECTION';
    this.storageKey = config.storageKey || 'collapsible-state';
    this.defaultExpanded = config.defaultExpanded !== undefined ? config.defaultExpanded : false;
    
    // State
    this.expanded = this.loadState();
    
    // DOM elements
    this.elements = {
      container: null,
      header: null,
      toggle: null,
      content: null,
      title: null
    };
    
    // Build on construction
    this.build();
  }
  
  /**
   * Build DOM structure
   * @returns {HTMLElement} Container element
   */
  build() {
    // Create container
    const container = document.createElement('div');
    container.className = 'collapsible-container';
    container.id = this.id;
    
    // Create header (always visible)
    const header = document.createElement('div');
    header.className = 'collapsible-container__header';
    
    // Create title
    const title = document.createElement('span');
    title.className = 'collapsible-container__title';
    title.textContent = this.title;
    
    // Create toggle arrow button
    const toggle = document.createElement('button');
    toggle.className = 'collapsible-container__toggle';
    toggle.innerHTML = this.expanded ? '▲' : '▼';
    toggle.setAttribute('aria-expanded', String(this.expanded));
    toggle.setAttribute('aria-label', `Toggle ${this.title}`);
    toggle.setAttribute('type', 'button');
    
    // Create content area
    const content = document.createElement('div');
    content.className = 'collapsible-container__content';
    
    // Set initial visibility (instant, no animation)
    if (!this.expanded) {
      content.style.display = 'none';
    }
    
    // Assemble DOM
    header.appendChild(title);
    header.appendChild(toggle);
    container.appendChild(header);
    container.appendChild(content);
    
    // Store element references
    this.elements.container = container;
    this.elements.header = header;
    this.elements.toggle = toggle;
    this.elements.content = content;
    this.elements.title = title;
    
    // Bind events
    this.bindEvents();
    
    return container;
  }
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Click header to toggle
    this.elements.header.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });
    
    // Prevent text selection on double-click
    this.elements.header.addEventListener('selectstart', (e) => {
      e.preventDefault();
    });
    
    // Keyboard support (Enter/Space on focused toggle)
    this.elements.toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }
  
  /**
   * Toggle expanded/collapsed state
   */
  toggle() {
    if (this.expanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  
  /**
   * Expand container (instant, no animation)
   */
  expand() {
    if (this.expanded) return;
    
    this.expanded = true;
    this.elements.content.style.display = 'block';
    this.elements.toggle.innerHTML = '▲';
    this.elements.toggle.setAttribute('aria-expanded', 'true');
    this.elements.header.setAttribute('data-expanded', 'true');
    
    this.saveState();
    this.dispatchEvent('expanded');
  }
  
  /**
   * Collapse container (instant, no animation)
   */
  collapse() {
    if (!this.expanded) return;
    
    this.expanded = false;
    this.elements.content.style.display = 'none';
    this.elements.toggle.innerHTML = '▼';
    this.elements.toggle.setAttribute('aria-expanded', 'false');
    this.elements.header.setAttribute('data-expanded', 'false');
    
    this.saveState();
    this.dispatchEvent('collapsed');
  }
  
  /**
   * Set content (replaces existing)
   * @param {HTMLElement|string} content - Content to set
   */
  setContent(content) {
    if (typeof content === 'string') {
      this.elements.content.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.elements.content.innerHTML = '';
      this.elements.content.appendChild(content);
    }
  }
  
  /**
   * Append content
   * @param {HTMLElement} element - Element to append
   */
  appendChild(element) {
    if (element instanceof HTMLElement) {
      this.elements.content.appendChild(element);
    }
  }
  
  /**
   * Get container element
   * @returns {HTMLElement} Container element
   */
  getElement() {
    return this.elements.container;
  }
  
  /**
   * Get content area element
   * @returns {HTMLElement} Content element
   */
  getContentElement() {
    return this.elements.content;
  }
  
  /**
   * Mount to parent element
   * @param {HTMLElement} parent - Parent element
   */
  mount(parent) {
    if (parent && parent instanceof HTMLElement && this.elements.container) {
      parent.appendChild(this.elements.container);
    }
  }
  
  /**
   * Unmount from DOM
   */
  unmount() {
    if (this.elements.container && this.elements.container.parentNode) {
      this.elements.container.parentNode.removeChild(this.elements.container);
    }
  }
  
  /**
   * Update title
   * @param {string} newTitle - New title text
   */
  setTitle(newTitle) {
    this.title = newTitle;
    if (this.elements.title) {
      this.elements.title.textContent = newTitle;
    }
  }
  
  /**
   * Load state from localStorage
   * @returns {boolean} Expanded state
   */
  loadState() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        if (data && typeof data === 'object' && this.id in data) {
          return Boolean(data[this.id]);
        }
      }
    } catch (e) {
      console.error('Failed to load collapsible state:', e);
    }
    return this.defaultExpanded;
  }
  
  /**
   * Save state to localStorage
   */
  saveState() {
    try {
      let data = {};
      const stored = localStorage.getItem(this.storageKey);
      
      if (stored) {
        try {
          data = JSON.parse(stored);
        } catch (e) {
          data = {};
        }
      }
      
      data[this.id] = this.expanded;
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save collapsible state:', e);
    }
  }
  
  /**
   * Clear saved state
   */
  clearState() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        delete data[this.id];
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to clear state:', e);
    }
  }
  
  /**
   * Dispatch custom event
   * @param {string} eventType - Type of event (expanded/collapsed)
   */
  dispatchEvent(eventType) {
    const event = new CustomEvent(`collapsible-${eventType}`, {
      detail: {
        id: this.id,
        title: this.title,
        expanded: this.expanded
      },
      bubbles: true
    });
    
    if (this.elements.container) {
      this.elements.container.dispatchEvent(event);
    }
  }
  
  /**
   * Check if expanded
   * @returns {boolean} Expanded state
   */
  isExpanded() {
    return this.expanded;
  }
  
  /**
   * Destroy and cleanup
   */
  destroy() {
    this.clearState();
    this.unmount();
    this.elements = {};
  }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CollapsibleContainer;
}