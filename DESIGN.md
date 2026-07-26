---
name: AUMINDS Concourse
summary: An operational learning system inspired by live rail information boards.
colors:
  platform-black: "#101214"
  board-black: "#171A1D"
  steel: "#2B3035"
  chalk: "#F1F0E8"
  muted-steel: "#9BA3AA"
  signal-amber: "#F3B61F"
  proceed-green: "#5FC88F"
  stop-red: "#EE6A5F"
typography:
  display:
    fontFamily: "Arial Narrow, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  data:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.04em"
rounded:
  sm: "2px"
  md: "4px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.signal-amber}"
    textColor: "{colors.platform-black}"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
  input:
    backgroundColor: "{colors.platform-black}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
---

# Design System: AUMINDS Concourse

## Overview

**Creative North Star: "The Concourse Board"**

AUMINDS behaves like a live learning concourse: every learner can see where they are, what departs next, and which work needs attention. Matte operational surfaces, fixed information columns, decisive status language, and one amber signal replace decorative glass, gradients, and generic SaaS cards.

**Key characteristics:** fixed-column rhythm; high information density; quiet matte materials; status-first copy; fast, restrained transitions.
## Colors

Signal Amber is reserved for current position and primary action. Chalk carries primary text; Muted Steel carries secondary information. Proceed Green, Stop Red, and delay amber are semantic states, never decoration.

**The One Signal Rule.** Routine screens use one active accent. Competing purple, blue, and pink accents are not part of this world.

## Typography

Display typography is compressed and assertive. Body copy is neutral and highly legible. Monospace appears only for times, ranks, points, identifiers, lesson duration, and system state.

**The Fixed Cell Rule.** Operational data aligns in stable columns so updates do not disturb scanning.

## Layout

Authenticated surfaces use a 264px desktop operations rail and a compact mobile header. Main workspaces are fluid with a maximum readable width, 8px base spacing, and ruled rows rather than card mosaics. Course content may use a secondary syllabus rail. On phones, columns collapse by priority: action and state remain visible first.

## Elevation & Depth

The system is flat by default. Depth comes from stepped tonal surfaces and 1px rules. Shadows are limited to overlays and keyboard focus; backdrop blur is prohibited.

## Shapes

Corners are mechanical: 2px for controls, 4px for containers, and 8px only for large overlays. Pills are limited to compact status labels.

## Components

### Buttons
Primary buttons are amber with black text and square-leaning corners. Secondary buttons are transparent with a steel rule. Hover changes tone without scaling.

### Cards / Containers
Cards exist only when content needs containment. Operational lists use rows, fixed columns, and separators. Containers never float or glow.

### Inputs / Fields
Fields use platform black, a steel border, clear labels, and an amber focus outline. Error text names the problem and recovery.

### Navigation
The desktop rail keeps destinations stable and shows the active destination as an amber board row. Mobile navigation uses an accessible sheet with the same order.

## Do's and Don'ts

### Do:
- **Do** expose current state and next action within the first viewport.
- **Do** use semantic rows, tables, and dividers for comparable information.
- **Do** preserve keyboard focus, reduced-motion behavior, and 44px touch targets.

### Don't:
- **Don't** use gradient text, decorative blur, glowing borders, or floating ambient orbs.
- **Don't** turn dashboards into equal-sized card mosaics.
- **Don't** use monospace for ordinary prose or icons as decoration.