/**
 * ModalSettings - Base class for all modal settings panels
 * @class
 * @description Provides common functionality for modal settings
 * @version 1.0.0
 */
class ModalSettings {
  constructor(config = {}) {
    // Configuration
    this.modalId = config.modalId || 'unknown-modal';
    this.modalTitle = config.modalTitle || 'Unknown';
    this.title = config.title || 'MODULE SETTINGS';
    this.storageKey = config.storageKey || 'modal-settings-state';
    this.defaultExpanded = config.defaultExpanded !== undefined ? config.defaultExpanded : false;
    
    // Callbacks
    this.onUpdate = config.onUpdate || (() => {});
    
    // Create base collapsible container
    this.container = new CollapsibleContainer({
      id: this.generateId(),
      title: this.title,
      storageKey: this.storageKey,
      defaultExpanded: this.defaultExpanded
    });
    
    // Element references
    this.elements = {
      wrapper: null,
      sections: []
    };
    
    // Event handling
    this.eventHandlers = [];
    
    // Build base structure
    this.buildBaseStructure();
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Generate unique ID for this settings panel
   * @protected
   */
  generateId() {
    return `modal-settings-${this.modalId}`;
  }
  
  /**
   * Build base structure
   * @protected
   */
  buildBaseStructure() {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'modal-settings__wrapper';
    this.elements.wrapper = wrapper;
    
    // Set initial content
    this.container.setContent(wrapper);
  }
  
  /**
   * Initialize - override in subclasses
   * @protected
   */
  initialize() {
    // Override in subclasses for specific initialization
  }
  
  /**
   * Add a section to the settings panel
   * @param {HTMLElement|string} section - Section to add
   * @param {string} className - Optional class name
   * @returns {HTMLElement} The section element
   */
  addSection(section, className = '') {
    let sectionElement;
    
    if (typeof section === 'string') {
      sectionElement = document.createElement('div');
      sectionElement.innerHTML = section;
    } else if (section instanceof HTMLElement) {
      sectionElement = section;
    } else {
      return null;
    }
    
    if (className) {
      sectionElement.className = className;
    }
    
    this.elements.wrapper.appendChild(sectionElement);
    this.elements.sections.push(sectionElement);
    
    return sectionElement;
  }
  
  /**
   * Add a description section
   * @param {string} text - Description text
   * @param {boolean} includeOrgLink - Include organization link
   * @returns {HTMLElement} Description element
   */
  addDescription(text, includeOrgLink = false) {
    const description = document.createElement('div');
    description.className = 'modal-settings__description';
    
    if (includeOrgLink) {
      description.innerHTML = `
        <p>${text}</p>
        <p>To rearrange items, use the <span class="modal-settings__link">Organization</span> module.</p>
      `;
    } else {
      description.innerHTML = `<p>${text}</p>`;
    }
    
    return this.addSection(description);
  }
  
  /**
   * Add a placeholder section
   * @param {string} text - Placeholder text
   * @param {string} className - Class name for the section
   * @returns {HTMLElement} Placeholder element
   */
  addPlaceholder(text, className) {
    const placeholder = document.createElement('div');
    placeholder.className = className;
    placeholder.innerHTML = `
      <div class="modal-settings__placeholder">
        ${text}
      </div>
    `;
    
    return this.addSection(placeholder);
  }
  
  /**
   * Register event handler
   * @param {string} event - Event name
   * @param {Function} handler - Handler function
   * @param {Element} element - Element to attach to (default: document)
   */
  registerEventHandler(event, handler, element = document) {
    const boundHandler = handler.bind(this);
    element.addEventListener(event, boundHandler);
    
    this.eventHandlers.push({
      event,
      handler: boundHandler,
      element
    });
  }
  
  /**
   * Dispatch custom event
   * @param {string} eventName - Event name
   * @param {Object} detail - Event detail
   */
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail: {
        modalId: this.modalId,
        ...detail,
        timestamp: Date.now()
      },
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Get DOM element
   * @returns {HTMLElement} Container element
   */
  getElement() {
    return this.container.getElement();
  }
  
  /**
   * Mount to parent
   * @param {HTMLElement} parent - Parent element
   */
  mount(parent) {
    this.container.mount(parent);
  }
  
  /**
   * Unmount from DOM
   */
  unmount() {
    this.container.unmount();
  }
  
  /**
   * Expand settings
   */
  expand() {
    this.container.expand();
  }
  
  /**
   * Collapse settings
   */
  collapse() {
    this.container.collapse();
  }
  
  /**
   * Toggle expanded state
   */
  toggle() {
    this.container.toggle();
  }
  
  /**
   * Check if expanded
   * @returns {boolean} Expanded state
   */
  isExpanded() {
    return this.container.isExpanded();
  }
  
  /**
   * Clean up event handlers
   * @protected
   */
  cleanupEventHandlers() {
    this.eventHandlers.forEach(({ event, handler, element }) => {
      element.removeEventListener(event, handler);
    });
    this.eventHandlers = [];
  }
  
  /**
   * Destroy and cleanup
   */
  destroy() {
    this.cleanupEventHandlers();
    this.container.destroy();
    this.elements = {};
  }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModalSettings;
}