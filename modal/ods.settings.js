/**
 * Module Settings Panel - ODS v9.2
 * Provides collapsible settings container in modal footer
 */

class ModuleSettings {
  constructor(modalId) {
    this.modalId = modalId;
    this.expanded = this.loadExpandedState();
    this.elements = {};
  }

  /**
   * Load saved expanded state from localStorage
   */
  loadExpandedState() {
    try {
      const states = JSON.parse(localStorage.getItem('modal-settings-state') || '{}');
      return states['module-settings'] || false;
    } catch (e) {
      console.error('Failed to load settings state:', e);
      return false;
    }
  }

  /**
   * Save expanded state to localStorage
   */
  saveExpandedState() {
    try {
      const states = JSON.parse(localStorage.getItem('modal-settings-state') || '{}');
      states['module-settings'] = this.expanded;
      localStorage.setItem('modal-settings-state', JSON.stringify(states));
    } catch (e) {
      console.error('Failed to save settings state:', e);
    }
  }

  /**
   * Toggle expanded/collapsed state
   */
  toggle() {
    this.expanded = !this.expanded;
    
    if (this.expanded) {
      this.expand();
    } else {
      this.collapse();
    }
    
    this.saveExpandedState();
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('settings-toggled', {
      detail: {
        modalId: this.modalId,
        panel: 'module-settings',
        expanded: this.expanded
      }
    }));
  }

  /**
   * Expand the settings panel
   */
  expand() {
    if (this.elements.content) {
      this.elements.content.hidden = false;
      this.elements.toggle.setAttribute('aria-expanded', 'true');
      this.elements.toggle.textContent = '▼';
    }
  }

  /**
   * Collapse the settings panel
   */
  collapse() {
    if (this.elements.content) {
      this.elements.content.hidden = true;
      this.elements.toggle.setAttribute('aria-expanded', 'false');
      this.elements.toggle.textContent = '▶';
    }
  }

  /**
   * Build the Module Settings DOM structure
   */
  render() {
    // Container
    const container = document.createElement('div');
    container.className = 'modal-settings';
    
    // Header (always visible)
    const header = this.buildHeader();
    container.appendChild(header);
    
    // Content (collapsible)
    const content = this.buildContent();
    container.appendChild(content);
    
    // Apply initial state
    if (this.expanded) {
      this.expand();
    }
    
    return container;
  }

  /**
   * Build the header section
   */
  buildHeader() {
    const header = document.createElement('div');
    header.className = 'modal-settings__header';
    
    // Title
    const title = document.createElement('span');
    title.className = 'modal-settings__title';
    title.textContent = 'MODULE SETTINGS';
    
    // Toggle button
    const toggle = document.createElement('button');
    toggle.className = 'modal-settings__toggle';
    toggle.textContent = this.expanded ? '▼' : '▶';
    toggle.setAttribute('aria-expanded', this.expanded ? 'true' : 'false');
    toggle.setAttribute('aria-label', 'Toggle module settings');
    toggle.setAttribute('type', 'button');
    
    // Add click handler to entire header
    header.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });
    
    header.appendChild(title);
    header.appendChild(toggle);
    
    this.elements.header = header;
    this.elements.toggle = toggle;
    
    return header;
  }

  /**
   * Build the content section
   */
  buildContent() {
    const content = document.createElement('div');
    content.className = 'modal-settings__content';
    content.hidden = !this.expanded;
    
    // Placeholder content for now
    const placeholder = document.createElement('div');
    placeholder.className = 'modal-settings__placeholder';
    
    const text = document.createElement('p');
    text.textContent = 'Universal Module Settings';
    text.style.margin = '0';
    text.style.padding = '12px 0';
    text.style.color = 'var(--theme-text, #00FF00)';
    text.style.fontFamily = 'var(--theme-font, "Share Tech Mono", monospace)';
    text.style.fontSize = '14px';
    
    placeholder.appendChild(text);
    content.appendChild(placeholder);
    
    this.elements.content = content;
    
    return content;
  }

  /**
   * Clean up
   */
  destroy() {
    this.elements = {};
  }
}

// Export for use in modal system
export { ModuleSettings };