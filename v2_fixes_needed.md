# V2 HomeScreenV2 Fixes Needed

## Current state (broken):
- Line 107-108: Logo icon uses `<Wrench>` inside a red square — should use the Groupmotors logo image
- Line 110: "Qaraj" text has no white shadow for visibility on dark hero image
- Line 122: Bell button uses transparent background — should use solid red (colors.primary)
- Line 124: Bell icon color is conditional — should always be white on red background
- Line 115-119: Groupmotors logo is in headerRight (next to bell) — should be the main logo on the LEFT

## What v1 does correctly:
- Line 284: Uses `groupmotors-logo.jpg` as the main logo icon (left side)
- Line 288: "Qaraj" text has white color + textShadow for visibility
- Line 292: Bell button has `backgroundColor: colors.primary` (solid red)
- Line 294: Bell icon is always white

## Fix plan:
1. Replace Wrench icon with groupmotors-logo.jpg image on the left
2. Add textShadow to "Qaraj" text
3. Make bell background solid red (colors.primary)
4. Make bell icon always white
5. Remove the duplicate groupmotors logo from headerRight
