/**
 * ShortcutDataStore - Manages persistence of shortcut configurations
 * @class
 * @version 1.0.0
 */
class ShortcutDataStore {
  constructor() {
    this.STORAGE_KEY = 'ods-shortcuts';
    this.cache = null;
    this.SCHEMA_VERSION = '1.0.0';
  }

  /**
   * Load shortcuts from localStorage with validation
   * Returns empty array if corrupted or missing
   */
  load() {
    if (this.cache !== null) {
      return this.cache;
    }
    
    try {
      const rawData = localStorage.getItem(this.STORAGE_KEY);
      if (!rawData) {
        this.cache = [];
        return this.cache;
      }
      
      const parsed = JSON.parse(rawData);
      const shortcuts = Array.isArray(parsed) ? parsed : [];
      this.cache = this.validateShortcuts(shortcuts);
      return this.cache;
      
    } catch (error) {
      console.error('Failed to load shortcuts:', error);
      this.cache = [];
      this.save([]);
      return this.cache;
    }
  }

  /**
   * Save shortcuts to localStorage
   * Validates and reindexes before saving
   */
  save(shortcuts) {
    try {
      const validated = this.validateShortcuts(shortcuts);
      const reindexed = this.reindexPositions(validated);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reindexed));
      this.cache = reindexed;
      this.dispatchChangeEvent(reindexed);
      
      return true;
    } catch (error) {
      console.error('Failed to save shortcuts:', error);
      return false;
    }
  }

  /**
   * Get a specific shortcut by modal ID
   */
  getShortcut(modalId) {
    const shortcuts = this.load();
    return shortcuts.find(s => s.action?.target === modalId) || null;
  }

  /**
   * Get only enabled shortcuts
   */
  getEnabledShortcuts() {
    const shortcuts = this.load();
    return shortcuts.filter(s => s.enabled === true);
  }

  /**
   * Toggle shortcut on/off
   * Creates new if doesn't exist and enabled=true
   */
  toggle(modalId, enabled, modalTitle = '') {
    const shortcuts = this.load();
    let shortcut = shortcuts.find(s => s.action?.target === modalId);
    
    if (!shortcut && enabled) {
      // Create new shortcut
      const now = new Date().toISOString();
      shortcut = {
        id: `shortcut-${modalId}`,
        label: this.generateDefaultLabel(modalTitle),
        enabled: true,
        action: {
          type: 'modal',
          target: modalId
        },
        position: shortcuts.length,
        visible: true,
        created_at: now,
        updated_at: now
      };
      shortcuts.push(shortcut);
    } else if (shortcut) {
      shortcut.enabled = enabled;
      shortcut.updated_at = new Date().toISOString();
    }
    
    return this.save(shortcuts);
  }

  /**
   * Update shortcut label
   * Validates and truncates to 20 chars
   */
  updateLabel(modalId, label) {
    const shortcuts = this.load();
    const shortcut = shortcuts.find(s => s.action?.target === modalId);
    
    if (!shortcut) {
      return false;
    }
    
    // Validate label
    let validLabel = (label || '').trim();
    if (!validLabel) {
      validLabel = 'XX';
    } else if (validLabel.length > 20) {
      validLabel = validLabel.substring(0, 20);
    }
    
    shortcut.label = validLabel;
    shortcut.updated_at = new Date().toISOString();
    
    return this.save(shortcuts);
  }

  /**
   * Remove a shortcut completely
   */
  remove(modalId) {
    const shortcuts = this.load();
    const index = shortcuts.findIndex(s => s.action?.target === modalId);
    
    if (index === -1) {
      return false;
    }
    
    shortcuts.splice(index, 1);
    return this.save(shortcuts);
  }

  /**
   * Clear all shortcuts
   */
  clear() {
    return this.save([]);
  }

  /**
   * Generate default label from modal title
   * Takes first letter of each word, max 3 chars
   */
  generateDefaultLabel(title) {
    if (!title) return 'XX';
    
    const words = title.trim().split(/\s+/);
    const letters = words.map(w => w[0]).join('').toUpperCase();
    return letters.substring(0, 3) || 'XX';
  }

  /**
   * Validate and repair shortcuts array
   */
  validateShortcuts(shortcuts) {
    if (!Array.isArray(shortcuts)) {
      return [];
    }
    
    const now = new Date().toISOString();
    
    return shortcuts
      .filter(s => s && typeof s === 'object' && s.action?.target)
      .map(s => ({
        id: s.id || `shortcut-${s.action.target}`,
        label: this.validateLabel(s.label),
        enabled: Boolean(s.enabled),
        action: {
          type: s.action.type || 'modal',
          target: s.action.target
        },
        position: Number(s.position) || 0,
        visible: s.visible !== false,
        created_at: s.created_at || now,
        updated_at: s.updated_at || now
      }));
  }

  /**
   * Validate individual label
   */
  validateLabel(label) {
    if (!label) return 'XX';
    
    let cleaned = String(label).trim();
    if (!cleaned) return 'XX';
    if (cleaned.length > 20) {
      cleaned = cleaned.substring(0, 20);
    }
    
    return cleaned;
  }

  /**
   * Ensure positions are sequential 0,1,2...
   */
  reindexPositions(shortcuts) {
    return shortcuts
      .sort((a, b) => a.position - b.position)
      .map((shortcut, index) => ({
        ...shortcut,
        position: index
      }));
  }

  /**
   * Dispatch change event for listeners
   */
  dispatchChangeEvent(shortcuts) {
    const event = new CustomEvent('shortcuts-updated', {
      detail: { 
        shortcuts: shortcuts,
        timestamp: Date.now()
      },
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Export data as JSON string
   */
  exportData() {
    const shortcuts = this.load();
    return JSON.stringify(shortcuts, null, 2);
  }

  /**
   * Import data from JSON string
   */
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      return this.save(data);
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  /**
   * Get storage size information
   */
  getStorageInfo() {
    const data = localStorage.getItem(this.STORAGE_KEY) || '';
    const count = this.load().length;
    
    return {
      bytes: new Blob([data]).size,
      kilobytes: (new Blob([data]).size / 1024).toFixed(2),
      shortcutCount: count,
      estimatedMax: 100
    };
  }
}

// Export for modules if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShortcutDataStore;
}