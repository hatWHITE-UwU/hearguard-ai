---
name: Sonic Obsidian
colors:
  surface: '#0d1516'
  surface-dim: '#0d1516'
  surface-bright: '#333a3c'
  surface-container-lowest: '#080f11'
  surface-container-low: '#151d1e'
  surface-container: '#192122'
  surface-container-high: '#242b2d'
  surface-container-highest: '#2e3638'
  on-surface: '#dce4e5'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#dce4e5'
  inverse-on-surface: '#2a3233'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c3f5ff'
  on-primary: '#00363d'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#006875'
  secondary: '#cdbdff'
  on-secondary: '#370096'
  secondary-container: '#5203d5'
  on-secondary-container: '#c0acff'
  tertiary: '#e2edfd'
  on-tertiary: '#26313d'
  tertiary-container: '#c6d1e0'
  on-tertiary-container: '#4f5a67'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#e8deff'
  secondary-fixed-dim: '#cdbdff'
  on-secondary-fixed: '#20005f'
  on-secondary-fixed-variant: '#4f00d0'
  tertiary-fixed: '#d8e4f3'
  tertiary-fixed-dim: '#bcc8d6'
  on-tertiary-fixed: '#111d27'
  on-tertiary-fixed-variant: '#3d4854'
  background: '#0d1516'
  on-background: '#dce4e5'
  surface-variant: '#2e3638'
typography:
  h1:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  h2:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Poppins
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Poppins
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Poppins
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Poppins
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 20px
  lg: 32px
  xl: 48px
  gutter: 16px
  margin: 24px
---

## Brand & Style

This design system is engineered for a high-tech, health-focused audience that values precision and modern aesthetics. The personality is professional, protective, and futuristic. It evokes a sense of calm reliability through its deep background while maintaining high energy through vibrant, glowing accents.

The visual style is a hybrid of **Modern Dark Mode** and **Glassmorphism**. It utilizes multi-layered depth where translucent "glass" panels float over a deep obsidian void. The use of luminous gradients and subtle glows suggests active intelligence and real-time monitoring, essential for a data-driven health application.

## Colors

The palette is centered on a high-contrast dark environment. The primary background is a deep, near-black navy to reduce eye strain and provide a canvas for vibrant elements. 

- **Primary & Secondary:** A neon duo of Electric Cyan and Deep Purple. These are used for primary actions, branding, and active data states. They often appear as linear gradients (Cyan to Purple) to imply motion and connectivity.
- **Surface Tones:** A lighter navy shade is used for cards and containers to create a "layered" effect against the true black background.
- **Status Indicators:** Semantic colors for Green (Healthy), Coral/Red (Critical), and Amber (Moderate) follow standard health-tech conventions but are slightly desaturated to prevent jarring visual noise in the dark interface.

## Typography

This design system uses **Poppins** exclusively to maintain a clean, professional, and geometric appearance. 

- **Hierarchy:** Large headlines use Semi-Bold weights to stand out against the dark background. 
- **Readability:** Body text should primarily use a soft white or light grey (#E0E0E0) to ensure high contrast without the harshness of pure white on black.
- **Labels:** Small labels and captions use Medium weights with slight letter-spacing to ensure legibility on smaller mobile displays.

## Layout & Spacing

The layout follows a **fluid grid** model optimized for mobile-first density. 

- **Grid:** A standard 4-column grid for mobile with 16px gutters.
- **Rhythm:** Spacing is built on an 8px baseline. Large margins (24px) are used at the edges of the screen to give the "glass" containers breathing room.
- **Density:** High-density data areas (like the history list) use 12px vertical spacing between items, while content-heavy areas use 20px to 32px to maintain a premium, airy feel.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and **Tonal Layering** rather than traditional drop shadows.

1.  **The Void (Level 0):** The deepest background (#0D1117).
2.  **Floating Panels (Level 1):** Cards and containers use a subtle fill (#1C2733) with a 1px inner border (10% white) to define the edge.
3.  **Glass Elements (Level 2):** Critical overlays use backdrop-blur (20px) and a semi-transparent background (15% white).
4.  **Luminous Glows:** Active elements (like the current dB gauge or selected buttons) should have a soft, colored outer glow using the primary accent color with a 20-30% opacity to simulate light emission.

## Shapes

The shape language is consistently **Rounded**. This softens the "technical" nature of the data and makes the app feel more accessible and human-centric.

- **Standard Containers:** Use a 16px (1rem) corner radius.
- **Interactive Elements:** Buttons and input fields use a slightly softer 12px (0.75rem) radius.
- **Progress Bars/Gauges:** These should always utilize fully rounded (pill-shaped) caps to maintain the fluid, organic feel of the sound-wave metaphors.

## Components

### Buttons
- **Primary:** Features a linear gradient from Cyan (#00E5FF) to Purple (#7C4DFF). Text is white with a subtle drop shadow for legibility.
- **Secondary/Ghost:** A simple 1px border using the primary color with no fill, or a semi-transparent glass fill.

### Inputs
- **Fields:** Deep navy backgrounds with a 1px border that glows Cyan when focused. Icons should be placed on the left for quick scanning.

### Data Visualizations
- **Gauges:** Multi-colored arcs (Green to Red) with a central digital readout. The needle or progress indicator should have a soft glow.
- **Line Charts:** Use smooth bezier curves rather than jagged lines. The area beneath the line should have a subtle gradient fade.

### Cards
- Cards must use the Level 1 elevation style. They should not have heavy shadows; instead, use a 1px border of #FFFFFF (10% opacity) to separate them from the background.

### Chips & Indicators
- Use small, rounded capsules for status (e.g., "Moderado," "Bajo"). These should have a low-opacity background fill of the status color and high-opacity text.
