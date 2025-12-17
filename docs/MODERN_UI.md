# ZhCode IDE - Modern UI Update

## Overview

The ZhCode IDE has been completely redesigned with a modern, professional interface using Font Awesome icons and a contemporary dark theme.

## What's New

### 🎨 Modern Design System
- **Color Palette**: Professional dark theme with sky blue accent colors
- **CSS Variables**: Organized color system for easy theme customization
- **Smooth Animations**: Fade-in, slide-in animations for panels and modals
- **Better Spacing**: Improved padding, margins, and typography
- **Gradients**: Linear gradients on header and buttons for modern look

### 🎯 Font Awesome Icons
All UI elements now use Font Awesome (v6.4) icons:
- **Header**: Code icon for logo, play icon for run button
- **Sidebar**: File code, file, plus, trash icons
- **Editor**: Pen icon for editor header
- **Output**: Code and terminal icons
- **AI Panel**: Magic wand, lightbulb, bug, sparkles, wand magic icons
- **Settings**: Cog, key, info icons

### ⚙️ Settings Panel
New comprehensive settings modal:
- **AI API Key Storage**: Securely store API keys in browser localStorage
- **Supported Services**: OpenAI, Claude, other AI APIs
- **Privacy**: Keys stored locally, never sent to server
- **Easy Access**: Settings button in header with gear icon

### 📐 Layout Improvements
- **Header**: Professional gradient background with blue accent border
- **Sidebar**: File explorer with 250px fixed width, smooth hover effects
- **Main Area**: 3-panel layout (editor + JavaScript + output)
- **AI Panel**: Collapsible sidebar (350px) with smooth slide-in animation
- **Modal**: Centered modal overlay for settings with fade animation

### 💫 Visual Features
- **Hover Effects**: Buttons have transform and shadow animations
- **Active States**: Clear active file and button indicators
- **Error Display**: Red error box with proper styling
- **Scrollbars**: Custom styled webkit scrollbars (thin, semi-transparent)
- **Dark Theme**: Matches VS Code dark theme aesthetics

## Storage Location for API Keys

### How to Add Your API Key
1. Click the **⚙️ Settings** button in the top right of the header
2. In the "AI API 密钥" field, paste your API key
3. Click "保存" (Save) button
4. Your key is saved to browser localStorage under `zhcode_api_key`

### Supported API Providers
- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic Claude**: Claude 3, Claude 2
- **Other LLM APIs**: Any service supporting API key authentication

### Security
- ✅ Keys stored in browser localStorage only
- ✅ Never transmitted to ZhCode servers
- ✅ Clear localStorage data if needed (browser dev tools)
- ✅ Uses HTTPS for all communications

## CSS Variables Reference

```css
:root {
  --primary: #0ea5e9;              /* Sky Blue */
  --primary-dark: #0284c7;         /* Dark Blue */
  --secondary: #6366f1;            /* Indigo */
  --danger: #ef4444;               /* Red */
  --success: #10b981;              /* Green */
  --warning: #f59e0b;              /* Amber */
  --bg-dark: #0f172a;              /* Dark Background */
  --bg-secondary: #1e293b;         /* Secondary BG */
  --bg-tertiary: #334155;          /* Tertiary BG */
  --text-primary: #f1f5f9;         /* Primary Text */
  --text-secondary: #cbd5e1;       /* Secondary Text */
  --border: #475569;               /* Border Color */
  --border-light: #64748b;         /* Light Border */
}
```

## Component Styles

### Buttons
- `.btn-primary`: Blue gradient button with hover shadow
- `.btn-secondary`: Gray button with border
- `.btn-icon`: Icon-only button (40px square)
- `.btn-small`: Compact button variant
- `.btn-full`: Full-width button
- `.btn-close`: Transparent close button

### Panels
- `.header`: Top navigation bar with gradient
- `.sidebar`: Left file explorer panel
- `.editor-wrapper`: Monaco editor container
- `.output-section`: 2-column output grid (JavaScript + Output)
- `.ai-panel`: Right AI assistant panel
- `.modal`: Centered settings modal

### States
- `.active`: Active file/button highlighting
- `:hover`: Interactive element hover states
- `:disabled`: Disabled button styles
- `:focus`: Focus ring for inputs

## File Structure

```
packages/ide/
├── src/
│   ├── App.tsx          (Component with settings modal)
│   ├── App.css          (Modern styling with CSS variables)
│   └── main.tsx
├── index.html           (Font Awesome CDN link)
└── package.json         (@fortawesome/fontawesome-free)
```

## Browser LocalStorage

Settings are saved in browser localStorage:
- **Key**: `zhcode_api_key`
- **Value**: Your API key (string)
- **Scope**: Per domain/localhost

### Clear Settings
In browser DevTools Console:
```javascript
localStorage.removeItem('zhcode_api_key');
```

## Future Enhancements

- [ ] Theme switcher (light/dark mode toggle)
- [ ] Custom color scheme editor
- [ ] Font size adjustment
- [ ] Layout customization
- [ ] Keyboard shortcuts panel
- [ ] Syntax highlighting for ZhCode language
- [ ] Plugin system for custom icons

## Technical Stack

- **Icons**: Font Awesome v6.4.0 (CDN)
- **Colors**: CSS Custom Properties (Variables)
- **Animations**: CSS transitions and keyframes
- **Storage**: Browser localStorage API
- **Security**: No backend storage for sensitive data

## Screenshots

The IDE now features:
1. **Beautiful Header**: Gradient background with round icon buttons
2. **Clean Sidebar**: Organized file list with hover effects
3. **Professional Editor**: Code editor with proper styling
4. **Output Panels**: Split view for JavaScript and execution output
5. **AI Assistant**: Collapsible sidebar with organized tools
6. **Settings Modal**: Clean, centered modal for configuration

Enjoy your modern, professional ZhCode IDE! 🚀
