/**
 * ops.theme v2
 * Provides CSS custom properties for consistent theming
 * Version: 2.0.0
 */

(function() {
    'use strict';

    // Load constants - assumes constants.js loads first
    const constants = window.themeConstants || {
        TERMINAL_THEME: {
            backgroundColor: '#000000',
            textColor: '#00FF00',
            uiElementColor: '#00FF00',
            fontFamily: "'Share Tech Mono', monospace"
        },
        CSS_VARIABLES: {
            '--theme-bg': '#000000',
            '--theme-text': '#00FF00',
            '--theme-ui': '#00FF00',
            '--theme-font': "'Share Tech Mono', monospace"
        }
    };

    // Create the global opsTheme object
    window.opsTheme = {
        // Current theme (v2 has only Terminal)
        TERMINAL: constants.TERMINAL_THEME,
        
        // Version info
        version: '2.0.0',
        
        // Initialization state
        initialized: false,
        
        /**
         * Initialize the theme system
         * Injects CSS custom properties at the document root
         */
        init: function() {
            if (this.initialized) {
                return;
            }

            try {
                // Get the document root element
                const root = document.documentElement;
                
                // Inject each CSS variable
                Object.entries(constants.CSS_VARIABLES).forEach(([property, value]) => {
                    root.style.setProperty(property, value);
                });
                
                // Mark as initialized
                this.initialized = true;
                
                // Log success
                console.log('ops.theme v2 initialized');
                
                // Return true for success
                return true;
                
            } catch (error) {
                console.error('ops.theme v2: Initialization failed', error);
                return false;
            }
        },
        
        /**
         * Get current theme values
         * Useful for programmatic access
         */
        getTheme: function() {
            return this.TERMINAL;
        },
        
        /**
         * Get CSS variable values as computed by browser
         * Useful for verification
         */
        getCSSVariables: function() {
            const computed = getComputedStyle(document.documentElement);
            return {
                '--theme-bg': computed.getPropertyValue('--theme-bg').trim(),
                '--theme-text': computed.getPropertyValue('--theme-text').trim(),
                '--theme-ui': computed.getPropertyValue('--theme-ui').trim(),
                '--theme-font': computed.getPropertyValue('--theme-font').trim()
            };
        },
        
        /**
         * Verify theme is properly applied
         */
        verify: function() {
            const vars = this.getCSSVariables();
            const allSet = Object.values(vars).every(v => v && v !== '');
            
            if (!allSet) {
                console.warn('ops.theme v2: Some variables not set', vars);
            }
            
            return allSet;
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.opsTheme.init();
        });
    } else {
        // DOM already loaded
        window.opsTheme.init();
    }

})();