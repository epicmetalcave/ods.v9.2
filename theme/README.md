# ops.theme v2 Module

## Purpose
Provides centralized theming through CSS custom properties for the ODS Shell system.

## Philosophy
- **Simplicity**: Only 4 CSS variables
- **Consistency**: Single Terminal theme
- **Independence**: Works standalone or integrated
- **Performance**: <1ms initialization

## Files
- `constants.js`: Theme configuration
- `index.js`: Main module with initialization
- `test.html`: Standalone testing page

## Terminal Theme Values
```javascript
{
    backgroundColor: '#000000',  // Pure black
    textColor: '#00FF00',        // Bright green
    uiElementColor: '#00FF00',   // Bright green
    fontFamily: "'Share Tech Mono', monospace"
}
```

## Testing
Open `test.html` in browser to test theme module independently.

## Version History
- v2.0.0: Initial implementation with Terminal theme
- v3.0.0 (planned): User customization features