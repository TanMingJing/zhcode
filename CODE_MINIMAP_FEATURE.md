# Code Minimap Feature Implementation

## Overview
Added a real-time code minimap preview in the top-right corner of the ZhCode IDE that shows:
- A visual representation of the entire code file
- Current viewport position highlighted in blue
- Scroll percentage indicator
- Line count display
- Click-to-jump navigation

## Files Created

### 1. **CodeMinimap.tsx** - Main Component
- Location: `packages/ide/src/components/CodeMinimap.tsx`
- Features:
  - Canvas-based rendering for performance
  - Syntax highlighting (brackets, numbers, strings)
  - Real-time viewport tracking
  - Click-to-jump-to-line functionality
  - Automatic scroll synchronization

### 2. **CodeMinimap.css** - Styling
- Location: `packages/ide/src/components/CodeMinimap.css`
- Includes:
  - Modern glassmorphism design
  - Responsive layout
  - Smooth animations
  - Dark theme compatibility

## Integration

### Updated Files
- **App.tsx** - Added CodeMinimap component to the main layout

## Features

### Visual Elements
```
┌─────────────────────┐
│ 🗺️ Preview   0%    │  ← Header with title and position
├─────────────────────┤
│                     │
│  [Canvas Minimap]   │  ← Visual code representation
│  with viewport box  │     Shows current view in blue
│                     │
├─────────────────────┤
│    124 lines        │  ← Footer with line count
└─────────────────────┘
```

### Interactions
1. **View Position**: Blue highlight box shows which part is currently visible
2. **Percentage**: Shows scroll position as percentage (0-100%)
3. **Click to Jump**: Click anywhere on minimap to jump to that location
4. **Auto-Update**: Updates automatically as you scroll through the code

## Technical Details

### Syntax Highlighting Colors
- **Brackets** `{}[]()`: Purple (#667eea)
- **Numbers**: Yellow (#f7df1e)
- **Strings**: Green (#10b981)
- **Default text**: Light gray (#e0e0e0)

### Performance Optimizations
- Canvas rendering for efficient drawing
- Passive scroll listeners to avoid blocking
- Debounced updates with 100ms timeout
- Only renders when visible

### Responsive Design
- Width: 160px (adjusts to 140px on screens < 900px)
- Height: 300px canvas
- Fixed position relative to viewport
- Smooth slide-in animation

## Usage

The minimap automatically appears in the top-right corner of the editor and:
1. **Displays** a miniature view of your entire code file
2. **Highlights** the current viewport with a blue box
3. **Shows** scroll progress as a percentage
4. **Allows** clicking to jump to specific code sections
5. **Updates** in real-time as you scroll or edit code

## Future Enhancements

Possible improvements:
- Toggle minimap visibility via settings
- Adjustable minimap size
- Syntax highlighting mode selection
- Search/highlight features
- Custom color themes for minimap

## Browser Compatibility
- Modern browsers with HTML5 Canvas support
- Chrome, Firefox, Safari, Edge (latest versions)
