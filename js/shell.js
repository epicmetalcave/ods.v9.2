/**
 * ODS Shell v9.2.1
 * Minimal infrastructure for PWA foundation
 * 
 * Integrated Systems:
 * - ops.theme v2: Provides CSS variables for consistent theming
 *   Access via: window.odsShell.getTheme() or CSS variables
 * 
 * Theme CSS Variables Available:
 * --theme-bg: Background color (#000000)
 * --theme-text: Text color (#00FF00)
 * --theme-ui: UI element color (#00FF00)
 * --theme-font: Font family (Share Tech Mono)
 */

class ODSShell {
    constructor() {
        this.version = '9.2';
        this.initialized = false;
        this.mountPoints = {};
        this.state = {
            initialized: false,
            mountPointsReady: false,
            errorCount: 0,
            serviceWorkerActive: false,
            pwaInstallable: false,
            pwaInstalled: false,
            // Theme integration
            themeInitialized: false,
            themeVersion: '2.0'
        };
        this.deferredPrompt = null;
    }
    
    /**
     * Initialize the shell system
     */
    async init() {
        console.log('ODS Shell v9.2 Initializing...');
        
        try {
            // Register service worker first
            await this.registerServiceWorker();
            
            // Initialize storage
            this.initStorage();
            
            // Set up PWA install handling
            this.initPWA();
            
            // Set up mounting points
            this.prepareMountPoints();
            
            // Mark as initialized
            this.state.initialized = true;
            this.initialized = true;
            
            // Check if theme module is available and initialized
            if (window.opsTheme && window.opsTheme.initialized) {
                this.state.themeInitialized = true;
                console.log('ODS Shell: Theme system detected and integrated');
            }
            
            console.log('ODS Shell Ready');
            
        } catch (error) {
            console.error('Shell initialization failed:', error);
            this.state.errorCount++;
        }
    }
    
    /**
     * Register service worker for offline capability
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker: Registered');
                
                // Track registration state
                if (registration.active) {
                    this.state.serviceWorkerActive = true;
                }
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    console.log('Service Worker: Update found');
                });
                
            } catch (error) {
                console.warn('Service Worker: Registration failed', error);
                // Non-critical - continue without SW
            }
        } else {
            console.log('Service Worker: Not supported');
        }
    }
    
    /**
     * Test localStorage availability
     */
    initStorage() {
        const testKey = 'ods-shell-init';
        try {
            localStorage.setItem(testKey, this.version);
            localStorage.removeItem(testKey);
            console.log('Storage: Available');
        } catch (error) {
            console.warn('Storage: Not available', error);
            // Non-critical - continue without storage
        }
    }
    
    /**
     * Initialize PWA installation handling
     */
    initPWA() {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.state.pwaInstalled = true;
            console.log('PWA: Already installed');
            return;
        }
        
        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent default install prompt
            e.preventDefault();
            // Store for later use
            this.deferredPrompt = e;
            this.state.pwaInstallable = true;
            console.log('PWA: Installation available');
        });
        
        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            this.state.pwaInstalled = true;
            this.state.pwaInstallable = false;
            this.deferredPrompt = null;
            console.log('PWA: Installation complete');
        });
    }
    
    /**
     * Trigger PWA installation
     * Call this from UI when user wants to install
     */
    async installPWA() {
        if (!this.deferredPrompt) {
            console.log('PWA: Installation not available');
            return false;
        }
        
        // Show the install prompt
        this.deferredPrompt.prompt();
        
        // Wait for user choice
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`PWA: User ${outcome} installation`);
        
        // Clear the deferred prompt
        this.deferredPrompt = null;
        this.state.pwaInstallable = false;
        
        return outcome === 'accepted';
    }
    
    /**
     * Prepare mount points for future systems
     */
    prepareMountPoints() {
        // Get mount point elements
        const shortcutMount = document.getElementById('shortcut-bar-mount');
        const dashboardMount = document.getElementById('dashboard-mount');
        
        // Verify both exist
        if (!shortcutMount || !dashboardMount) {
            console.error('Mount points not found');
            this.state.errorCount++;
            throw new Error('Critical: Mount points missing');
        }
        
        // Store references
        this.mountPoints = {
            shortcutBar: shortcutMount,
            dashboard: dashboardMount
        };
        
        // Add placeholder content for testing
        shortcutMount.innerHTML = '<div class="placeholder">Shortcut Bar Mount Point Ready</div>';
        dashboardMount.innerHTML = '<div class="placeholder">Dashboard Mount Point Ready</div>';
        
        // Mark mount points as ready
        this.state.mountPointsReady = true;
        
        console.log('Mount Points: Ready');
    }
    
    /**
     * Get current shell state
     */
    getState() {
        return {
            version: this.version,
            ...this.state,
            health: this.state.errorCount === 0 ? 'healthy' : 'degraded'
        };
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global shell instance
    window.odsShell = new ODSShell();
    
    // Initialize the shell
    window.odsShell.init();
    
    // Add theme-related methods to the shell API
    
    // Method to get current theme information
    window.odsShell.getTheme = function() {
        // Return theme data if available
        if (window.opsTheme && window.opsTheme.initialized) {
            return {
                initialized: true,
                version: window.odsShell.state.themeVersion,
                colors: window.opsTheme.getTheme(),
                cssVariables: {
                    '--theme-bg': getComputedStyle(document.documentElement)
                        .getPropertyValue('--theme-bg').trim(),
                    '--theme-text': getComputedStyle(document.documentElement)
                        .getPropertyValue('--theme-text').trim(),
                    '--theme-ui': getComputedStyle(document.documentElement)
                        .getPropertyValue('--theme-ui').trim(),
                    '--theme-font': getComputedStyle(document.documentElement)
                        .getPropertyValue('--theme-font').trim()
                }
            };
        }
        return {
            initialized: false,
            version: null,
            colors: null,
            cssVariables: null
        };
    };
    
    // Method to check if theme is available
    window.odsShell.hasTheme = function() {
        return window.opsTheme && window.opsTheme.initialized;
    };
    
    // Method for mounted systems to get theme-aware styles
    window.odsShell.getThemeStyles = function() {
        return {
            background: 'var(--theme-bg, #000000)',
            text: 'var(--theme-text, #00FF00)',
            ui: 'var(--theme-ui, #00FF00)',
            font: 'var(--theme-font, monospace)'
        };
    };
});