/**
 * ShortcutSettings - Settings panel for configuring shortcuts
 * @class
 * @extends ModalSettings
 * @description Extends ModalSettings for shortcut-specific functionality
 * @version 2.0.0
 */
class ShortcutSettings extends ModalSettings {
  constructor(config = {}) {
    // Call parent constructor with shortcut-specific title
    super({
      ...config,
      title: 'SHORTCUT SETTINGS',
      storageKey: 'shortcut-settings-state'
    });
    
    // Shortcut-specific element references
    this.elements = {
      ...this.elements,
      description: null,
      toggleArea: null,
      inputArea: null,
      previewArea: null,
      positionArea: null
    };
  }
  
  /**
   * Initialize shortcut-specific content
   * @protected
   * @override
   */
  initialize() {
    this.buildShortcutContent();
    this.initializeShortcutEvents();
  }
  
  /**
   * Build shortcut-specific content
   * @private
   */
  buildShortcutContent() {
    // Add description with organization link
    this.elements.description = this.addDescription(
      'Toggling on shortcuts will enable shortcuts in the shortcut bar at the top of the app. New shortcuts will appear at the end of the line.',
      true // Include organization link
    );
    
    // Update organization link text
    if (this.elements.description) {
      const orgLink = this.elements.description.querySelector('.modal-settings__link');
      if (orgLink) {
        orgLink.textContent = 'Shortcut Organization';
      }
    }
    
    // Add toggle area placeholder
    this.elements.toggleArea = this.addPlaceholder(
      '[Toggle Checkbox Component Will Go Here]',
      'shortcut-settings__toggle-area'
    );
    
    // Add position area (hidden by default)
    const positionArea = document.createElement('div');
    positionArea.className = 'shortcut-settings__position-area';
    positionArea.style.display = 'none';
    positionArea.innerHTML = `
      <div class="modal-settings__placeholder">
        [Position Info Will Appear Here When Enabled]
      </div>
    `;
    this.elements.positionArea = this.addSection(positionArea);
    
    // Add input area placeholder
    this.elements.inputArea = this.addPlaceholder(
      '[Label Input Field Component Will Go Here]',
      'shortcut-settings__input-area'
    );
    
    // Add preview area placeholder
    this.elements.previewArea = this.addPlaceholder(
      '[Button Preview Component Will Go Here]',
      'shortcut-settings__preview-area'
    );
  }
  
  /**
   * Initialize shortcut-specific events
   * @private
   */
  initializeShortcutEvents() {
    // Register shortcut-specific event handlers
    this.registerEventHandler('shortcuts-updated', this.onShortcutUpdate);
    
    // Handle organization link clicks
    if (this.elements.description) {
      const orgLink = this.elements.description.querySelector('.modal-settings__link');
      if (orgLink) {
        orgLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.onOrganizeRequest();
        });
      }
    }
    
    console.log(`Shortcut events initialized for ${this.modalId}`);
  }
  
  /**
   * Handle shortcuts-updated events
   * @param {CustomEvent} event - Event from ShortcutDataStore
   */
  onShortcutUpdate(event) {
    console.log(`Shortcuts updated in ${this.modalId}:`, event.detail);
    
    if (event.detail && event.detail.shortcuts) {
      const shortcuts = event.detail.shortcuts;
      const myShortcut = shortcuts.find(s => s.action?.target === this.modalId);
      
      if (myShortcut) {
        console.log(`Found shortcut for ${this.modalId}:`, myShortcut);
        if (myShortcut.enabled) {
          this.updatePositionInfo(myShortcut.position, true);
        } else {
          this.updatePositionInfo(0, false);
        }
      }
    }
  }
  
  /**
   * Handle organize shortcuts request
   */
  onOrganizeRequest() {
    console.log(`Organize shortcuts requested from ${this.modalId}`);
    
    this.dispatchEvent('open-shortcut-organization', {
      source: this.modalId
    });
  }
  
  /**
   * Update position info display
   * @param {number} position - Current position
   * @param {boolean} show - Show/hide position info
   */
  updatePositionInfo(position, show = false) {
    if (show) {
      this.elements.positionArea.style.display = 'block';
      this.elements.positionArea.innerHTML = `
        <div class="shortcut-settings__position-info">
          Position ${position} → <span class="modal-settings__link">Organize shortcuts</span>
        </div>
      `;
      
      // Add click handler to organize link in position info
      const orgLink = this.elements.positionArea.querySelector('.modal-settings__link');
      if (orgLink) {
        orgLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.onOrganizeRequest();
        });
      }
    } else {
      this.elements.positionArea.style.display = 'none';
    }
  }
  
  // Placeholder methods for future component integration
  
  /**
   * Set toggle component (future implementation)
   * @param {Object} toggleComponent - Toggle checkbox component
   */
  setToggleComponent(toggleComponent) {
    console.log('Toggle component integration point');
  }
  
  /**
   * Set input component (future implementation)
   * @param {Object} inputComponent - Label input component
   */
  setInputComponent(inputComponent) {
    console.log('Input component integration point');
  }
  
  /**
   * Set preview component (future implementation)
   * @param {Object} previewComponent - Button preview component
   */
  setPreviewComponent(previewComponent) {
    console.log('Preview component integration point');
  }
  
  // Test methods (temporary)
  
  /**
   * Simulate toggle change (for testing only)
   */
  simulateToggle(enabled) {
    console.log(`Simulating toggle ${enabled ? 'ON' : 'OFF'} for ${this.modalId}`);
    
    this.dispatchEvent('shortcut-settings-change', {
      action: enabled ? 'enable' : 'disable',
      enabled: enabled,
      label: this.modalTitle.substring(0, 3).toUpperCase()
    });
    
    if (enabled) {
      const position = Math.floor(Math.random() * 10);
      this.updatePositionInfo(position, true);
    } else {
      this.updatePositionInfo(0, false);
    }
  }
  
  /**
   * Simulate label change (for testing only)
   */
  simulateLabelChange(label) {
    console.log(`Simulating label change to "${label}" for ${this.modalId}`);
    
    this.dispatchEvent('shortcut-settings-change', {
      action: 'update-label',
      label: label
    });
  }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShortcutSettings;
}