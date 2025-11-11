# Theme Guide

## Overview

This project supports light and dark visual themes driven by custom CSS variables and a runtime theme toggler. The dark palette matches the original slate-based design, while light mode introduces soft neutrals to keep content readable without harsh contrast.

## Core Theme Variables (`frontend/src/styles.css`)

### Shared Base

- `--radius` tokens drive component border radii (`md`, `lg`, etc.).
- `@theme inline` maps these tokens to Tailwind CSS custom properties, exposing `bg-background`, `text-foreground`, `border-border`, etc.

### Dark Mode (default)

- `--background`: `oklch(0.145 0 0)` (≈ slate-950)
- `--foreground`: `oklch(0.985 0 0)` (white)
- `--card` / `--popover`: darker slates for surfaces
- `--primary`: bright cyan/sky accent (`oklch(0.922 0 0)`)
- `--muted`, `--accent`: slightly lighter slates for secondary panels
- `--border`, `--input`, `--ring`: rgba adjustments to maintain subtle outlines
- `--sidebar` set to `oklch(0.205 0 0)` for the navigation panel background

### Light Mode (`[data-theme="light"]`)

- `--background`: `oklch(0.97 0 0)` (soft light gray)
- `--foreground`: `oklch(0.2 0 0)` (dark slate text)
- `--card` / `--popover`: near-white
- `--primary`: `oklch(0.72 0.1 220)` (sky blue accent)
- `--muted`, `--accent`: pale neutrals to differentiate sections without heavy outlines
- `--border`, `--input`: light gray edges for cards and controls
- `--sidebar`: `oklch(0.98 0 0)` to keep the dashboard nav subtle on light backgrounds
- `body[data-theme='light']` also applies a faint grid background variation for contrast

## Theme Toggling (`frontend/src/routes/__root.tsx`)

- `ThemeContext` stores the current theme (`light` or `dark`) and exposes `toggleTheme`.
- The preference is hydrated from `localStorage` and updates both `document.body.dataset.theme` and a `dark` class on `<html>`.
- Routes use `useTheme()` to render toggles (landing navbar, dashboard top bar).
- The global footer is suppressed automatically for `'/dashboard'`, `'/lobby'`, and `'/meeting'` routes to avoid conflicting layouts.

## Component Styling Conventions

- Default (light) styles use `text-slate-700`, `bg-white`, `border-slate-200`, etc.; dark-specific overrides use `dark:` modifiers.
- Cards adopt `border-slate-200/70 bg-white shadow-sm dark:border-slate-900/60 dark:bg-slate-950/60` to stay consistent across modes.
- Buttons are configured with neutral borders in light mode and reuse original palette in dark mode.
- Utility sections (e.g., lobby permission tiles, meeting control bars) flip between light `bg-slate-100` and dark `bg-slate-900/40` backgrounds.

## Theme Usage by Route

- **Landing (`routes/index.tsx`)**: hero, highlights, and CTA sections support light background with `dark:` fallbacks.
- **Dashboard Layout (`routes/dashboard.tsx`)**: sidebar and top bar use light surfaces by default and switch to slate when dark.
- **Dashboard Pages** (`index.tsx`, `history.tsx`, `settings.tsx`, `meetings.tsx`): cards and stats use the new dual palettes while keeping original accent colors.
- **Lobby (`routes/lobby.tsx`) & Meeting (`routes/meeting.tsx`)**: no global footer; sections mix light neutrals or original dark surfaces depending on theme.

## Implementation Notes

- After toggling the theme, components automatically pick up the new palette via Tailwind utilities (`bg-background`, `dark:text-slate-100`, etc.).
- When adding new UI, follow the pattern of light defaults plus `dark:` overrides and ensure borders/backgrounds reference the tokenized colors to stay consistent.
