/**
 * ODS Modal System v9.2
 * Core modal infrastructure for focused module operation
 */

// Import Module Settings
import { ModuleSettings } from './ods.settings.js';

/**
 * Manages runtime state for the modal system
 * Tracks active modal, prevents multiple modals, calculates durations
 */
class ModalState {
  constructor() {
    this.activeModalId = null;
    this.activeModuleId = null;
    this.openedAt = null;
    this.previousModalId = null;
    this.isTransitioning = false;
  }

  /**
   * Opens a modal if not transitioning
   * @param {string} modalId - The modal identifier
   * @param {string} moduleId - The module being displayed
   * @returns {boolean} Success status
   */
  open(modalId, moduleId) {
    // Prevent multiple modals
    if (this.isTransitioning || this.activeModalId) return false;
    
    this.isTransitioning = true;
    this.previousModalId = this.activeModalId;
    this.activeModalId = modalId;
    this.activeModuleId = moduleId;
    this.openedAt = Date.now();
    this.isTransitioning = false;
    
    return true;
  }

  /**
   * Closes the active modal
   * @returns {number} Duration in milliseconds
   */
  close() {
    const duration = this.openedAt ? Date.now() - this.openedAt : 0;
    
    this.activeModalId = null;
    this.activeModuleId = null;
    this.openedAt = null;
    
    return duration;
  }

  /**
   * Check if a modal is currently active
   * @returns {boolean}
   */
  isActive() {
    return this.activeModalId !== null;
  }
}

/**
 * Individual modal instance
 * Creates and manages the modal container with header, content area, and footer
 */
class Modal {
  constructor(config, system) {
    this.config = {
      id: config.id,                    // Required: unique modal ID
      title: config.title,              // Required: modal title
      moduleId: config.moduleId,        // Required: associated module
      closable: config.closable !== false,  // Default true
      showModuleSettings: config.showModuleSettings !== false, // Default true
      content: config.content || null,  // HTMLElement or string
      onOpen: config.onOpen || null,    // Callback
      onClose: config.onClose || null   // Callback
    };
    
    this.system = system;  // Reference to ModalSystem
    this.element = null;   // DOM element
    this.moduleSettings = null; // Module Settings instance
    
    this.build();
  }

  /**
   * Builds the modal DOM structure
   */
  build() {
    // Create container with 85% viewport sizing
    const container = document.createElement('div');
    container.className = 'modal-container';
    container.dataset.modalId = this.config.id;
    
    // Add header
    const header = this.buildHeader();
    container.appendChild(header);
    
    // Add content area
    const contentArea = this.buildContentArea();
    container.appendChild(contentArea);
    
    // Add footer (will contain Module Settings in later batches)
    const footer = this.buildFooter();
    container.appendChild(footer);
    
    this.element = container;
  }

  buildHeader() {
    const header = document.createElement('div');
    header.className = 'modal-header';
    
    // Title
    const title = document.createElement('h2');
    title.className = 'modal-header__title';
    title.textContent = this.config.title.toUpperCase();
    header.appendChild(title);
    
    // Close button (if closable)
    if (this.config.closable) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-header__close';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'Close modal');
      closeBtn.addEventListener('click', () => this.system.closeActive());
      header.appendChild(closeBtn);
    }
    
    return header;
  }

  buildContentArea() {
    const contentArea = document.createElement('div');
    contentArea.className = 'modal-content-area';
    
    if (this.config.content) {
      if (typeof this.config.content === 'string') {
        contentArea.innerHTML = this.config.content;
      } else {
        contentArea.appendChild(this.config.content);
      }
    }
    
    this.contentElement = contentArea;
    return contentArea;
  }

  buildFooter() {
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    
    // Add Module Settings if enabled
    if (this.config.showModuleSettings) {
      this.moduleSettings = new ModuleSettings(this.config.id);
      footer.appendChild(this.moduleSettings.render());
    }
    
    this.footerElement = footer;
    return footer;
  }

  /**
   * Opens this modal
   */
  open() {
    if (this.config.onOpen) {
      this.config.onOpen();
    }
  }

  /**
   * Closes this modal
   */
  close() {
    if (this.config.onClose) {
      this.config.onClose();
    }
  }

  /**
   * Updates the content area
   * @param {HTMLElement|string} content
   */
  setContent(content) {
    if (this.contentElement) {
      this.contentElement.innerHTML = '';
      
      if (typeof content === 'string') {
        this.contentElement.innerHTML = content;
      } else {
        this.contentElement.appendChild(content);
      }
    }
  }

  /**
   * Destroys the modal instance
   */
  destroy() {
    if (this.moduleSettings) {
      this.moduleSettings.destroy();
    }
    this.element = null;
    this.contentElement = null;
    this.footerElement = null;
  }
}

/**
 * Main orchestrator for all modals
 * Manages overlay, tracks active modal, handles global events
 */
class ModalSystem {
  constructor() {
    this.modals = new Map();      // Registry of all modals
    this.activeModal = null;      // Currently open modal
    this.overlay = null;          // Background overlay element
    this.state = new ModalState(); // Runtime state
    
    this.initOverlay();
    this.attachGlobalListeners();
    this.initializeSchema();
  }

  /**
   * Creates the overlay element
   */
  initOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.style.display = 'none';
    
    // Click outside to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.closeActive();
      }
    });
    
    document.body.appendChild(this.overlay);
  }

  /**
   * Attaches global event listeners
   */
  attachGlobalListeners() {
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isActive()) {
        this.closeActive();
      }
    });
  }

  /**
   * Initializes localStorage schema
   */
  initializeSchema() {
    const schemaVersion = '1.0.0';
    const storedVersion = localStorage.getItem('ods-modal-version');
    
    if (!storedVersion) {
      // First run initialization
      localStorage.setItem('ods-modal-version', schemaVersion);
      localStorage.setItem('modal-settings-state', '{}');
    }
  }

  /**
   * Registers a new modal
   * @param {Object} config - Modal configuration
   * @returns {Modal} The created modal instance
   */
  register(config) {
    const modal = new Modal(config, this);
    this.modals.set(config.id, modal);
    return modal;
  }

  /**
   * Opens a modal by ID
   * @param {string} modalId - The modal to open
   */
  open(modalId) {
    const modal = this.modals.get(modalId);
    
    if (!modal) {
      console.error(`Modal ${modalId} not found`);
      return;
    }
    
    // Prevent opening if another modal is active
    if (this.activeModal) {
      console.warn('Another modal is already open');
      return;
    }
    
    // Update state
    const opened = this.state.open(modalId, modal.config.moduleId);
    if (!opened) return;
    
    // Show overlay with modal
    this.overlay.innerHTML = '';
    this.overlay.appendChild(modal.element);
    this.overlay.style.display = 'flex';
    
    // Mark as active
    this.activeModal = modal;
    
    // Call modal's open handler
    modal.open();
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('modal-opened', {
      detail: {
        modalId: modalId,
        moduleId: modal.config.moduleId
      }
    }));
  }

  /**
   * Closes the active modal
   */
  closeActive() {
    if (!this.activeModal) return;
    
    const modalId = this.activeModal.config.id;
    const duration = this.state.close();
    
    // Call modal's close handler
    this.activeModal.close();
    
    // Hide overlay
    this.overlay.style.display = 'none';
    this.overlay.innerHTML = '';
    
    // Dispatch event
    document.dispatchEvent(new CustomEvent('modal-closed', {
      detail: {
        modalId: modalId,
        duration: duration
      }
    }));
    
    // Clear active modal
    this.activeModal = null;
  }

  /**
   * Gets a modal by ID
   * @param {string} modalId
   * @returns {Modal|undefined}
   */
  getModal(modalId) {
    return this.modals.get(modalId);
  }

  /**
   * Checks if a modal is registered
   * @param {string} modalId
   * @returns {boolean}
   */
  hasModal(modalId) {
    return this.modals.has(modalId);
  }

  /**
   * Unregisters a modal
   * @param {string} modalId
   */
  unregister(modalId) {
    const modal = this.modals.get(modalId);
    if (modal) {
      if (this.activeModal === modal) {
        this.closeActive();
      }
      modal.destroy();
      this.modals.delete(modalId);
    }
  }

  /**
   * Destroys the modal system
   */
  destroy() {
    this.closeActive();
    this.modals.forEach(modal => modal.destroy());
    this.modals.clear();
    
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}

// Create global modal system instance
window.ODS = window.ODS || {};
window.ODS.modalSystem = new ModalSystem();

// Export for module usage
export { ModalSystem, Modal, ModalState };