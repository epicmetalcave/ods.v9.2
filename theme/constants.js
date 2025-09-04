/**
 * ops.theme v2 Constants
 * Defines the Terminal theme configuration
 */

// Terminal theme configuration - the single theme for v2
const TERMINAL_THEME = {
    backgroundColor: '#000000',
    textColor: '#00FF00',
    uiElementColor: '#00FF00',
    fontFamily: "'Share Tech Mono', monospace"
};

// CSS custom property mappings
const CSS_VARIABLES = {
    '--theme-bg': TERMINAL_THEME.backgroundColor,
    '--theme-text': TERMINAL_THEME.textColor,
    '--theme-ui': TERMINAL_THEME.uiElementColor,
    '--theme-font': TERMINAL_THEME.fontFamily
};

// Export for use in index.js
// Using old-school exports for compatibility with simple script tag loading
window.themeConstants = {
    TERMINAL_THEME,
    CSS_VARIABLES
};