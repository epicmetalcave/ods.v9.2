# ops.theme v2 Integration Documentation

## Overview
ops.theme v2 provides a centralized theming system for the ODS Shell v9.2.1 through CSS custom properties.

## Version
- Shell Version: 9.2.1
- Theme Version: 2.0.0
- Integration Date: September 3, 2025

## Architecture

### Theme Module Structure
```
theme/
├── constants.js    # Theme configuration (Terminal theme)
├── index.js        # Theme initialization and API
└── test.html       # Standalone test page
```

### CSS Variables Provided
The theme system injects four CSS custom properties at the document root:

- `--theme-bg`: Background color (#000000)
- `--theme-text`: Text color (#00FF00)
- `--theme-ui`: UI element color (#00FF00)
- `--theme-font`: Font family ('Share Tech Mono', monospace)

### Integration Points
1. **HTML**: Theme scripts load before shell.js
2. **CSS**: shell.css uses CSS variables with fallbacks
3. **JavaScript**: Shell provides theme API methods
4. **Service Worker**: Caches theme files for offline use

## API Reference

### Global Objects
- `window.opsTheme`: Direct theme module access
- `window.odsShell`: Shell with theme integration

### Shell Theme Methods
```javascript
// Check if theme is available
window.odsShell.hasTheme()  // Returns: boolean

// Get complete theme information
window.odsShell.getTheme()  
// Returns: {
//   initialized: boolean,
//   version: string,
//   colors: object,
//   cssVariables: object
// }

// Get CSS variable references
window.odsShell.getThemeStyles()
// Returns: {
//   background: string,
//   text: string,
//   ui: string,
//   font: string
// }
```

### Direct Theme Methods
```javascript
// Initialize theme (auto-called on load)
window.opsTheme.init()

// Get Terminal theme configuration
window.opsTheme.getTheme()

// Get computed CSS variables
window.opsTheme.getCSSVariables()

// Verify theme application
window.opsTheme.verify()
```

## Usage for Mounted Systems

### Basic CSS Usage
```css
.my-component {
    background: var(--theme-bg, #000000);
    color: var(--theme-text, #00FF00);
    border: 1px solid var(--theme-ui, #00FF00);
    font-family: var(--theme-font, monospace);
}
```

### JavaScript Integration
```javascript
// Example mounted system
class MyMountedSystem {
    mount(mountPoint) {
        // Check theme availability
        if (window.odsShell.hasTheme()) {
            // Get theme styles
            const styles = window.odsShell.getThemeStyles();
            
            // Apply to elements
            this.element.style.background = styles.background;
            this.element.style.color = styles.text;
            
            // Or use CSS classes that use variables
            this.element.classList.add('themed-component');
        }
    }
}
```

## Offline Support
All theme resources are cached by the Service Worker:
- Theme JavaScript modules
- Google Fonts CSS
- Font falls back to monospace when offline

## Testing Theme Integration

### Verify Installation
```javascript
// In browser console
window.opsTheme.verify()  // Should log success
window.odsShell.state.themeInitialized  // Should be true
```

### Test Dynamic Theme Changes
```javascript
// Temporarily change colors (testing only)
document.documentElement.style.setProperty('--theme-text', 'red');
// Reset
window.opsTheme.init();
```

## Future Roadmap (v3)
- User-created themes
- Theme persistence in localStorage
- Theme switching UI
- Import/export themes

## Maintenance Notes
- Theme is independent of shell core
- CSS variables have fallbacks for graceful degradation
- Theme failure won't break shell functionality
- All modifications are additive (no breaking changes)

## File Modifications Summary
1. `index.html`: Added theme scripts and Google Fonts
2. `css/shell.css`: Replaced hardcoded colors with CSS variables
3. `js/shell.js`: Added theme state and API methods
4. `sw.js`: Added theme files to cache

## Production Notes
- Backup files removed after stability confirmed
- Console logging minimized to essential messages  
- Test file retained for maintenance purposes
- System verified for production use on September 3, 2025

## Support
For issues or questions about the theme integration, check:
1. Browser console for initialization messages
2. DevTools → Elements for CSS variables on html element
3. Cache Storage for theme file caching